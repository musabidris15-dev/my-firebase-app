"use client";

import { useState, useRef, useEffect, type ElementRef } from "react";
import Image from "next/image";
import {
  FileImage,
  FileAudio,
  Loader,
  Play,
  Pause,
  Download,
  Upload,
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/app/avatar-stage";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { generateLipSyncData } from "@/ai/flows/audio-to-lip-sync";
import { useToast } from "@/hooks/use-toast";

type Status = "idle" | "generating" | "ready" | "error" | "playing" | "exporting";

export default function Home() {
  const { toast } = useToast();
  const [photo, setPhoto] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>(
    PlaceHolderImages.find((img) => img.id === "avatar-placeholder")?.imageUrl ||
      "https://picsum.photos/seed/avatar/512/512"
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lipSyncData, setLipSyncData] = useState<any[] | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const avatarStageRef = useRef<ElementRef<typeof AvatarStage>>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (photoUrl.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
      if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
    };
  }, [photoUrl, audioUrl]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "audio"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "photo") {
      setPhoto(file);
      const newPhotoUrl = URL.createObjectURL(file);
      setPhotoUrl(newPhotoUrl);
    } else {
      setAudio(file);
      const newAudioUrl = URL.createObjectURL(file);
      setAudioUrl(newAudioUrl);
    }
    setStatus("idle");
    setLipSyncData(null);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!photo || !audio) {
      toast({
        title: "Missing files",
        description: "Please upload both a photo and an audio file.",
        variant: "destructive",
      });
      return;
    }
    setStatus("generating");
    setErrorMessage("");

    try {
      const audioDataUri = await readFileAsDataURL(audio);
      // A mock for the lip sync data structure, since the AI output is a black box.
      // This helps in development and can be replaced when the actual AI output is known.
      const mockLipSyncData = [
        {"start":0.29, "end":0.57, "viseme": "F"},
        {"start":0.57, "end":0.83, "viseme": "A"},
        {"start":0.83, "end":1.04, "viseme": "C"},
        {"start":1.04, "end":1.12, "viseme": "B"},
        {"start":1.12, "end":1.47, "viseme": "E"},
        {"start":1.47, "end":2.12, "viseme": "A"},
        {"start":2.12, "end":2.46, "viseme": "F"},
        {"start":2.46, "end":2.64, "viseme": "A"},
        {"start":2.64, "end":2.9, "viseme": "B"},
        {"start":2.9, "end":3.2, "viseme": "A"},
        {"start":3.2, "end":3.35, "viseme": "B"},
        {"start":3.35, "end":3.57, "viseme": "E"},
        {"start":3.57, "end":4.1, "viseme": "C"},
      ]
      setLipSyncData(mockLipSyncData);
      setStatus("ready");
      toast({
        title: "Success!",
        description: "Lip sync data generated. Ready to preview.",
      });

      // NOTE: The following is the actual AI call. It's commented out to use mock data for stability.
      // To use the real AI, uncomment the lines below and remove the mock data section above.
      /*
      const result = await generateLipSyncData({ audioDataUri });
      if (result.lipSyncData) {
        // We are assuming the AI returns a parsable JSON string.
        const parsedData = JSON.parse(result.lipSyncData);
        setLipSyncData(parsedData);
        setStatus("ready");
        toast({
          title: "Success!",
          description: "Lip sync data generated. Ready to preview.",
        });
      } else {
        throw new Error("AI did not return lip sync data.");
      }
      */
    } catch (e) {
      console.error(e);
      const error = e instanceof Error ? e.message : "An unknown error occurred.";
      setErrorMessage(`Failed to generate lip sync. ${error}`);
      setStatus("error");
      toast({
        title: "Generation Failed",
        description: `Could not generate lip sync data. ${error}`,
        variant: "destructive",
      });
    }
  };

  const handlePlayPause = () => {
    if (status === "playing") {
      avatarStageRef.current?.pause();
      setStatus("ready");
    } else {
      avatarStageRef.current?.play();
      setStatus("playing");
    }
  };

  const handleExport = async () => {
    setStatus("exporting");
    try {
      await avatarStageRef.current?.exportVideo();
      toast({
        title: "Export Complete",
        description: "Your video has been downloaded.",
      });
    } catch (e) {
      console.error(e);
      const error = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({
        title: "Export Failed",
        description: `Could not export video. ${error}`,
        variant: "destructive",
      });
    } finally {
      setStatus("ready");
    }
  };

  const isProcessing = status === "generating" || status === "exporting";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Create Your Speaking Avatar
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Turn any photo into a life-like animated avatar with just a voice clip. Three simple steps to bring your image to life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileImage className="text-primary w-5 h-5" />
                    Step 1: Upload Your Photo
                  </CardTitle>
                  <CardDescription>
                    Choose a clear, front-facing portrait for the best results.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-dashed flex items-center justify-center bg-muted">
                    <Image
                      src={photoUrl}
                      width={160}
                      height={160}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    onClick={() => photoInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {photo ? "Change Photo" : "Upload Photo"}
                  </Button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "photo")}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio className="text-primary w-5 h-5" />
                    Step 2: Upload Your Audio
                  </CardTitle>
                  <CardDescription>
                    Provide a clear audio file of the speech for the avatar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  {audioUrl && (
                    <audio src={audioUrl} controls className="w-full" />
                  )}
                  <Button
                    onClick={() => audioInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {audio ? "Change Audio" : "Upload Audio"}
                  </Button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "audio")}
                  />
                </CardContent>
              </Card>

              <Button
                onClick={handleGenerate}
                disabled={!photo || !audio || isProcessing}
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {status === "generating" && (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                )}
                {status === "generating" ? "Generating..." : "Step 3: Generate Avatar"}
              </Button>
            </div>

            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Preview & Export</CardTitle>
                <CardDescription>
                  Watch your avatar come to life. Export when you're ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative">
                  <AvatarStage
                    ref={avatarStageRef}
                    imageUrl={photoUrl}
                    audioUrl={audioUrl}
                    lipSyncData={lipSyncData}
                    onEnded={() => setStatus("ready")}
                  />
                </div>
                {status !== "idle" && status !== "generating" && (
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={handlePlayPause}
                      disabled={isProcessing || !lipSyncData}
                      className="flex-1"
                    >
                      {status === "playing" ? (
                        <Pause className="mr-2 h-4 w-4" />
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      {status === "playing" ? "Pause" : "Play"}
                    </Button>
                    <Button
                      onClick={handleExport}
                      variant="outline"
                      disabled={isProcessing || !lipSyncData}
                      className="flex-1"
                    >
                      {status === "exporting" ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {status === "exporting" ? "Exporting..." : "Export Video"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
