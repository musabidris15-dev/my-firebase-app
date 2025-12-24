'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap } from 'lucide-react';

const userProfile = {
    name: 'Guest User',
    email: 'guest@example.com',
    plan: 'Free Tier',
    creditsUsed: 2500,
    creditsRemaining: 7500,
    totalCredits: 10000,
};

const creditUsagePercentage = (userProfile.creditsUsed / userProfile.totalCredits) * 100;

export default function ProfilePage() {
    return (
        <div className="container mx-auto max-w-7xl">
            <header className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Account & Subscription</h1>
                <p className="text-lg text-muted-foreground mt-2">Manage your account settings, subscription plan, and credit usage.</p>
            </header>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Profile Information */}
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                <p className="font-semibold">{userProfile.name}</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                                <p className="font-semibold">{userProfile.email}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Subscription and Credits */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription & Credits</CardTitle>
                            <CardDescription>Your current plan and usage details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                                    <p className="text-xl font-bold text-primary">{userProfile.plan}</p>
                                </div>
                                <Button>Upgrade Plan</Button>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="font-semibold text-lg">Character Credits</h4>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">{userProfile.creditsRemaining.toLocaleString()}</span> remaining
                                    </p>
                                </div>
                                <Progress value={creditUsagePercentage} className="h-3" />
                                <p className="text-xs text-muted-foreground mt-2 text-right">
                                    {userProfile.creditsUsed.toLocaleString()} of {userProfile.totalCredits.toLocaleString()} characters used
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Pricing Plans */}
                    <Card>
                         <CardHeader>
                            <CardTitle>Explore Plans</CardTitle>
                            <CardDescription>Choose a plan that fits your creative needs.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>Hobbyist</CardTitle>
                                    <CardDescription>Perfect for personal projects and getting started.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div className="text-4xl font-bold">
                                        $12<span className="text-sm font-normal text-muted-foreground">/month</span>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />40,000 Characters/mo</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Up to 50 mins of audio</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Standard Voices</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Basic Voice Effects</li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">Choose Hobbyist</Button>
                                </CardFooter>
                            </Card>
                            <Card className="border-primary flex flex-col">
                               <CardHeader>
                                    <div className="flex justify-between items-center">
                                       <CardTitle>Creator</CardTitle>
                                       <div className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">Most Popular</div>
                                    </div>
                                    <CardDescription>For content creators and professionals.</CardDescription>
                                </CardHeader>
                               <CardContent className="flex-grow space-y-4">
                                    <div className="text-4xl font-bold">
                                        $30<span className="text-sm font-normal text-muted-foreground">/month</span>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />150,000 Characters/mo</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Up to 200 mins of audio</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Premium & Custom Voices</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Advanced Voice Effects</li>
                                        <li className="flex items-center"><Zap className="mr-2 h-4 w-4 text-yellow-500" />Priority Support</li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">Choose Creator</Button>
                                </CardFooter>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
