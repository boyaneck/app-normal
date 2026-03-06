// seed_live_data.js
import "dotenv/config";
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const categories = [
  "게임",
  "음악",
  "토크",
  "먹방",
  "코딩",
  "운동",
  "그림",
  "ASMR",
];

const streams = Array.from({ length: 20 }, (_, i) => ({
  room_name: `room_${String(i + 1).padStart(3, "0")}`,
  streamer: [
    "김하늘",
    "박서준",
    "이지은",
    "최유진",
    "정민호",
    "한소희",
    "오동현",
    "윤서연",
    "장도윤",
    "임수빈",
    "강태현",
    "송지아",
    "류민재",
    "배수지",
    "조현우",
    "신예은",
    "문정혁",
    "홍지수",
    "권나은",
    "서강준",
  ][i],
  title: [
    "밤새 발로란트 랭크 도전",
    "기타 라이브 신청곡 받아요",
    "새벽 토크 같이 떠들자",
    "편의점 먹방 레전드",
    "리액트 프로젝트 같이 코딩",
    "홈트 30분 루틴",
    "일러스트 그려드림",
    "빗소리 ASMR 수면 유도",
    "롤 챌린저 가는 길",
    "피아노 즉흥 연주",
    "고민 상담소 열었습니다",
    "야식 라면 먹방",
    "Next.js 배우는 중",
    "필라테스 같이 해요",
    "캐릭터 디자인 작업",
    "숲속 자연 소리 ASMR",
    "오버워치 경쟁전",
    "우쿨렐레 배우기",
    "자취 요리 도전기",
    "스트리밍 앱 만드는 개발자",
  ][i],
  category: categories[i % categories.length],
  viewers: Math.floor(Math.random() * 200) + 5,
}));

// Redis에 초기 데이터 넣기
for (const s of streams) {
  const keys = {
    info: `live:${s.room_name}:info`,
    viewers: `live:${s.room_name}:viewers`,
    category: `live:${s.room_name}:category`,
  };

  // 방송 정보
  await redis.hSet(
    keys.info,
    "started_at",
    (Date.now() - Math.floor(Math.random() * 7200000)).toString(),
  );
  await redis.hSet(keys.info, "streamer", s.streamer);
  await redis.hSet(keys.info, "title", s.title);

  // 카테고리
  await redis.set(keys.category, s.category);

  // 시청자 수 (더미 유저들)
  for (let j = 0; j < s.viewers; j++) {
    await redis.hSet(keys.viewers, `user_${s.room_name}_${j}`, "1");
  }

  // 랭킹보드
  await redis.zAdd("live:rank", { score: s.viewers, value: s.room_name });
}

console.log(`✅ ${streams.length}개 방송 데이터 생성 완료`);

// 시청자 수 랜덤 변동 (10초마다)
setInterval(async () => {
  for (const s of streams) {
    const change = Math.floor(Math.random() * 21) - 10; // -10 ~ +10
    const currentViewers = await redis.hLen(`live:${s.room_name}:viewers`);

    if (change > 0) {
      for (let j = 0; j < change; j++) {
        await redis.hSet(
          `live:${s.room_name}:viewers`,
          `user_${Date.now()}_${j}`,
          "1",
        );
      }
    } else if (change < 0) {
      const fields = await redis.hKeys(`live:${s.room_name}:viewers`);
      const toRemove = fields.slice(
        0,
        Math.min(Math.abs(change), fields.length - 1),
      );
      for (const f of toRemove) {
        await redis.hDel(`live:${s.room_name}:viewers`, f);
      }
    }

    const newCount = await redis.hLen(`live:${s.room_name}:viewers`);
    await redis.zAdd("live:rank", { score: newCount, value: s.room_name });
  }
  console.log(`🔄 시청자 수 변동 (${new Date().toLocaleTimeString()})`);
}, 10000);
