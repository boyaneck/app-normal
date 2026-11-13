import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "./redis-keys.js";

/**
 * 방송 시뮬레이터 (테스트 전용)
 *
 * 실제 방송을 3분만 켜도, 3시간짜리 방송처럼 시청자/채팅/후원 데이터를 만들어 준다.
 *  - 실제 경로(LiveKit 웹훅, 채팅 소켓, 결제)를 거치지 않고, 그 경로들이 최종적으로 쓰는
 *    Redis 키에 같은 형식으로 직접 쓴다.
 *  - 그래서 코파일럿(감지 → 판단 → LLM → 호스트 전달)과 종료 후 통계 집계는 코드 수정 없이 그대로 돈다.
 *  - 채팅창 화면에는 보이지 않는다 (소켓으로 뿌리지 않으므로).
 *  - payments/donations DB 테이블은 건드리지 않는다 → 매출 페이지는 오염되지 않음.
 *
 * 시간 압축:
 *  - 코파일럿은 "지금부터 최근 N초"를 보기 때문에, 방송 중에는 실제 시각으로 기록한다.
 *  - 방송 종료 시 stretchStatsTime()이 방송 시간과 차트 시각을 TIME_SCALE배로 늘려서 저장한다.
 *
 * 환경 변수 (server/.env):
 *  SIMULATE_LIVE=true          켜기 (운영 서버에는 넣지 말 것)
 *  SIMULATE_TIME_SCALE=60      배속 (기본 60 → 실제 1초 = 가상 1분, 실제 3분 = 가상 3시간)
 *  COPILOT_DEMO=true           같이 켜야 짧은 방송에서도 코파일럿이 반응한다
 */

export const isLiveSimulationEnabled = () => process.env.SIMULATE_LIVE === "true";

const TIME_SCALE = Math.max(1, Number(process.env.SIMULATE_TIME_SCALE ?? 60));
const TICK_MS = 60000 / TIME_SCALE; // 한 틱 = 가상 1분
const TIMESERIES_EVERY_MIN = 5; // 실제 timeseries.js처럼 가상 5분마다 시청자 수 기록
const BOUNCE_RATE = 0.05; // 매 가상 분마다 현재 시청자의 5%가 들어왔다가 1분 안에 나감 (지속률 계산용)
const MSG_HISTORY = 50; // chat-socket.js와 같은 최근 메시지 보관 개수

/**
 * 시나리오 (가상 분 기준)
 *  until           : 이 구간이 끝나는 가상 시각(분)
 *  viewers         : [구간 시작 시청자, 구간 끝 시청자] → 사이는 직선으로 변화
 *  chatPerMin      : 가상 1분당 채팅 수 (소수면 누적해서 정수가 될 때 발생)
 *  donationsPerMin : 가상 1분당 후원 수
 *  mood            : 채팅 문구 종류 (코파일럿의 채팅 맥락 분석에 쓰임)
 *
 * 평온 구간은 값을 일정하게 둔다 → 코파일럿 기준선이 안정돼서 사건 구간에서만 반응한다.
 * 마지막 구간 이후에도 방송을 계속 켜 두면 마지막 구간 값이 유지된다.
 */
