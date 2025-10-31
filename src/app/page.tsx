'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bot, FileText, Settings, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// For now, we'll assume the user is not logged in.
const isLoggedIn = false;

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/tts');
    }
  }, [router]);

  if (isLoggedIn) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
        <div className="container mx-auto flex items-center justify-between gap-2">
           <Link href="/" className="flex items-center space-x-2 text-lg font-bold">
              <Bot className="h-7 w-7 text-primary" />
              <span>Geez Voice</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto text-center py-20 px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Bring Your Words to Life with AI Voices
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Generate incredibly natural-sounding AI speech in Amharic and English. Perfect for creators, educators, and businesses who need high-quality voice-overs in a fraction of the time.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">I have an account</Link>
            </Button>
          </div>
        </section>

        <section className="bg-muted py-20 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <Image
                  src="https://picsum.photos/seed/1/600/400"
                  alt="App interface showing text input and voice selection"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                  data-ai-hint="app screenshot"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Powerful & Easy to Use</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Our intuitive interface makes it simple to generate high-quality audio. Just type your text, choose a voice, and create.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <span>Convert long-form content with ease.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <SlidersHorizontal className="h-6 w-6 text-primary" />
                    <span>Fine-tune pitch, speed, and tone for the perfect delivery.</span>
                  </li>
                   <li className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-primary" />
                    <span>Save your audio files in multiple formats.</span>
                  </li>
                </ul>
              </div>
            </div>
             <div className="grid md:grid-cols-2 gap-12 items-center mt-24">
              <div className="md:order-2">
                 <Image
                  src="https://picsum.photos/seed/2/600/400"
                  alt="App interface showing audio player and download options"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                  data-ai-hint="dashboard interface"
                />
              </div>
              <div className="md:order-1">
                <h2 className="text-3xl font-bold tracking-tight mb-4">From Text to Speech in Seconds</h2>
                <p className="text-muted-foreground text-lg">
                  Experience a seamless workflow that transforms your written content into natural-sounding speech instantly. Preview your audio, make adjustments, and download your file without ever leaving the page.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <footer className="py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Geez Voice. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
