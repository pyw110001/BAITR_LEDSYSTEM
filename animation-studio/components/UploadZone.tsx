import React, { useRef, useState } from 'react';
import { Upload, FileVideo, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'image/gif', 'video/x-msvideo']; // MP4, MOV, GIF, AVI

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (fileList: FileList | File[]) => {
    const validFiles: File[] = [];
    let errorMsg = null;

    if (fileList.length > 5) {
      setError("单次最多上传 5 个文件");
      return;
    }

    Array.from(fileList).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        errorMsg = `文件 ${file.name} 超过 100MB 限制`;
      } else if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.avi')) {
         // Note: AVI mime type can vary, simple check added
        errorMsg = `不支持的文件格式: ${file.name}`;
      } else {
        validFiles.push(file);
      }
    });

    if (errorMsg) {
      setError(errorMsg);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateFiles(e.target.files);
    }
    // Reset value to allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-8 text-center
        ${isDragging 
          ? 'border-led-accent bg-led-accent/10 scale-[1.01]' 
          : 'border-led-600 bg-led-800/50 hover:border-led-500 hover:bg-led-800'}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        className="hidden"
        multiple
        accept=".mp4,.mov,.gif,.avi"
      />
      
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-led-accent/20' : 'bg-led-700 group-hover:bg-led-600'}`}>
          <Upload className={`w-8 h-8 ${isDragging ? 'text-led-accent' : 'text-slate-400 group-hover:text-white'}`} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-200">点击或拖拽上传素材</h3>
          <p className="text-sm text-slate-500 mt-1">支持 MP4, MOV, GIF, AVI (Max 5 files, ≤100MB)</p>
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 bg-led-900/90 backdrop-blur-sm flex items-center justify-center rounded-xl border border-led-error/50 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 text-led-error px-4 py-2 rounded-lg bg-led-error/10">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};