export const SCENARIO = [
  { until: 15,  viewers: [0, 60],    chatPerMin: 4,  donationsPerMin: 0,   mood: "calm",     label: "오프닝: 시청자 유입" },
  { until: 35,  viewers: [60, 60],   chatPerMin: 4,  donationsPerMin: 0,   mood: "calm",     label: "평온 (코파일럿 기준선 학습)" },
  { until: 40,  viewers: [60, 60],   chatPerMin: 30, donationsPerMin: 0,   mood: "hype",     label: "🔥 채팅 폭주" },
  { until: 60,  viewers: [60, 60],   chatPerMin: 4,  donationsPerMin: 0,   mood: "calm",     label: "평온" },
  { until: 64,  viewers: [60, 60],   chatPerMin: 6,  donationsPerMin: 2,   mood: "thanks",   label: "💰 후원 몰림" },
  { until: 85,  viewers: [60, 60],   chatPerMin: 4,  donationsPerMin: 0,   mood: "calm",     label: "평온" },
  { until: 90,  viewers: [60, 180],  chatPerMin: 12, donationsPerMin: 0,   mood: "hype",     label: "🚀 시청자 급증 (외부 유입)" },
  { until: 115, viewers: [180, 180], chatPerMin: 8,  donationsPerMin: 0,   mood: "calm",     label: "평온 (늘어난 시청자 유지)" },
  { until: 120, viewers: [180, 180], chatPerMin: 20, donationsPerMin: 0,   mood: "question", label: "❓ 질문 폭주" },
  { until: 140, viewers: [180, 180], chatPerMin: 8,  donationsPerMin: 0,   mood: "calm",     label: "평온" },
  { until: 145, viewers: [180, 190], chatPerMin: 40, donationsPerMin: 3,   mood: "hype",     label: "🔥💰 채팅 + 후원 동시 폭주 (하이라이트)" },
  { until: 170, viewers: [190, 120], chatPerMin: 6,  donationsPerMin: 0,   mood: "calm",     label: "📉 후반 이탈" },
  { until: 180, viewers: [120, 80],  chatPerMin: 8,  donationsPerMin: 0.3, mood: "bye",      label: "👋 마무리 인사" },
];

const CHAT_LINES = {
  calm: ["안녕하세요~", "오늘 방송 재밌네요", "음질 좋아요", "처음 왔어요", "ㅎㅎ", "화질 좋다", "오늘 뭐 해요?", "잘 보고 있어요"],
  hype: ["ㅋㅋㅋㅋㅋㅋ", "대박", "미쳤다 ㅋㅋㅋ", "와 이걸?", "레전드", "ㄷㄷㄷ", "클립 따야 함", "ㅋㅋㅋㅋ 개웃겨"],
  question: ["그거 어디서 사요?", "몇 시까지 해요?", "장비 뭐 써요?", "다음 방송 언제예요?", "그 노래 제목 뭐예요?", "설정 어떻게 해요?"],
  thanks: ["후원 감사합니다!", "와 큰손", "ㄷㄷ 후원 미쳤다", "나도 해야지", "후원 멋있다"],
  bye: ["수고하셨어요!", "오늘도 재밌었어요", "다음 방송 언제예요?", "잘 자요~", "벌써 끝나요?"],
};
const NICKNAMES = ["감자칩", "새벽감성", "고양이집사", "코딩하는곰", "라면왕", "별빛", "초코우유", "밤산책", "치즈볼", "바다소리"];
const DONATION_AMOUNTS = [1000, 1000, 3000, 5000, 5000, 10000, 50000];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const nicknameOf = (n) => `${NICKNAMES[n % NICKNAMES.length]}${n}`;
const formatVirtual = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;

const phaseAt = (min) => {
  let from = 0;
  for (const phase of SCENARIO) {
    if (min < phase.until) return { phase, from };
    from = phase.until;
  }
  const last = SCENARIO[SCENARIO.length - 1];
  return { phase: { ...last, viewers: [last.viewers[1], last.viewers[1]] }, from: last.until };
};

const targetViewersAt = (min) => {
  const { phase, from } = phaseAt(min);
  const [start, end] = phase.viewers;
  const progress = Math.min(1, (min - from) / Math.max(1, phase.until - from));
  return Math.round(start + (end - start) * progress);
};

// room마다 시뮬레이터 상태 (서버 메모리)
const simulations = new Map();

export const startLiveSimulation = async (roomName) => {
  if (simulations.has(roomName)) return;

  const startedAtStr = await redis_client.hGet(getRedisKeys(roomName).INFO, "started_at");
  const startedAt = startedAtStr ? parseInt(startedAtStr, 10) : Date.now();

  const state = {
    startedAt,
    minute: 0, // 지금까지 진행한 가상 분
    nextViewerNo: 0,
    active: new Map(), // 시청 중인 가짜 시청자 id → 입장한 가상 분
    chatCarry: 0,
    donationCarry: 0,
    bounceCarry: 0,
    msgNo: 0,
    lastLabel: null,
    running: false,
    timer: null,
  };

  state.timer = setInterval(() => {
    if (state.running) return; // 이전 틱이 아직 안 끝났으면 건너뜀
    state.running = true;
    tick(roomName, state)
      .catch((err) => console.error(`[Simulate] ${roomName} 틱 오류:`, err.message))
      .finally(() => {
        state.running = false;
      });
  }, TICK_MS);

  simulations.set(roomName, state);
  console.log(
    `[Simulate] ${roomName} 시뮬레이터 시작 (${TIME_SCALE}배속: 실제 ${TICK_MS}ms = 가상 1분)`,
  );
};

