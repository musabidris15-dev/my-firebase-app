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
import { Bot } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="mb-8 text-center">
        <Link href="/" className="flex items-center justify-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">
              Geez Voice
            </span>
          </Link>
          <p className="text-muted-foreground mt-2">
            AI-powered Text to Speech synthesis.
          </p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button className="w-full">Sign in</Button>
           <p className="mt-4 text-xs text-center text-muted-foreground w-full">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline hover:text-primary">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
