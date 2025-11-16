// import React, { useState, useEffect } from 'react';
// import { Play, Pause, Dot, Eye, Maximize, Volume2, Settings } from 'lucide-react';

// // 슬라이드 전환 시간 (2초) - 메인 배너의 자동 전환 속도
// const SLIDE_DURATION = 2000;
// // 비디오 재생 시뮬레이션 시간 (4분짜리 영상이라고 가정)
// const VIDEO_DURATION = 240;
// // 썸네일 항목 하나의 너비 (Tailwind w-44 = 176px) + gap (8px) = 184px
// const THUMBNAIL_SHIFT_WIDTH = 184;

// // --- 목업 데이터 (Live Streams & Upcoming Videos) ---
// const LIVE_STREAMS = [
//     { id: 1, title: "런닝맨 몰아보기 | 스브스 런닝맨 실시간 스트리밍", viewers: 39000, channel: "SBS 런닝맨 공식 채널", channelLogo: "https://placehold.co/24x24/0A6EBD/FFFFFF?text=R", isLive: true, thumbnailUrl: "https://placehold.co/1920x800/228B22/FFFFFF?text=RUNNING+MAN" },
//     { id: 2, title: "K-POP 최신 인기곡 스트림", viewers: 12500, channel: "K-Music Hits", channelLogo: "https://placehold.co/24x24/FF5733/FFFFFF?text=K", isLive: true, thumbnailUrl: "https://placehold.co/1920x800/FF5733/FFFFFF?text=KPOP+LIVE" },
//     { id: 3, title: "2025년 IT 트렌드 분석 세미나", viewers: 5800, channel: "Tech Insight", channelLogo: "https://placehold.co/24x24/33FF57/000000?text=T", isLive: true, thumbnailUrl: "https://placehold.co/1920x800/33FF57/000000?text=TECH+SEMINAR" },
// ];

// const UPCOMING_VIDEOS = [
//     { id: 4, title: "다음 라이브: 게임 신작 리뷰", viewers: 0, channel: "Game World", channelLogo: "https://placehold.co/24x24/8A2BE2/FFFFFF?text=G", isLive: false, duration: "1:00", thumbnailUrl: "https://placehold.co/1920x800/8A2BE2/FFFFFF?text=GAME+REVIEW" },
//     { id: 5, title: "다음 라이브: 요리 교실 - 파스타 편", viewers: 0, channel: "Cooking Mom", channelLogo: "https://placehold.co/24x24/FFD700/000000?text=C", isLive: false, duration: "0:45", thumbnailUrl: "https://placehold.co/1920x800/FFD700/000000?text=COOKING+CLASS" },
//     { id: 6, title: "새벽 독서회", viewers: 0, channel: "Book Club", channelLogo: "https://placehold.co/24x24/1E90FF/FFFFFF?text=B", isLive: false, duration: "2:00", thumbnailUrl: "https://placehold.co/1920x800/1E90FF/FFFFFF?text=BOOK+CLUB" },
//     { id: 7, title: "여행지 추천 Top 10", viewers: 0, channel: "Travel Hub", channelLogo: "https://placehold.co/24x24/FF6347/FFFFFF?text=T", isLive: false, duration: "0:50", thumbnailUrl: "https://placehold.co/1920x800/FF6347/FFFFFF?text=TRAVEL" },
//     { id: 8, title: "클래식 기타 연습", viewers: 0, channel: "Guitar King", channelLogo: "https://placehold.co/24x24/7FFF00/000000?text=G", isLive: false, duration: "1:30", thumbnailUrl: "https://placehold.co/1920x800/7FFF00/000000?text=GUITAR" },
//     { id: 9, title: "DIY 가구 제작", viewers: 0, channel: "Handy Man", channelLogo: "https://placehold.co/24x24/DDA0DD/000000?text=H", isLive: false, duration: "0:30", thumbnailUrl: "https://placehold.co/1920x800/DDA0DD/000000?text=DIY" },
//     // 총 10개 영상으로 확장
// ];

