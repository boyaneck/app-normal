const ALPHA = 0.3; //EMA 반응성(0~1, 클수록 최근값에 민감)
// TODO: 데모용 1 — 원래 5였음. 아래 count===1 특수처리도 제거해서 첫 틱부터 ready 가능
const WARMUP = 1; //최소 표본 수 - 이전의 z를 신뢰하지 않음
const MIN_STD = 1e-6; //0 으로 나누는 것을 방지

export const createDetector = ({ alpha = ALPHA, warmUp = WARMUP } = {}) => {
  let count = 0;
  let ema = 0; //지수이동평균(현재 추세값)
  let ewvar = 0; // 지수가중분산

  const update = (value) => {
    count++;

    // 데모용: 첫 틱부터 바로 스파이크 판단 가능하게 함.
    // ema는 0에서 시작하므로(방송 시작 = 채팅 없음) 첫 값 자체를 delta로 써도 안전함.
    const prevEma = ema;
    const delta = value - ema;
    //EWVar 갱신
    ema = ema + alpha * delta;
    ewvar = (1 - alpha) * (ewvar + alpha * delta * delta);

    const std = Math.sqrt(ewvar);
    const z = delta / Math.max(std, MIN_STD);
    const slope = ema - prevEma; // 추세 가속도(양수면 상승 , 음수면 하강)

    return { z, ema, slope, ready: count >= warmUp };
  };

  return update;
};

//     const std = Math.sqrt(ewvar);
//     const z = delta / Math.max(std, MIN_STD);
//     const slope = ema - prevEma; // 추세 가속도 (양수=상승 중)

//     return { z, ema, slope, ready: count >= warmup };
//   };

//   return update;
// };
