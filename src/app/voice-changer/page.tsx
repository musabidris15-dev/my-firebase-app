'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wand, UploadCloud, Loader2, Play } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const voiceEffects = [
  { id: 'robot', name: 'Robot' },
  { id: 'alien', name: 'Alien' },
  { id: 'deep', name: 'Deep Voice' },
  { id: 'high-pitch', name: 'High Pitch' },
  { id: 'echo', name: 'Echo Chamber' },
  { id: 'reverb', name: 'Reverb' },
  { id: 'movie-character', name: 'Movie Character' },
  { id: 'anime-character', name: 'Anime Character' },
  { id: 'celebrity', name: 'Celebrity' },
];

export default function VoiceChangerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string>(voiceEffects[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File is too large. Please upload an audio file under 10MB.');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setError(null);
        setProcessedAudioUrl(null);
      }
    }
  };

  const handleApplyEffect = async () => {
    if (!selectedFile) {
      setError('Please upload an audio file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedAudioUrl(null);
    
    // NOTE: This is a placeholder for the actual voice changing logic.
    // In a real application, you would send the audio file and the selected
    // effect to a backend service that uses an AI model to process the audio.
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demonstration, we'll just "return" the original audio.
    const fileUrl = URL.createObjectURL(selectedFile);
    setProcessedAudioUrl(fileUrl);
    
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Voice Changer</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Upload an audio file and transform it with AI-powered effects.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-8">
          
          {/* Step 1: Upload Audio */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">1. Upload Audio</h3>
            <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg">
              <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
              <Label htmlFor="audio-upload" className="font-semibold text-primary cursor-pointer mb-2">
                Click to upload an audio file
              </Label>
              <p className="text-xs text-muted-foreground">MP3, WAV, M4A (Max 10MB)</p>
              <Input id="audio-upload" type="file" className="hidden" accept="audio/*" onChange={handleFileChange} />
            </div>
            {selectedFile && (
              <div className="text-sm text-center text-muted-foreground">
                File selected: <span className="font-medium text-foreground">{selectedFile.name}</span>
              </div>
            )}
          </div>

          {/* Step 2: Select Effect */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">2. Select an Effect</h3>
            <RadioGroup
              value={selectedEffect}
              onValueChange={setSelectedEffect}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {voiceEffects.map((effect) => (
                <Label
                  key={effect.id}
                  htmlFor={effect.id}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer',
                    'hover:bg-accent hover:text-accent-foreground',
                    selectedEffect === effect.id && 'border-primary bg-accent'
                  )}
                >
                  <RadioGroupItem value={effect.id} id={effect.id} className="sr-only" />
                  <span className="font-medium">{effect.name}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Step 3: Generate */}
          <div className="space-y-4">
             <Button 
                className="w-full text-lg py-6"
                onClick={handleApplyEffect}
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? (
                   <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                   <Wand className="mr-2 h-6 w-6" />
                )}
                <span>Apply Effect</span>
            </Button>
          </div>

          {/* Result */}
          {error && (
             <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {processedAudioUrl && (
            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-xl text-center">Your Transformed Audio</h3>
              <audio ref={audioPlayerRef} src={processedAudioUrl} controls className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