// const ALL_SLIDER_ITEMS = [...LIVE_STREAMS, ...UPCOMING_VIDEOS];

// // 시간 형식 변환 유틸리티
// const formatTime = (seconds) => {
//     const min = Math.floor(seconds / 60);
//     const sec = Math.floor(seconds % 60);
//     return `${min}:${sec < 10 ? '0' : ''}${sec}`;
// };

// // --- 메인 컴포넌트 ---
// const App = () => {
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [isSliderPaused, setIsSliderPaused] = useState(false); // 슬라이더 자동 전환 일시 정지 상태
//     const [videoTime, setVideoTime] = useState(0); // 현재 비디오 재생 시간 (초 단위)
//     const [isVideoPlaying, setIsVideoPlaying] = useState(true); // 비디오 재생 상태
//     const [isControlsVisible, setIsControlsVisible] = useState(false); // 메인 비디오 컨트롤 바 표시 상태

//     // 현재 표시할 메인 아이템을 동적으로 가져옵니다.
//     const currentItem = ALL_SLIDER_ITEMS[currentIndex];
//     const totalItems = ALL_SLIDER_ITEMS.length;

//     // 1. 슬라이더 자동 전환 로직 (2초마다)
//     useEffect(() => {
//         if (isSliderPaused || !isVideoPlaying) {
//             return;
//         }

//         const timeout = setTimeout(() => {
//             // 다음 인덱스로 전환 (무한 루프)
//             setCurrentIndex(prevIndex => (prevIndex + 1) % totalItems);
//         }, SLIDE_DURATION);

//         return () => clearTimeout(timeout);
//     }, [currentIndex, isSliderPaused, isVideoPlaying, totalItems]);

//     // 2. 비디오 재생 시뮬레이션 및 진행 바 로직
//     useEffect(() => {
//         if (!isVideoPlaying || !currentItem.isLive) return; // 라이브가 아니면 시뮬레이션 중지

//         // 1초마다 비디오 시간을 증가시키는 타이머
//         const interval = setInterval(() => {
//             setVideoTime(prevTime => {
//                 const nextTime = prevTime + 1;
//                 if (nextTime >= VIDEO_DURATION) {
//                     return 0; // 비디오 끝에 도달하면 리셋
//                 }
//                 return nextTime;
//             });
//         }, 1000);

//         return () => {
//             clearInterval(interval);
//         };
//     }, [isVideoPlaying, currentIndex, currentItem.isLive]);

//     // 수동으로 슬라이드 인덱스를 변경할 때 비디오 시간 리셋
//     useEffect(() => {
//         setVideoTime(0);
//     }, [currentIndex]);

//     // 슬라이드 아이템 클릭 핸들러
//     const handleSliderClick = (index) => {
//         // 이미 보여지고 있는 아이템을 클릭하면 재생/일시정지 토글
//         if (index === currentIndex) {
//             togglePlayPause();
//             return;
//         }

//         setCurrentIndex(index);
//         setIsSliderPaused(true); // 수동 전환 시 자동 전환 일시 정지
//         setVideoTime(0); // 새로운 영상 시작
//         setIsVideoPlaying(true); // 재생 시작

//         // 5초 후에 다시 자동 전환 시작
//         const resumeTimeout = setTimeout(() => {
//             setIsSliderPaused(false);
//         }, 5000);

//         return () => clearTimeout(resumeTimeout);
//     };

//     // 재생/일시 정지 토글
//     const togglePlayPause = () => {
//         setIsVideoPlaying(prev => !prev);
//     };

//     // 현재 재생 진행률 (0-100)
//     const videoProgress = (videoTime / VIDEO_DURATION) * 100;

