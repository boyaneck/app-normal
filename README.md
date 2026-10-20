# appnormal 프로젝트


URL:https://app-normal-btjb.vercel.app/



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



### 🛠️ 기술 스택 및 도입 이유 (Tech Stack)

| 기술 | 선택 및 도입 이유 |
| :--- | :--- |
| **Next.js** | Server Actions로 보안 키(LiveKit Token 등) 노출을 방지하고, SSR과 Vercel 배포 이점 활용 |
| **TypeScript** | 실시간 소켓 이벤트 및 복잡한 데이터 구조의 타입 안전성 확보, 컴파일 타임 에러 사전 방지 |
| **Express** | 웹훅 Raw Body 파싱 등 미들웨어 자유도가 높고 REST API·소켓·웹훅을 단일 서버로 통합 구축 |
| **Socket.io** | Room/Namespace로 방송별 채널 분리, 자동 재연결 |
| **Redis** | In-Memory 기반 실시간 통계 집계, `SETNX` 원자적 연산을 활용한 결제 멱등성 및 Rate Limit 처리 |
| **Supabase** | PostgreSQL 기반 관계형 데이터 보관, SQL 통계 집계 및 소셜 인증(OAuth) 처리 |
| **LiveKit** | WebRTC 미디어 서버 직접 구축 부담 제거, OBS(RTMP) Ingress 및 웹훅 기반 방송 상태 제어 |
| **Groq API** | 초저지연 LLM 추론 속도로 실시간 코파일럿 피드백 구현 (OpenAI API 표준 호환) |
| **PortOne V2** | 단일 API 기반 PG 연동, 웹훅 HMAC 서명 검증 및 결제 재조회 API를 통한 결제 무결성 보장 |
  
 ### 핵심 구현 
##### 코파일럿: 2초(임의 설정)마다 채팅을 분석하고 유의미한 데이터 판단 될 경우 프롬프트와 함께 AI(LLM)에게 보내 스트리머에게 도움될 만한 피드백을 하는 기능
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
