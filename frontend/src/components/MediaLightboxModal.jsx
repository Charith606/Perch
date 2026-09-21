import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Video, Image as ImageIcon } from 'lucide-react';
import { isVideoUrl, getMediaUrl } from '../utils/media';

export default function MediaLightboxModal({ 
  isOpen, 
  onClose, 
  mediaList = [], 
  initialIndex = 0,
  title = 'Media Viewer' 
}) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && mediaList.length > 1) {
        setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
      }
      if (e.key === 'ArrowRight' && mediaList.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % mediaList.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mediaList.length, onClose]);

  if (!isOpen || !mediaList || mediaList.length === 0) return null;

  const currentMedia = mediaList[currentIndex];
  const isVideo = isVideoUrl(currentMedia);
  const mediaSrc = getMediaUrl(currentMedia);

  const prevMedia = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const nextMedia = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div 
        className="flex items-center justify-between z-10 text-white pb-3 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {isVideo ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-black uppercase tracking-wider">
              <Video className="w-3.5 h-3.5" />
              Walkthrough Video
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-white text-xs font-black uppercase tracking-wider border border-white/20">
              <ImageIcon className="w-3.5 h-3.5 text-brand-400" />
              Full Image
            </span>
          )}
          <span className="text-xs text-slate-300 font-medium ml-2">
            {currentIndex + 1} of {mediaList.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={mediaSrc}
            target="_blank"
            rel="noopener noreferrer"
            download={isVideo ? "perch-video.mp4" : "perch-image.jpg"}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-xs flex items-center gap-1.5 px-3"
            title="Open in new tab / Download"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Save / Full File</span>
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-rose-400 transition-colors"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Full-Size Display Container (Uncropped, Full Aspect Ratio) */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden my-2"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            key={mediaSrc}
            src={mediaSrc}
            controls
            autoPlay
            playsInline
            className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl bg-black border border-white/10 object-contain"
          />
        ) : (
          <img
            key={mediaSrc}
            src={mediaSrc}
            alt={title}
            className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain select-none"
          />
        )}

        {/* Previous / Next Controls */}
        {mediaList.length > 1 && (
          <>
            <button
              onClick={prevMedia}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 shadow-xl"
              aria-label="Previous Media"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextMedia}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 shadow-xl"
              aria-label="Next Media"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {mediaList.length > 1 && (
        <div 
          className="flex items-center justify-center gap-2 py-2 overflow-x-auto no-scrollbar z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {mediaList.map((item, idx) => {
            const isItemVideo = isVideoUrl(item);
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  idx === currentIndex 
                    ? 'border-brand-500 scale-105 shadow-lg ring-2 ring-brand-500/50' 
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                {isItemVideo ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <Video className="w-4 h-4 text-rose-400" />
                  </div>
                ) : (
                  <img src={getMediaUrl(item)} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
