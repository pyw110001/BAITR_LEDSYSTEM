import React from 'react';
import { AnimationMaterial } from '../types';
import { Trash2, MonitorPlay, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MaterialListProps {
  materials: AnimationMaterial[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onApply: (id: string) => void;
}

export const MaterialList: React.FC<MaterialListProps> = ({ 
  materials, 
  activeId, 
  onSelect, 
  onDelete, 
  onApply 
}) => {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12 text-slate-600 italic border border-led-700/50 rounded-xl bg-led-800/20">
        暂无素材，请上传
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid gap-4 mt-6">
      {materials.map((item) => (
        <div 
          key={item.id}
          className={`
            relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-200
            ${activeId === item.id 
              ? 'bg-led-700/60 border-led-500 shadow-lg shadow-led-500/10' 
              : 'bg-led-800 border-led-700 hover:border-led-600'}
          `}
        >
          {/* Thumbnail / Status Icon */}
          <div 
            onClick={() => item.status === 'ready' && onSelect(item.id)}
            className="w-20 h-20 bg-led-900 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer relative group"
          >
            {item.status === 'ready' && item.thumbnail ? (
              <>
                <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <MonitorPlay className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                {item.status === 'uploading' && <Loader2 className="w-6 h-6 animate-spin text-led-accent" />}
                {item.status === 'parsing' && <Loader2 className="w-6 h-6 animate-spin-slow text-led-500" />}
                {item.status === 'error' && <AlertCircle className="w-6 h-6 text-led-error" />}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-slate-200 truncate pr-2" title={item.name}>{item.name}</h4>
              <button 
                onClick={() => onDelete(item.id)}
                className="text-slate-500 hover:text-led-error transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              <span className="bg-led-900 px-1.5 py-0.5 rounded border border-led-700 uppercase">{item.type.split('/')[1] || 'VIDEO'}</span>
              <span>{formatSize(item.size)}</span>
              <span>{formatDuration(item.duration)}</span>
            </div>

            {/* Status Bar */}
            <div className="mt-2.5">
              {item.status === 'uploading' && (
                <div className="w-full bg-led-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-led-accent h-full transition-all duration-300" 
                    style={{ width: `${item.uploadProgress}%` }} 
                  />
                  <div className="text-[10px] text-led-accent mt-1">上传中 {item.uploadProgress}%</div>
                </div>
              )}
              {item.status === 'parsing' && (
                <div className="flex items-center gap-2 text-xs text-led-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>FFmpeg 解析与 LED 映射计算中...</span>
                </div>
              )}
              {item.status === 'error' && (
                <div className="text-xs text-led-error">{item.errorMessage}</div>
              )}
              {item.status === 'ready' && (
                 <button
                 onClick={() => onApply(item.id)}
                 className="flex items-center gap-1.5 px-3 py-1 bg-led-600 hover:bg-led-500 text-white text-xs rounded-md transition-colors"
               >
                 <MonitorPlay className="w-3 h-3" />
                 应用到灯带
               </button>
              )}
               {item.status === 'applying' && (
                 <div className="flex items-center gap-2 px-3 py-1 bg-led-600/50 text-white text-xs rounded-md cursor-wait">
                   <Loader2 className="w-3 h-3 animate-spin" />
                   应用中...
                 </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};