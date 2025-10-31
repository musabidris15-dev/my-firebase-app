'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import Link from 'next/link';

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
      <main className="flex-grow flex items-center justify-center">
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
      </main>
      <footer className="py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Geez Voice. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
