'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Languages, Clapperboard, MicVocal } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-muted p-8 text-center relative">
         <Link href="/" className="absolute top-8 left-8 flex items-center space-x-2 text-lg font-bold">
            <Bot className="h-7 w-7 text-primary" />
            <span>Geez Voice</span>
        </Link>
        <div className="max-w-md">
            <h1 className="text-4xl font-bold tracking-tight">Bring Your Words to Life</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Generate incredibly natural-sounding AI speech in Amharic and English. Perfect for creators, educators, and businesses.
            </p>
            <div className="mt-8 space-y-6 text-left">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                        <Languages className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Multi-Lingual Support</h3>
                        <p className="text-muted-foreground">Flawlessly synthesize speech in both Amharic and English with a wide range of voices.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                        <MicVocal className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Diverse Voice Library</h3>
                        <p className="text-muted-foreground">Choose from dozens of unique male and female voices to find the perfect tone for your content.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                        <Clapperboard className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">For Content Creators</h3>
                        <p className="text-muted-foreground">Create voice-overs for videos, podcasts, and presentations in a fraction of the time.</p>
                    </div>
                </div>
            </div>
        </div>
        <footer className="absolute bottom-8 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Geez Voice. All Rights Reserved.
        </footer>
      </div>
      <div className="flex items-center justify-center p-4 min-h-screen">
         <Link href="/" className="absolute top-8 right-8 text-sm font-medium text-muted-foreground hover:text-primary lg:hidden">
            Home
        </Link>
        <Card className="w-full max-w-sm border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4">
            <Button className="w-full">Sign in</Button>
            <Button variant="outline" className="w-full">
              Sign in with Google
            </Button>
             <p className="text-sm text-center text-muted-foreground w-full">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
