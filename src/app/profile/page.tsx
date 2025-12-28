'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Image as ImageIcon, ShoppingCart, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

const userProfile = {
    name: 'Creator',
    email: 'creator@example.com',
    plan: 'Creator',
    creditsUsed: 2500,
    creditsRemaining: 97500,
    totalCredits: 100000,
};

const referralLink = `https://geezvoice.app/join?ref=${userProfile.name.toLowerCase().replace(' ', '-')}`;

const creditUsagePercentage = (userProfile.creditsUsed / userProfile.totalCredits) * 100;

export default function ProfilePage() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <div className="container mx-auto max-w-7xl">
            <header className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Account & Subscription</h1>
                <p className="text-lg text-muted-foreground mt-2">Manage your account settings, subscription plan, and credit usage.</p>
            </header>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column */}
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Referral Program</CardTitle>
                            <CardDescription>Invite others and earn rewards.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">Share your unique link to invite others to the platform. You'll get bonus credits for every new user who signs up!</p>
                            <div className="flex space-x-2">
                                <Input value={referralLink} readOnly />
                                <Button onClick={handleCopy} variant="outline" size="icon" className="shrink-0">
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    <span className="sr-only">Copy referral link</span>
                                </Button>
                            </div>
                             {copied && <p className="text-xs text-green-600 font-medium text-center">Copied to clipboard!</p>}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Column */}
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
                                        $11<span className="text-sm font-normal text-muted-foreground">/month</span>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />100,000 Characters/mo</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Up to 130 mins of audio</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Standard Voices</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Basic Voice Effects</li>
                                        <li className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-blue-500" />Image Generation (1k chars/img)</li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="flex-col items-stretch space-y-2">
                                    <Button className="w-full">Choose Hobbyist</Button>
                                    <Button variant="outline" className="w-full" asChild>
                                      <Link href="https://whop.com/checkout/PLACEHOLDER_HOBBYIST_PLAN_ID" target="_blank" rel="noopener noreferrer">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Pay with Whop
                                      </Link>
                                    </Button>
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
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />350,000 Characters/mo</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Up to 460 mins of audio</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Premium & Custom Voices</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Advanced Voice Effects</li>
                                        <li className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-blue-500" />Image Generation (1k chars/img)</li>
                                        <li className="flex items-center"><Zap className="mr-2 h-4 w-4 text-yellow-500" />Priority Support</li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="flex-col items-stretch space-y-2">
                                    <Button className="w-full">Choose Creator</Button>
                                    <Button variant="outline" className="w-full" asChild>
                                      <Link href="https://whop.com/checkout/PLACEHOLDER_CREATOR_PLAN_ID" target  ="_blank" rel="noopener noreferrer">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Pay with Whop
                                      </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
