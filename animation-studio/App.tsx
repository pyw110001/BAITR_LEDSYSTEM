import React, { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { MaterialList } from './components/MaterialList';
import { PreviewWindow } from './components/PreviewWindow';
import { AnimationMaterial, MaterialStatus } from './types';
import { PhysicalLedController } from './components/LedPreview';
import { Box, LayoutDashboard, ArrowLeft } from 'lucide-react';

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [materials, setMaterials] = useState<AnimationMaterial[]>([]);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock function to simulate FFmpeg parsing and thumbnail generation
  const processMaterial = async (id: string, file: File) => {
    // 1. Upload Simulation
    for (let i = 0; i <= 100; i += 10) {
      setMaterials(prev => prev.map(m => m.id === id ? { ...m, uploadProgress: i } : m));
      await new Promise(r => setTimeout(r, 100)); // Simulate network delay
    }

    // 2. Parsing State
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: 'parsing' as MaterialStatus } : m));

    // Simulate FFmpeg processing time (extracting frames, mapping to LED matrix)
    await new Promise(r => setTimeout(r, 2000));

    // 3. Generate Thumbnail (using a temporary video element)
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.crossOrigin = "anonymous";

    // Attempt to load metadata to get duration
    video.onloadedmetadata = () => {
      // Seek to 10% to get a good frame
      video.currentTime = Math.min(1.0, video.duration * 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320; // Thumbnail width
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbUrl = canvas.toDataURL('image/jpeg');

      // 4. Ready State
      setMaterials(prev => prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            status: 'ready' as MaterialStatus,
            url: videoUrl,
            thumbnail: thumbUrl,
            duration: video.duration || 0,
          };
        }
        return m;
      }));

      // Select automatically if it's the first one
      if (materials.length === 0) setActiveMaterialId(id);
    };

    // Trigger load
    video.load();
    // Fallback if video fails to load in background (e.g. format issues)
    video.onerror = () => {
      setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: 'error', errorMessage: '无法解析视频流' } : m));
    }
  };

  const handleFilesSelected = (files: File[]) => {
    const newMaterials: AnimationMaterial[] = files.map(file => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      status: 'uploading',
      uploadProgress: 0
    }));

    setMaterials(prev => [...newMaterials, ...prev]);

    // Process each new file
    newMaterials.forEach(m => processMaterial(m.id, m.file));
  };

  const handleDelete = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    if (activeMaterialId === id) setActiveMaterialId(null);
  };

  const handleApply = async (id: string) => {
    // Simulate sending data to hardware
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: 'applying' } : m));

    await new Promise(r => setTimeout(r, 1500)); // 1.5s delay

    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: 'ready' } : m));
    setActiveMaterialId(id); // Ensure it's selected
    // In a real app, this would trigger a global "Live" state
    alert("动画已成功发送至 LED 灯带控制器！");
  };

  const activeMaterial = materials.find(m => m.id === activeMaterialId) || null;
  const isAnyApplying = materials.some(m => m.status === 'applying');
  const isAnyPlaying = activeMaterialId !== null; // Simplified logic, ideally tied to video play state

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = 'navigation.html?t=' + Date.now();
  };

  return (
    <div className="flex h-screen w-full relative">
      {/* 返回按钮 */}
      <a
        href="/navigation.html"
        onClick={handleBackClick}
        className="fixed top-6 left-6 z-[100] bg-[rgba(15,40,71,0.6)] backdrop-blur-[10px] border border-[rgba(6,182,212,0.3)] rounded-lg px-4 py-2.5 flex items-center gap-2 text-led-accent no-underline text-sm font-medium transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:bg-[rgba(15,40,71,0.8)] hover:border-[rgba(6,182,212,0.5)] hover:-translate-x-1 hover:shadow-[0_6px_20px_rgba(6,182,212,0.3)]"
        style={{ WebkitBackdropFilter: 'blur(10px)' }}
      >
        <ArrowLeft className="w-[18px] h-[18px]" />
        <span>返回导览</span>
      </a>

      {/* Sidebar / Upload Area */}
      <div className="w-[450px] flex flex-col border-r border-led-700 bg-led-900/50 backdrop-blur flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-led-700 bg-transparent">
          {/* 标题已移动到预览控制台上方 */}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <section className="mb-8">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-led-accent"></span>
              素材上传
            </h2>
            <UploadZone onFilesSelected={handleFilesSelected} />
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-led-500"></span>
              素材库 ({materials.length})
            </h2>
            <MaterialList
              materials={materials}
              activeId={activeMaterialId}
              onSelect={setActiveMaterialId}
              onDelete={handleDelete}
              onApply={handleApply}
            />
          </section>
        </div>

        {/* Connection Status Footer */}
        <div className="p-4 border-t border-led-700 bg-led-800/50 text-xs text-slate-500 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            控制器在线
          </span>
          <span className="font-mono">IP: 192.168.1.102</span>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-led-900 to-led-800 p-8">
        <div className="flex justify-between items-center mb-6 relative">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">预览控制台</h2>
            <p className="text-slate-400 text-sm">实时预览动画在 LED 矩阵上的映射效果</p>
          </div>

          {/* VIDEO DISPLAY 标题 - 绝对居中显示 */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-led-500 to-led-600 flex items-center justify-center shadow-lg shadow-led-500/20">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg tracking-wide text-slate-100">VIDEO DISPLAY <span className="text-led-500 text-xs font-mono ml-1">v1.0</span></h1>
          </div>

          {/* Hardware Simulation Indicator */}
          <div className="flex items-center gap-4 bg-led-800 p-3 rounded-xl border border-led-700 flex-shrink-0">
            <div className="text-right mr-2">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Physical Strip 1</div>
              <div className={`text-xs font-mono ${isAnyApplying || isAnyPlaying ? 'text-led-accent' : 'text-slate-600'}`}>
                {isAnyApplying ? 'RECEIVING DATA...' : (activeMaterial ? 'ACTIVE' : 'IDLE')}
              </div>
            </div>
            <div className="h-8 w-px bg-led-700"></div>
            <div className="flex gap-1.5 h-8">
              {/* Creating a few simulated physical strips */}
              <PhysicalLedController isActive={activeMaterial !== null} />
              <PhysicalLedController isActive={activeMaterial !== null} />
              <PhysicalLedController isActive={activeMaterial !== null} />
              <PhysicalLedController isActive={activeMaterial !== null} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <PreviewWindow material={activeMaterial} />
        </div>
      </div>
    </div>
  );
};

export default App;