//     // 캐러셀의 translateX 값 계산: 현재 인덱스만큼 왼쪽으로 이동 (184px = 썸네일 너비)
//     const translateX = - (currentIndex * THUMBNAIL_SHIFT_WIDTH);

//     return (
//         <div className="min-h-screen bg-black font-[Inter]">
//             {/* Tailwind CSS Script 및 커스텀 애니메이션 (프로그레스 바) */}
//             <script src="https://cdn.tailwindcss.com"></script>
//             <style>
//                 {`
//                 /* 슬라이더 자동 전환 프로그레스 바 애니메이션 */
//                 @keyframes progress-animation {
//                     from { width: 0%; }
//                     to { width: 100%; }
//                 }
//                 .progress-bar-fill {
//                     animation: progress-animation ${SLIDE_DURATION}ms linear forwards;
//                 }
//                 .progress-paused {
//                     animation-play-state: paused !important;
//                 }

//                 /* 유튜브 썸네일과 유사한 폰트 및 스타일 */
//                 .yt-badge {
//                     font-size: 0.65rem;
//                     font-weight: 700;
//                     padding: 0.1rem 0.3rem;
//                     border-radius: 2px;
//                     line-height: 1;
//                 }

//                 /* 비디오 컨트롤 바 스타일 (숨김/표시 전환용) */
//                 .video-controls {
//                     opacity: 0;
//                     transform: translateY(100%);
//                     transition: opacity 0.3s ease, transform 0.3s ease;
//                 }
//                 .video-controls.visible {
//                     opacity: 1;
//                     transform: translateY(0%);
//                 }

//                 /* Range input custom style for video progress bar */
//                 input[type="range"]::-webkit-slider-thumb {
//                     -webkit-appearance: none;
//                     appearance: none;
//                     width: 15px; /* thumb size */
//                     height: 15px;
//                     background: #FF0000;
//                     cursor: pointer;
//                     border-radius: 50%;
//                     transform: scale(0);
//                     transition: transform 0.2s;
//                 }
//                 input[type="range"]:hover::-webkit-slider-thumb {
//                     transform: scale(1);
//                 }

//                 input[type="range"] {
//                     height: 5px;
//                 }
//                 `}
//             </style>

//             {/* 1. Main Banner Section (Full Width Video Area) */}
//             <header
//                 className="relative w-full aspect-[16/6] max-h-[70vh] overflow-hidden rounded-xl group"
//                 onMouseEnter={() => setIsControlsVisible(true)}
//                 onMouseLeave={() => setIsControlsVisible(false)}
//             >

//                 {/* Background/Video Area (Main Thumbnail) */}
//                 <div
//                     className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
//                     key={currentItem.id}
//                     style={{
//                         backgroundImage: `url(${currentItem.thumbnailUrl})`,
//                         filter: 'brightness(0.9)',
//                     }}
//                 >
//                     {/* Dark Gradient Overlay for Text Visibility */}
//                     <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/0"></div>
//                 </div>

//                 {/* Content Area (Text Overlay) */}
//                 <div className="relative z-10 h-full w-full p-8 flex flex-col justify-between">

//                     {/* Top Left Text & Metadata */}
//                     <div className="space-y-4 pt-10 pb-6 w-full lg:w-3/5 xl:w-2/5">
//                         <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
//                             {currentItem.title}
//                         </h2>

//                         {/* Channel Info & Status */}
//                         <div className="flex items-center space-x-3 text-lg text-gray-300">
//                             <img src={currentItem.channelLogo} alt="Channel Logo" className="w-6 h-6 rounded-full" />
//                             <span className="text-white font-medium">{currentItem.channel}</span>

//                             {currentItem.isLive ? (
//                                 <>
//                                     <span className="yt-badge bg-red-600 text-white flex items-center">
//                                         <Dot className="w-5 h-5 -ml-1 animate-pulse" fill="white" />
//                                         LIVE
//                                     </span>
//                                     <span className="text-sm text-gray-400 flex items-center">
//                                         <Eye size={16} className="text-gray-400 mr-1" />
//                                         {currentItem.viewers.toLocaleString()}명 시청 중
//                                     </span>
//                                 </>
//                             ) : (
//                                 <span className="yt-badge bg-gray-600 text-white">UPCOMING</span>
//                             )}
//                         </div>

