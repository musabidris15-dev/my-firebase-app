
'use client';

import { Button } from '@/components/ui/button';
import { Languages, Clapperboard, MicVocal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-1 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 text-center">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Bring Your Words to Life with <span className="font-amharic text-primary">ግዕዝ</span> Voice
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                    Generate incredibly natural-sounding AI speech in Amharic and English. Perfect for creators, educators, and businesses who need high-quality voice-overs in a fraction of the time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-32 border-t">
          <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="space-y-2">
                      <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Powerful Features, Simple Interface</h2>
                      <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                          Geez Voice is packed with features to make your content shine.
                      </p>
                  </div>
              </div>
              <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
                  <div className="grid gap-1 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                          <Languages className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold">Multi-Lingual Support</h3>
                      <p className="text-sm text-muted-foreground">Flawlessly synthesize speech in both Amharic and English.</p>
                  </div>
                  <div className="grid gap-1 text-center">
                       <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                          <MicVocal className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold">Diverse Voice Library</h3>
                      <p className="text-sm text-muted-foreground">Dozens of unique voices to find the perfect tone for your content.</p>
                  </div>
                  <div className="grid gap-1 text-center">
                       <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                          <Clapperboard className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold">For Content Creators</h3>
                      <p className="text-sm text-muted-foreground">Create voice-overs for videos, podcasts, and presentations with ease.</p>
                  </div>
              </div>
          </div>
        </section>
        
        {/* Interface Glimpse Section */}
        <section className="w-full py-20 md:py-32 bg-muted/50 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Glimpse of the Interface</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                A clean, intuitive, and powerful interface designed for a seamless creative workflow.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-card p-4 rounded-lg shadow-md">
                <Image
                  src="https://picsum.photos/seed/coffee-ceremony/600/400"
                  width={600}
                  height={400}
                  data-ai-hint="coffee ceremony"
                  alt="App Interface 1"
                  className="rounded-md object-cover aspect-video"
                />
                <p className="mt-4 text-sm font-medium">Simple & Powerful Text-to-Speech</p>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-md">
                 <Image
                  src="https://picsum.photos/seed/african-village/600/400"
                  width={600}
                  height={400}
                  data-ai-hint="African village"
                  alt="African village with huts"
                  className="rounded-md object-cover aspect-video"
                />
                 <p className="mt-4 text-sm font-medium">Culturally Rich Voice Models</p>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
