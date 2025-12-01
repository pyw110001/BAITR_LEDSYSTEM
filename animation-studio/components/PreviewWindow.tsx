import React, { useRef, useState, useEffect } from 'react';
import { AnimationMaterial, PlaybackSpeed } from '../types';
import { Play, Pause, Square, Camera, Maximize, Settings2, Zap, ImagePlus } from 'lucide-react';
import { LedPreview } from './LedPreview';

interface PreviewWindowProps {
  material: AnimationMaterial | null;
}

export const PreviewWindow: React.FC<PreviewWindowProps> = ({ material }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const facadeInputRef = useRef<HTMLInputElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
  const [isLedMode, setIsLedMode] = useState(true);
  const [facadeImage, setFacadeImage] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when material changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setSpeed(1.0);
  }, [material]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !material) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    
    // In a real app, this would save the image or add it to a "snapshots" list
    const flash = document.createElement('div');
    flash.className = "absolute inset-0 bg-white/50 z-50 transition-opacity duration-300";
    containerRef.current?.appendChild(flash);
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 300);
    }, 50);

    alert(`已截取第 ${currentTime.toFixed(2)} 秒画面 (模拟)`);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleFacadeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'image/png') {
        const url = URL.createObjectURL(file);
        setFacadeImage(url);
      } else {
        alert('请上传 PNG 格式的图片以支持透明通道');
      }
    }
  };

  const triggerFacadeUpload = () => {
    facadeInputRef.current?.click();
  };

  if (!material) {
    return (
      <div className="h-full flex flex-col bg-led-800 rounded-2xl overflow-hidden border border-led-700 shadow-xl">
        <div className="h-12 border-b border-led-700 bg-led-900/50 flex items-center px-4">
             <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                 <Zap className="w-4 h-4 text-led-500" />
                 动画预览模式
             </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 p-8">
           <div className="w-20 h-20 rounded-full bg-led-900 flex items-center justify-center border border-led-700">
             <Zap className="w-10 h-10 opacity-50" />
           </div>
           <p>请从左侧列表选择一个已解析的动画素材进行预览</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-led-800 rounded-2xl overflow-hidden border border-led-700 shadow-xl relative">
      {/* Hidden Facade Input */}
      <input 
        type="file" 
        ref={facadeInputRef} 
        className="hidden" 
        accept="image/png" 
        onChange={handleFacadeUpload}
      />

      {/* Viewport - Adjusted to use flex-1 with min-h-0 to prevent overflow */}
      <div ref={containerRef} className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group min-h-0">
          <video
              ref={videoRef}
              src={material.url}
              className={`h-full w-full object-contain transition-all duration-500 ${isLedMode ? 'scale-x-[1.0] blur-[1px] brightness-125 contrast-125' : ''}`}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              loop={false}
              playsInline
          />
          
          {/* LED Simulation Overlay (Grid Mask) */}
          {isLedMode && <LedPreview isActive={isPlaying} />}

          {/* Building Facade Overlay (Transparent PNG) */}
          {isLedMode && facadeImage && (
            <img 
                src={facadeImage} 
                alt="Building Facade Overlay" 
                className="absolute inset-0 w-full h-full object-fill z-20 pointer-events-none" 
            />
          )}

          {/* Top Right Controls */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
              <button onClick={toggleFullscreen} className="p-2 bg-black/60 hover:bg-led-600 rounded-lg text-white backdrop-blur-md" title="全屏">
                  <Maximize className="w-5 h-5" />
              </button>
          </div>
      </div>

      {/* Control Bar - Fixed at bottom */}
      <div className="bg-led-900 border-t border-led-700 p-4 space-y-3 z-40 flex-shrink-0">
          {/* Progress Bar */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>{currentTime.toFixed(1)}s</span>
              <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-led-700 rounded-lg appearance-none cursor-pointer accent-led-500"
              />
              <span>{duration.toFixed(1)}s</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  {/* Play / Pause */}
                  <button 
                    onClick={togglePlay} 
                    className={`p-2 rounded-lg transition-colors ${isPlaying ? 'bg-led-500/20 text-led-500' : 'hover:bg-led-700 text-slate-300'}`} 
                    title={isPlaying ? "暂停" : "播放"}
                  >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  {/* Stop */}
                  <button 
                    onClick={handleStop} 
                    className="p-2 hover:bg-led-700 rounded-lg text-slate-300 transition-colors" 
                    title="停止"
                  >
                      <Square className="w-5 h-5 fill-current" />
                  </button>
                  
                  <div className="h-4 w-px bg-led-700 mx-2"></div>

                  <div className="flex bg-led-800 rounded-lg p-0.5 border border-led-700">
                      {[0.5, 1.0, 2.0].map((rate) => (
                          <button
                              key={rate}
                              onClick={() => setSpeed(rate as PlaybackSpeed)}
                              className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${speed === rate ? 'bg-led-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                              {rate}x
                          </button>
                      ))}
                  </div>
              </div>

              <div className="flex items-center gap-3">
                  <button 
                      onClick={() => setIsLedMode(!isLedMode)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isLedMode ? 'bg-led-accent/10 border-led-accent/50 text-led-accent' : 'bg-transparent border-led-600 text-slate-400 hover:text-white'}`}
                  >
                      <Settings2 className="w-3.5 h-3.5" />
                      {isLedMode ? 'LED 模拟: 开' : 'LED 模拟: 关'}
                  </button>

                  <button 
                      onClick={triggerFacadeUpload}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${facadeImage ? 'bg-led-700 text-white border-led-500' : 'bg-led-800 hover:bg-led-700 border-led-600 text-slate-300'}`}
                      title="上传 PNG 透明通道图片作为大楼立面遮挡"
                  >
                      <ImagePlus className="w-3.5 h-3.5" />
                      {facadeImage ? '立面已加载' : '上传大楼立面'}
                  </button>
                  
                  <button 
                      onClick={captureFrame}
                      className="flex items-center gap-2 px-3 py-1.5 bg-led-700 hover:bg-led-600 border border-led-600 rounded-lg text-xs text-slate-200 transition-colors"
                  >
                      <Camera className="w-3.5 h-3.5" />
                      截取帧
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};