//                         {/* Watch Button */}
//                         <button className="mt-6 flex items-center space-x-2 px-6 py-3 bg-white text-black font-extrabold text-lg rounded-md shadow-lg hover:bg-gray-200 transition duration-200" onClick={togglePlayPause}>
//                             {isVideoPlaying ? <Pause fill="black" size={20} /> : <Play fill="black" size={20} />}
//                             <span>{currentItem.isLive ? '라이브 시청하기' : '미리 알림 설정'}</span>
//                         </button>
//                     </div>

//                     {/* 2. 메인 비디오 컨트롤 바 (하단 중앙에 위치) */}
//                     {currentItem.isLive && (
//                         <div className={`video-controls absolute bottom-16 left-0 right-0 p-4 transition duration-300 bg-gradient-to-t from-black/70 to-transparent ${isControlsVisible ? 'visible' : ''}`}>
//                             <div className="max-w-4xl mx-auto w-full">
//                                 {/* 2-1. 진행 바 (Progress Bar) */}
//                                 <div className="w-full h-2 group/progress">
//                                     <input
//                                         type="range"
//                                         min="0"
//                                         max="100"
//                                         step="0.1"
//                                         value={videoProgress}
//                                         onChange={(e) => {
//                                             const newTime = (e.target.value / 100) * VIDEO_DURATION;
//                                             setVideoTime(newTime);
//                                         }}
//                                         className="w-full h-1 bg-gray-600 appearance-none rounded-full cursor-pointer range-lg transition-all"
//                                         style={{
//                                             background: `linear-gradient(to right, #FF0000 0%, #FF0000 ${videoProgress}%, #4B5563 ${videoProgress}%, #4B5563 100%)`
//                                         }}
//                                     />
//                                 </div>

//                                 {/* 2-2. 컨트롤 버튼 및 시간 표시 */}
//                                 <div className="flex justify-between items-center text-white mt-2">
//                                     <div className="flex items-center space-x-3">
//                                         <button onClick={togglePlayPause} className="p-2 hover:bg-white/20 rounded-full">
//                                             {isVideoPlaying ? <Pause size={24} /> : <Play size={24} />}
//                                         </button>
//                                         <Volume2 size={20} className="cursor-pointer hover:text-red-500" />
//                                         <span className="text-sm">{formatTime(videoTime)} / {formatTime(VIDEO_DURATION)}</span>
//                                     </div>
//                                     <div className="flex items-center space-x-3">
//                                         <Settings size={20} className="cursor-pointer hover:text-red-500" />
//                                         <Maximize size={24} className="cursor-pointer hover:text-red-500" />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* 3. Bottom Left Thumbnail Tray (캐러셀) */}
//                     <div
//                         className="absolute bottom-4 left-4 z-20 w-[420px] max-w-full p-2 bg-black/70 rounded-xl overflow-hidden shadow-2xl"
//                         onMouseEnter={() => setIsSliderPaused(true)} // 마우스 오버 시 슬라이더 자동 전환 일시 정지
//                         onMouseLeave={() => setIsSliderPaused(false)} // 마우스 리브 시 재시작
//                     >
//                         <h3 className='text-sm font-semibold text-gray-300 px-2 pt-1 mb-2'>다음 영상 미리보기 (Up Next)</h3>
//                         <div className="w-full overflow-hidden">
//                             {/* 캐러셀 트랙: 인덱스에 따라 왼쪽으로 이동 (transform: translateX) */}
//                             <div
//                                 className="flex space-x-2 transition-transform duration-500 ease-in-out"
//                                 style={{ transform: `translateX(${translateX}px)` }}
//                             >
//                                 {/* ALL_SLIDER_ITEMS를 순회하며 캐러셀 항목 렌더링 */}
//                                 {ALL_SLIDER_ITEMS.map((item, index) => {
//                                     // 현재 재생 중인 영상은 캐러셀에 표시하지 않습니다.
//                                     if (index === currentIndex) return null;