/**
 * 시뮬레이터 정지 (finalizeLive에서 집계 직전에 호출)
 * 아직 시청 중인 가짜 시청자 중 1분 이상 본 사람을 STAY_MINUTE에 넣어서 지속률에 반영한다.
 * @returns {{ timeScale: number } | null} 시뮬레이션 중이었으면 배속, 아니면 null
 */
export const stopLiveSimulation = async (roomName) => {
  const state = simulations.get(roomName);
  if (!state) return null;

  clearInterval(state.timer);
  simulations.delete(roomName);

  try {
    const stayed = [...state.active.entries()]
      .filter(([, joinedMin]) => state.minute - joinedMin >= 1)
      .map(([id]) => id);
    if (stayed.length) {
      await redis_client.sAdd(getRedisKeys(roomName).STAY_MINUTE, stayed);
    }
  } catch (err) {
    console.error(`[Simulate] ${roomName} 정지 처리 오류:`, err.message);
  }

  console.log(
    `[Simulate] ${roomName} 시뮬레이터 정지 (가상 ${formatVirtual(state.minute)} 진행)`,
  );
  return { timeScale: TIME_SCALE };
};

/**
 * 종료 통계의 시간을 배속만큼 늘린다 (실제 3분 → 가상 3시간)
 *  - durationMin: 방송 시간
 *  - viewerTimeseries / donationTimeseries: 차트 시각을 시작 시각 기준으로 펼침
 */
export const stretchStatsTime = (stats, startedAt, timeScale) => {
  const stretch = (series = []) =>
    series.map((p) => ({
      ...p,
      score: Math.round(startedAt + (p.score - startedAt) * timeScale),
    }));

  return {
    ...stats,
    durationMin: Math.round(((Date.now() - startedAt) * timeScale) / 60000),
    viewerTimeseries: stretch(stats.viewerTimeseries),
    donationTimeseries: stretch(stats.donationTimeseries),
  };
};

