"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Mouth } from "./mouth";

interface Viseme {
  start: number;
  end: number;
  viseme: string;
}

interface AvatarStageProps {
  imageUrl: string;
  audioUrl: string | null;
  lipSyncData: Viseme[] | null;
  onEnded?: () => void;
}

export interface AvatarStageHandle {
  play: () => void;
  pause: () => void;
  exportVideo: () => Promise<void>;
}

export const AvatarStage = forwardRef<AvatarStageHandle, AvatarStageProps>(
  ({ imageUrl, audioUrl, lipSyncData, onEnded }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentViseme, setCurrentViseme] = useState("X");
    const animationFrameId = useRef<number>();
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const audio = audioRef.current;
      if (audio) {
        const handleEnded = () => {
          onEnded?.();
          setCurrentViseme("X");
        };
        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
      }
    }, [onEnded]);

    useEffect(() => {
      const animate = () => {
        const audio = audioRef.current;
        const canvas = canvasRef.current;
        if (!audio || !canvas || !lipSyncData) {
          animationFrameId.current = requestAnimationFrame(animate);
          return;
        }

        const currentTime = audio.currentTime;
        const activeViseme = lipSyncData.find(
          (v) => currentTime >= v.start && currentTime <= v.end
        );
        setCurrentViseme(activeViseme ? activeViseme.viseme : "X");

        animationFrameId.current = requestAnimationFrame(animate);
      };

      animationFrameId.current = requestAnimationFrame(animate);
      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, [lipSyncData]);

    useImperativeHandle(ref, () => ({
      play: () => audioRef.current?.play(),
      pause: () => audioRef.current?.pause(),
      exportVideo: async () => {
        const canvas = canvasRef.current;
        const audio = audioRef.current;
        const image = imageRef.current;
        
        if (!canvas || !audio || !lipSyncData || !image) {
          throw new Error("Cannot export, content not ready.");
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error("Cannot get canvas context.");
        }

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);


        return new Promise((resolve, reject) => {
          const stream = canvas.captureStream(30);
          
          let audioContext: AudioContext;
          let audioStream: MediaStream;

          try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaElementSource(audio);
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);
            audioStream = destination.stream;
          } catch (e) {
            reject(new Error("Could not create audio stream. Your browser might not be supported."));
            return;
          }
          
          audioStream.getAudioTracks().forEach(track => stream.addTrack(track));

          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
          const chunks: Blob[] = [];

          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "avatar_talk.webm";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            audioContext.close();
            resolve();
          };
          recorder.onerror = (e) => {
            reject(e);
            audioContext.close();
          };

          audio.currentTime = 0;
          audio.play();
          recorder.start();

          const handleStop = () => {
             if (recorder.state === "recording") {
                recorder.stop();
              }
              audio.removeEventListener("ended", handleStop);
              audio.removeEventListener("pause", handleStop);
          }
          
          audio.addEventListener("ended", handleStop);
          audio.addEventListener("pause", handleStop);
        });
      },
    }));

    return (
      <div className="w-full h-full relative">
        <canvas ref={canvasRef} className="w-full h-full object-cover" width="512" height="512" />
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Avatar"
          crossOrigin="anonymous"
          className="w-full h-full object-cover absolute top-0 left-0 -z-10 opacity-0"
        />
        <div
          className="absolute w-[35%] h-[20%] bottom-[18%] left-1/2 -translate-x-1/2"
          style={{ transform: "translateX(-50%)" }}
        >
          <Mouth viseme={currentViseme} className="w-full h-full" />
        </div>
        {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" crossOrigin="anonymous" />}
      </div>
    );
  }
);

AvatarStage.displayName = "AvatarStage";
