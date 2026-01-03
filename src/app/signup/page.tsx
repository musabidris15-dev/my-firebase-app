
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignUp, initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 74.2C313.6 103.6 283.7 88 248 88c-77.4 0-140.2 62.8-140.2 140.2s62.8 140.2 140.2 140.2c86.3 0 118.5-62.8 122.5-92.4H248v-87.1h235.5c4.7 27.5 7.5 56.5 7.5 87.1z"></path>
    </svg>
);


export default function SignUpPage() {
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    const handleEmailSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        if (auth) {
            initiateEmailSignUp(auth, email, password);
        }
    };

    const handleGoogleSignIn = () => {
        if (auth) {
            initiateGoogleSignIn(auth);
        }
    };

    if (isUserLoading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create an Account</CardTitle>
                    <CardDescription>Join Geez Voice to start creating.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                        <GoogleIcon />
                        Sign up with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailSignUp} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                         {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        <Button type="submit" className="w-full">
                            Create Account
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-4 text-sm">
                     <p>
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