// ── 한 틱 = 가상 1분 ──
const tick = async (roomName, state) => {
  const keys = getRedisKeys(roomName);
  const now = Date.now();
  const minute = state.minute;
  const { phase } = phaseAt(minute);

  if (phase.label !== state.lastLabel) {
    console.log(`[Simulate] ${roomName} 가상 ${formatVirtual(minute)} → ${phase.label}`);
    state.lastLabel = phase.label;
  }

  const multi = redis_client.multi();

  // 1) 시청자: 목표 인원에 맞춰 입장/퇴장
  //    (live-webhook.js의 participant_joined/left가 쓰는 키와 같다)
  const diff = targetViewersAt(minute) - state.active.size;

  if (diff > 0) {
    const joined = [];
    for (let i = 0; i < diff; i++) {
      const id = `sim_viewer_${state.nextViewerNo++}`;
      state.active.set(id, minute);
      joined.push(id);
    }
    for (const id of joined) multi.hSet(keys.VIEWERS, id, "1");
    multi.sAdd(keys.ALL_VISITORS, joined);
  } else if (diff < 0) {
    const ids = [...state.active.keys()];
    const left = [];
    for (let i = 0; i < -diff && ids.length; i++) {
      const [id] = ids.splice(Math.floor(Math.random() * ids.length), 1);
      left.push(id);
    }
    const stayed = left.filter((id) => minute - state.active.get(id) >= 1);
    left.forEach((id) => state.active.delete(id));
    multi.hDel(keys.VIEWERS, left);
    if (stayed.length) multi.sAdd(keys.STAY_MINUTE, stayed);
  }
  if (diff !== 0) multi.zIncrBy(keys.VIEWER_RANK, diff, roomName);

  // 금방 나가는 방문자: 누적 방문자에는 잡히지만 1분 미만이라 STAY_MINUTE에는 안 들어감
  state.bounceCarry += state.active.size * BOUNCE_RATE;
  const bounceCount = Math.floor(state.bounceCarry);
  state.bounceCarry -= bounceCount;
  if (bounceCount > 0) {
    const bounced = Array.from({ length: bounceCount }, () => `sim_viewer_${state.nextViewerNo++}`);
    multi.sAdd(keys.ALL_VISITORS, bounced);
  }

  // 2) 채팅 (chat-socket.js의 persistMessage가 쓰는 키와 같다)
  //    한 틱의 채팅을 같은 시각에 찍는다 → 코파일럿 집계 윈도우마다 개수가 일정해서 평온 구간에 오탐이 없다
  state.chatCarry += phase.chatPerMin;
  const chatCount = Math.floor(state.chatCarry);
  state.chatCarry -= chatCount;
  const activeIds = [...state.active.keys()];

  if (chatCount > 0 && activeIds.length > 0) {
    const chatters = [];
    for (let i = 0; i < chatCount; i++) {
      const id = pick(activeIds);
      const msgId = `sim_msg_${state.msgNo++}`;
      chatters.push(id);
      multi.rPush(
        keys.MSG,
        JSON.stringify({
          id,
          userNickname: nicknameOf(Number(id.split("_").pop())),
          msg: pick(CHAT_LINES[phase.mood] ?? CHAT_LINES.calm),
          msgId,
          serverTimestamp: now,
        }),
      );
      multi.zAdd(keys.CHAT_TIMESERIES, {
        score: now,
        value: JSON.stringify({ userId: id, msgId }),
      });
    }
    multi.lTrim(keys.MSG, -MSG_HISTORY, -1);
    multi.sAdd(keys.CHAT_UNIQUE_USERS, chatters);
  }

  // 3) 후원 (payment-service.js의 saveDonation이 쓰는 Redis 키와 같다. DB에는 쓰지 않음)
  state.donationCarry += phase.donationsPerMin;
  const donationCount = Math.floor(state.donationCarry);
  state.donationCarry -= donationCount;

  for (let i = 0; i < donationCount && activeIds.length > 0; i++) {
    const donorId = pick(activeIds);
    const buyerName = nicknameOf(Number(donorId.split("_").pop()));
    const amount = pick(DONATION_AMOUNTS);
    const paymentId = `sim_pay_${now}_${i}`;

    multi.rPush(
      keys.DONATION,
      JSON.stringify({ paymentId, amount, buyerName, paidAt: new Date(now).toISOString(), timestamp: now }),
    );
    multi.incrBy(keys.DONATION_TOTAL_AMOUNT, amount);
    multi.incr(keys.DONATION_COUNT);
    multi.sAdd(keys.DONATION_UNIQUE_USERS, buyerName);
    multi.zAdd(keys.DONATION_TIMESERIES, {
      score: now,
      value: JSON.stringify({ amount, paymentId }),
    });
  }
  if (donationCount > 0) multi.lTrim(keys.DONATION, -100, -1);

  await multi.exec();

  // 4) 최고 시청자 + 시청자 추이 (실제 시청자도 함께 센다)
  const currentViewers = await redis_client.hLen(keys.VIEWERS);
  const peak = parseInt((await redis_client.hGet(keys.PEAK_VIEW, "peak_view")) ?? "0", 10);
  if (currentViewers > peak) {
    await redis_client.hSet(keys.PEAK_VIEW, "peak_view", String(currentViewers));
  }

  if (minute % TIMESERIES_EVERY_MIN === 0) {
    // value에 시각을 붙이는 이유: Sorted Set은 value가 같으면 한 점으로 합쳐진다
    // 집계 쪽(collectLiveStats, ai-route)은 parseInt("60:1731...") === 60 으로 읽는다
    await redis_client.zAdd(keys.TIMESERIES, {
      score: now,
      value: `${currentViewers}:${now}`,
    });
  }

  state.minute += 1;
};
