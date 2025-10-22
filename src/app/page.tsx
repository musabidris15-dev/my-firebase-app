"use client";

import { useState, useRef, useEffect, type ElementRef } from "react";
import {
  FileImage,
  FileAudio,
  Loader,
  Download,
  Upload,
  Video,
} from "lucide-react";
import { Header } from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateAvatarVideo } from "@/ai/flows/generate-avatar-video";
import Image from "next/image";

type Status = "idle" | "generating" | "ready" | "error";

export default function Home() {
  const { toast } = useToast();
  const [photo, setPhoto] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (photoUrl?.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
      if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
      if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
    };
  }, [photoUrl, audioUrl, videoUrl]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "audio"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "photo") {
      setPhoto(file);
      if (photoUrl?.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
      const newPhotoUrl = URL.createObjectURL(file);
      setPhotoUrl(newPhotoUrl);
    } else {
      setAudio(file);
      if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
      const newAudioUrl = URL.createObjectURL(file);
      setAudioUrl(newAudioUrl);
    }
    setStatus("idle");
    setVideoUrl(null);
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
    setVideoUrl(null);

    try {
      const photoDataUri = await readFileAsDataURL(photo);
      const audioDataUri = await readFileAsDataURL(audio);
      
      const result = await generateAvatarVideo({ photoDataUri, audioDataUri });

      if (result.videoDataUri) {
        setVideoUrl(result.videoDataUri);
        setStatus("ready");
        toast({
          title: "Success!",
          description: "Your talking avatar video has been generated.",
        });
      } else {
        throw new Error("The AI model did not return a video.");
      }
    } catch (e) {
      console.error(e);
      const error = e instanceof Error ? e.message : "An unknown error occurred.";
      setErrorMessage(`Failed to generate video. ${error}`);
      setStatus("error");
      toast({
        title: "Generation Failed",
        description: `Could not generate video. ${error}`,
        variant: "destructive",
      });
    }
  };
  
  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "avatar_talk.mp4"; // Changed to mp4 for better compatibility
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  const isProcessing = status === "generating";

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
                    {photoUrl ? (
                        <Image
                            src={photoUrl}
                            width={160}
                            height={160}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-muted-foreground text-sm">Photo Preview</div>
                    )}
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
                <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
                  {isProcessing && <Loader className="h-8 w-8 animate-spin text-primary" />}
                  {!isProcessing && videoUrl && (
                     <video src={videoUrl} className="w-full h-full" controls autoPlay loop />
                  )}
                  {!isProcessing && !videoUrl && (
                    <div className="text-center text-muted-foreground p-4">
                        <Video className="mx-auto h-12 w-12" />
                        <p className="mt-2">Your generated video will appear here.</p>
                    </div>
                  )}
                </div>
                {status === "ready" && videoUrl && (
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                       Export Video
                    </Button>
                  </div>
                )}
                 {status === "error" && (
                    <p className="text-sm text-destructive">{errorMessage}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