//                                     // 이 아이템이 현재 캐러셀에서 가장 왼쪽에 보여지는 아이템인지 확인 (시각적 구분용)
//                                     const isNextItem = index === (currentIndex + 1) % totalItems;

//                                     return (
//                                         <div
//                                             key={item.id}
//                                             // 썸네일 너비 w-44 (176px)
//                                             className={`relative flex-shrink-0 cursor-pointer w-44 rounded-lg overflow-hidden transition-all duration-300 ${
//                                                 isNextItem
//                                                     ? 'ring-2 ring-red-500 shadow-xl'
//                                                     : 'opacity-70 hover:opacity-100'
//                                             }`}
//                                             onClick={() => handleSliderClick(index)}
//                                         >
//                                             {/* 썸네일 이미지 */}
//                                             <img
//                                                 src={item.thumbnailUrl.replace('1920x800', '224x126')}
//                                                 alt={item.title}
//                                                 className="w-full aspect-video object-cover"
//                                                 onError={(e) => e.target.src = "https://placehold.co/224x126/1F2937/FFFFFF?text=Preview"}
//                                             />

//                                             {/* 썸네일 위에 올라가는 라이브/시간 뱃지 */}
//                                             <div className="absolute top-1 right-1">
//                                                 {item.isLive ? (
//                                                     <span className="yt-badge bg-red-600 text-white">LIVE</span>
//                                                 ) : (
//                                                     <span className="yt-badge bg-black/70 text-white">{item.duration}</span>
//                                                 )}
//                                             </div>

//                                             {/* 썸네일 제목 */}
//                                             <div className="p-2 pt-1">
//                                                 <p className="text-xs text-white line-clamp-2 leading-tight font-medium">{item.title}</p>
//                                             </div>

//                                             {/* 자동 전환용 프로그레스 바 (가장 왼쪽 썸네일에만 적용) */}
//                                             {isNextItem && (
//                                                 <div
//                                                     key={`progress-${currentIndex}`}
//                                                     className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-500 overflow-hidden"
//                                                 >
//                                                     <div
//                                                         className={`progress-bar-fill h-full bg-red-600 ${isSliderPaused || !isVideoPlaying ? 'progress-paused' : ''}`}
//                                                         style={{
//                                                             animationDuration: `${SLIDE_DURATION}ms`
//                                                         }}
//                                                     ></div>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             {/* 4. Content Placeholder (Below the Banner) */}
//             <main className="max-w-7xl mx-auto p-8 text-white">
//                 <h2 className="text-2xl font-bold mb-4">현재 인기 라이브</h2>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                     {/* Placeholder cards */}
//                     {[...Array(4)].map((_, i) => (
//                         <div key={i} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer transform hover:-translate-y-1">
//                             <div className="relative aspect-video bg-gray-700 flex items-center justify-center">
//                                 <span className="text-gray-400">Live Video {i + 1}</span>
//                                 <span className="absolute bottom-1 right-1 yt-badge bg-red-600 text-white">LIVE</span>
//                             </div>
//                             <div className="p-4">
//                                 <p className="font-semibold text-gray-100 line-clamp-2">실시간 스트리밍 제목 #{i + 1}</p>
//                                 <p className="text-sm text-gray-400 mt-1">채널 이름</p>
//                                 <div className='flex items-center text-xs text-gray-500 mt-1'>
//                                     <Dot className="w-5 h-5 -ml-1 text-red-500" />
//                                     <span>{(1000 + i * 50).toLocaleString()} 시청 중</span>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default App;
