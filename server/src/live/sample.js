import React, { useState, useEffect } from 'react';
import { Tv, Activity, PlayCircle, Settings } from 'lucide-react';

const App = () => {
  // 토큰 6개가 담긴 리스트 (실제 데이터라고 가정)
  const [tokens, setTokens] = useState([
    { id: 1, token: "real_token_1", isLive: true, title: "실제 OBS 방송 1" },
    { id: 2, token: "dummy_token_2", isLive: false, title: "임의 추가 방송 2 (샘플)" },
    { id: 3, token: "dummy_token_3", isLive: false, title: "임의 추가 방송 3 (샘플)" },
    { id: 4, token: "dummy_token_4", isLive: false, title: "임의 추가 방송 4 (샘플)" },
    { id: 5, token: "dummy_token_5", isLive: false, title: "임의 추가 방송 5 (샘플)" },
    { id: 6, token: "dummy_token_6", isLive: false, title: "임의 추가 방송 6 (샘플)" },
  ]);

  // 샘플 영상 리스트 (임의 방송용)
  const sampleVideos = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-8 flex justify-between items-center border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tv className="text-indigo-400" /> 멀티 채널 모니터링 테스트
          </h1>
          <p className="text-slate-400 text-sm mt-1">실제 OBS 송출과 샘플 영상을 혼합하여 테스트합니다.</p>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-2 bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-xs border border-green-800">
            <Activity size={14} /> 시스템 정상
          </span>
        </div>
      </header>

      {/* 방송 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((stream, index) => (
          <div key={stream.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all group">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {stream.isLive ? (
                /* 실제 스트리밍 플레이어가 들어갈 자리 (여기선 검은 화면으로 대체) */
                <div className="text-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 mb-2 flex items-center justify-center">
                      <PlayCircle size={24} />
                    </div>
                    <p className="text-xs font-mono text-red-500">LIVE 송출 대기중...</p>
                  </div>
                </div>
              ) : (
                /* 임의 추가 방송 (샘플 영상 루프) */
                <video 
                  src={sampleVideos[index % sampleVideos.length]} 
                  autoPlay 
                  muted 
                  loop 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                />
              )}
              
              {/* 오버레이 정보 */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${stream.isLive ? 'bg-red-600' : 'bg-slate-600'}`}>
                  {stream.isLive ? 'Live' : 'Mock'}
                </span>
                <span className="bg-black/50 backdrop-blur-md text-[10px] px-2 py-0.5 rounded">
                  CH {stream.id}
                </span>
              </div>
            </div>

            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-sm text-slate-200">{stream.title}</h3>
                <code className="text-[10px] text-slate-500 block mt-1">Token: {stream.token}</code>
              </div>
              <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                <Settings size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-12 text-center text-slate-500 text-xs">
        <p>임의 방송은 공공 샘플 비디오 URL을 사용하여 시뮬레이션 중입니다.</p>
      </footer>
    </div>
  );
};

export default App;