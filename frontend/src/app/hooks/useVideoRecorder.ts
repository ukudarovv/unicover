import { useState, useRef, useCallback } from 'react';

interface UseVideoRecorderReturn {
  isRecording: boolean;
  startRecording: (stream: MediaStream) => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
  recordingTime: number;
}

export function useVideoRecorder(): UseVideoRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async (stream: MediaStream) => {
    try {
      setError(null);
      chunksRef.current = [];
      streamRef.current = stream;

      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported) {
        throw new Error('MediaRecorder API не поддерживается в этом браузере');
      }

      // Find supported MIME type
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
      };

      // Try alternative MIME types if webm is not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        if (MediaRecorder.isTypeSupported('video/webm')) {
          options.mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options.mimeType = 'video/mp4';
        } else {
          // Use default
          delete options.mimeType;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle errors
      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event);
        setError('Ошибка при записи видео');
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Handle stop event
      mediaRecorder.onstop = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecordingTime(0);
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError(err.message || 'Не удалось начать запись видео');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;

      // Wait for final data
      mediaRecorder.onstop = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Create blob from chunks
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'video/webm' });
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        setIsRecording(false);
        setRecordingTime(0);
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        
        resolve(blob);
      };

      // Stop recording
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      } else {
        // Already stopped, resolve immediately
        resolve(null);
      }
    });
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    recordingTime,
  };
}
