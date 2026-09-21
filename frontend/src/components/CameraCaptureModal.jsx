import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, Video, StopCircle, RefreshCw, Check, AlertCircle } from 'lucide-react';

export default function CameraCaptureModal({ isOpen, onClose, onCaptureComplete, mode = 'photo' }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const [captureMode, setCaptureMode] = useState(mode); // 'photo' | 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [previewData, setPreviewData] = useState(null); // captured data URL
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPreviewData(null);
      setRecordedChunks([]);
      setRecordingSeconds(0);
      setCameraError('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, captureMode]);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startCamera = async () => {
    stopCamera();
    setCameraError('');
    try {
      const constraints = {
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: captureMode === 'video'
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access device camera. Please grant camera permission or use file upload.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreviewData({ type: 'image', url: dataUrl });
    stopCamera();
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    setRecordedChunks([]);
    setRecordingSeconds(0);

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          setRecordedChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      alert('Video recording not supported in this browser format');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();

      setTimeout(() => {
        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewData({ type: 'video', url: reader.result });
          };
          reader.readAsDataURL(blob);
        }
      }, 300);
    }
  };

  // Process chunks when recordedChunks updates after stop
  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0 && !previewData) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewData({ type: 'video', url: reader.result });
      };
      reader.readAsDataURL(blob);
    }
  }, [recordedChunks, isRecording, previewData]);

  const handleConfirm = () => {
    if (previewData) {
      onCaptureComplete(previewData.url);
      onClose();
    }
  };

  const handleRetake = () => {
    setPreviewData(null);
    setRecordedChunks([]);
    setRecordingSeconds(0);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      
      <div className="bg-slate-900 text-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {captureMode === 'photo' ? <Camera className="w-5 h-5 text-brand-400" /> : <Video className="w-5 h-5 text-rose-400" />}
            <span className="font-black text-sm">
              {captureMode === 'photo' ? 'Take Photo Now' : 'Record Property Walkthrough Video'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!previewData && (
              <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCaptureMode('photo')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${captureMode === 'photo' ? 'bg-brand-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureMode('video')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${captureMode === 'video' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
                >
                  Video
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative h-80 sm:h-96 w-full bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-xs text-rose-400 max-w-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              <p>{cameraError}</p>
            </div>
          ) : previewData ? (
            previewData.type === 'image' ? (
              <img src={previewData.url} alt="Captured" className="w-full h-full object-cover" />
            ) : (
              <video src={previewData.url} controls autoPlay className="w-full h-full object-cover" />
            )
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          )}

          {/* Recording Timer Badge */}
          {isRecording && (
            <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-2 animate-pulse shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span>REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-5 bg-slate-950 flex items-center justify-between">
          {previewData ? (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-brand-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Use This {previewData.type === 'image' ? 'Photo' : 'Video'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              {captureMode === 'photo' ? (
                <button
                  type="button"
                  onClick={takePhoto}
                  className="w-16 h-16 rounded-full bg-white text-slate-900 border-4 border-brand-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-2xl"
                  title="Snap Photo"
                >
                  <Camera className="w-6 h-6 text-brand-600" />
                </button>
              ) : isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-lg animate-pulse"
                >
                  <StopCircle className="w-5 h-5" />
                  <span>Stop Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-rose-600 text-white border-4 border-white/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-2xl"
                  title="Start Recording Video"
                >
                  <Video className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
