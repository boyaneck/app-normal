# appnormal 프로젝트


제목: appnormal 
"app normal(평범한 앱) 이지만 이 웹을 사용하는 이들의 특별한(abnormal)모습을 보여줌으로써 사람들과 소통을 도와주는 플랫폼"의 이중적 의미를 가짐 
한줄 소개 : 라이브 스트리머가 코파일럿을 이용하여 방송 가능한 라이브 스트리밍 웹사이트
주요 기능 : 지난 방송 통계 지표와 함께 AI 와 대화 가능 
            방송 종료 후 후원금액,시청자 수 등과 같은 지표를 직관적으로 확인하고 분석가능
            채팅, 후원 
            라이브 스트리머는 방송 중 생기는 데이터를 AI에게 전달, 유의미한 피드백으로 받아 방송의 질을 높일 수 있음


#### 주요기능
- Socket.IO 기반 실시간 채팅 구현, 이상 트래픽(스파이크) 감지
- PortOne V2 웹훅 서명 검증 및 Redis 기반 멱등성 처리로 결제 위변조,중복 처리 방지
- 방송 설정 및 실시간 시청 통계,후원 등 대시보드 구현 및 방송 데이터 기반 AI 대화 구현
- EMA 기반 실시간 이상 탐지 및  LLM 프롬프트 엔지니어링으로 방송 중 코칭 가능한 코파일럿 구현
### 아키텍쳐
 ```mermaid
  flowchart LR
      subgraph Client
          OBS["OBS<br/>방송 송출"]
          Web["Next.js<br/>시청자 · 호스트"]
      end

      subgraph Media
          LK["LiveKit Cloud"]
      end

      subgraph Backend
          API["Express<br/>REST · Webhook"]
          WS["Socket.io<br/>/chat · /copilot"]
          CP["Copilot<br/>EMA 감지 루프"]
      end

      subgraph Data
          Redis[("Redis<br/>실시간 집계")]
          DB[("Supabase<br/>인증 · 통계 · 결제")]
      end

      subgraph External
          Groq["Groq LLM"]
          PO["PortOne"]
      end

      OBS -->|RTMP| LK
      LK -->|WebRTC| Web
      LK -->|Webhook| API
      PO -->|"Webhook · 서명 검증"| API
      Web <-->|채팅| WS
      WS --> Redis
      API --> Redis
      API -->|방송 종료 시 저장| DB
      CP -->|2초마다 조회| Redis
      CP -->|급증 시 요청| Groq
      CP -->|피드백| WS
  ```

  ### 코파일럿 처리 흐름

  ```mermaid
  flowchart LR
      A["채팅 수 집계<br/>2초 간격"] --> B{"급증?<br/>z-score"}
      B -->|아니오| A
      B -->|예| C["채팅 분석<br/>질문 · 웃음 · 키워드"]
      C --> D["의도 결정<br/>규칙 기반"]
      D --> E["프롬프트 구성"]
      E --> F["Groq"]
      F --> G["호스트 화면"]
  ```


 ### 기술 스택과 선택이유
 - Next.js :
 - typescript
 - Socket.io
 - Redis
 - Livekit
 - Groq API
 - express

 -   │ Next.js   │ 서버 코드(서버 액션)를 같은 프로젝트에 둘 수 있어서, LiveKit 토큰처럼 비밀키가 필요한 작업을 브라우저에 노출하지 않고 처리 · 파일 기반 라우팅 · Vercel 배포가 간편  │
  │ Express   │ 가볍고 자유도가 높아 웹훅, 소켓, REST를 한 서버에 구성하기 쉬움 · 미들웨어로 라우트별 처리(예: 웹훅만 raw body로 받기) 가능 · 자료와 레퍼런스가 많음                │
  │ Socket.io │ 방(room)과 네임스페이스로 방송별 채팅과 호스트 전용 채널을 분리 · 연결이 끊기면 자동 재연결 · Redis 어댑터로 서버 여러 대 확장 가능                                 │
  │ Redis     │ 메모리 기반이라 쓰기와 읽기가 매우 빠름 → 방송 중 자주 바뀌는 수치에 적합 · 자료구조가 다양함(Sorted Set으로 시계열, Set으로 중복 없는 유저 집계) · TTL로 임시      │
  │           │ 데이터 자동 정리 · INCR, SETNX 같은 원자적 연산으로 속도 제한과 멱등성 처리                                                                                         │
  │ Supabase  │ PostgreSQL 기반이라 통계 조회와 집계를 SQL로 처리 · 인증(소셜 로그인)을 기본 제공 · 별도 DB 서버 관리 없이 사용                                                     │
  │ LiveKit   │ WebRTC 미디어 서버를 직접 운영하지 않아도 됨 · OBS(RTMP) 입력을 받는 Ingress 기본 제공 · 웹훅으로 방송과 시청자 이벤트를 받을 수 있음 · 토큰으로 권한(송출/시청)    │
  │           │ 제어                                                                                                                                                                │
  │ Groq      │ 응답이 매우 빠름(실시간 피드백에 중요) · OpenAI와 같은 API 형식이라 교체가 쉬움 · 무료 사용량으로 개발 가능                                                         │
  │ PortOne   │ 여러 PG사를 하나의 API로 연동 · 웹훅 서명 검증과 결제 재조회 API 제공          
 ### 핵심 구현 
##### 코파일럿: 2초(임의 설정)마다 채팅을 분석하고 유의미한 데이터로 판단 될 경우 프롬프트와 함께 AI(LLM)에게 보내 스트리머에게 도움될 만한 피드백을 하는 기능
- 2초마다 채팅 수를 EMA/EWVar 기반 z-score로 계산해 급증 여부 판단하여 급증했을 때만 분석/LLM 호출 하여 불필요한 API 비용 절
- 급증 시 채팅의 유형을 크게 3가지로 분류, 질문/웃음/반복으로 나눈 뒤  키워드를 추출
- 시청자 채팅은 태그로 분리해 프롬프트 인젝션 방어
- 규칙 기반으로 의도를 결정(질문 답변/ 반응 유도/ 화제 잡기) 후 Groq 프롬프트 구성하여 Groq에게 전달

  ##### 후원 결제시 위조/중복 방지
  - 서명검증:PortOne V2 웹훅의 HMAC 서명을 원문(raw-body)으로 검증하고, 5분 넘은 요청은 거부해 재전송 공격 방지
  - 금액 재조회:PortOne 서버에서 결제한 상태/금액을 다시 조회 해서 사용
  - 멱등성: Redis "SETNX"로 같은 결제 ID는 한 번만 처리(웹훅 재전송 클라이언ㅇ트 검증 요청 중복 대비)

##### 방송 통계
- Livekit 웹훅(입장/퇴장/시작/종료)이 올때 마다 Redis에 집계하고 방송 종료 시 한번에 계산해 supabase에 저장
- 저장된 통계와 이전 방송기록을 바탕으로 AI 대화 가능


##### 채팅
- 메시지를 받으면 방 전체에 전송하고, Redis 저장은 비동기로 처리
- Redis 지연/장애가 채팅 지연으로 이어지지 않도록 분리
- Redis 카운터로 유저별 초당메시지 수 제한, 서버에서 xxs 이스케이프 
 ### 트러블 슈팅


 ### 한계와 개선 계획
