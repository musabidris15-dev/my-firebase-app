'use client';

import Link from 'next/link';
import { Bot } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function Navbar() {
  // For now, we'll assume the user is not logged in.
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              Geez Voice
            </span>
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/tts"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Text-to-Speech
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
            {isLoggedIn ? (
                // Placeholder for logged-in user avatar menu
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    {/* Avatar component here */}
                </Button>
            ) : (
                <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild size="sm">
                       <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
}
