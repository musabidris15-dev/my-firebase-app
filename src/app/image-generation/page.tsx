'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('A majestic lion with a golden mane, standing on a rocky outcrop overlooking the Ethiopian highlands at sunset.');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const response = await fetch('/api/image-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unexpected error occurred while generating the image.');
      }

      if (result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
      } else {
        throw new Error('The image generation service did not return an image.');
      }
    } catch (err: any) {
      console.error("Image Generation Error:", err);
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Image Generation</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Create stunning visuals from your text prompts. Each image costs 1,000 characters.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-8">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">1. Describe Your Image</h3>
            <Textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A futuristic city with flying cars and holographic billboards..."
              className="text-lg"
            />
          </div>

          <div className="space-y-4">
             <Button 
                className="w-full text-lg py-6"
                onClick={handleGenerateImage}
                disabled={isLoading}
              >
                {isLoading ? (
                   <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                   <ImageIcon className="mr-2 h-6 w-6" />
                )}
                <span>Generate Image</span>
            </Button>
          </div>

          {error && (
             <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4 pt-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                <p className="font-medium">Generating your image... this may take a moment.</p>
            </div>
          )}

          {generatedImageUrl && (
            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-xl text-center">Your Generated Image</h3>
              <div className="rounded-lg overflow-hidden border-2 border-primary shadow-md">
                <Image 
                    src={generatedImageUrl} 
                    alt="Generated image based on prompt"
                    width={1024}
                    height={1024}
                    className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
