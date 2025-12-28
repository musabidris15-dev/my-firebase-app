
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, ShoppingCart, Copy, Check, Gift, AlertTriangle, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { addDays, format, differenceInDays, isBefore } from 'date-fns';

const now = new Date();

const userProfile = {
    name: 'Free User',
    email: 'free.user@example.com',
    planId: 'free',
    subscriptionTier: null,
    subscriptionStartDate: null,
    subscriptionEndDate: null,
    creditsUsed: 500,
    creditsRemaining: 500,
    lastCreditRenewalDate: null
};

const getPlanDetails = (planId: string) => {
    switch(planId) {
        case 'creator':
            return { totalCredits: 350000 };
        case 'hobbyist':
            return { totalCredits: 100000 };
        default:
            return { totalCredits: 1000 };
    }
}

const { totalCredits } = getPlanDetails(userProfile.planId);
const referralLink = `https://geezvoice.app/join?ref=${userProfile.name.toLowerCase().replace(' ', '-')}`;
const creditUsagePercentage = (userProfile.creditsUsed / totalCredits) * 100;
const nextRenewalDate = userProfile.lastCreditRenewalDate ? addDays(userProfile.lastCreditRenewalDate, 30) : null;
const daysUntilPlanExpires = userProfile.subscriptionEndDate ? differenceInDays(userProfile.subscriptionEndDate, now) : null;
const shouldShowRenewalMessage = userProfile.subscriptionEndDate && isBefore(userProfile.subscriptionEndDate, addDays(now, 30));


export default function ProfilePage() {
    const [copied, setCopied] = useState(false);
    const [billingCycle, setBillingCycle] = useState(userProfile.subscriptionTier || 'monthly');

    const getReferralBonus = () => {
        switch (userProfile.planId) {
            case 'creator':
                return '15%';
            case 'hobbyist':
                return '5%';
            default:
                return null;
        }
    };

    const referralBonus = getReferralBonus();

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };
    
    const hobbyistPrice = billingCycle === 'monthly' ? 15 : 15 * 12 * 0.8;
    const creatorPrice = billingCycle === 'monthly' ? 39 : 39 * 12 * 0.8;

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
                            <CardTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5 text-primary" />
                                Referral Program
                            </CardTitle>
                            <CardDescription>Invite others and earn free credits.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {referralBonus ? (
                                <p className="text-sm text-muted-foreground">
                                    As a <span className="font-semibold text-primary capitalize">{userProfile.planId}</span> member, you'll earn a <span className="font-semibold">{referralBonus}</span> credit bonus for every new paid subscriber who signs up using your link.
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                   Upgrade to a paid plan to earn referral bonuses when you invite new users.
                                </p>
                            )}
                            <div className="flex space-x-2">
                                <Input value={referralLink} readOnly />
                                <Button onClick={handleCopy} variant="outline" size="icon" className="shrink-0" disabled={!referralBonus}>
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
                             {shouldShowRenewalMessage && daysUntilPlanExpires !== null && (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-4">
                                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Your Plan is Expiring Soon</h4>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400">Your yearly subscription expires in {daysUntilPlanExpires} days. Please renew to continue enjoying your benefits.</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                                    <p className="text-xl font-bold text-primary capitalize">{userProfile.planId}{userProfile.subscriptionTier ? ` (${userProfile.subscriptionTier})` : ''}</p>
                                </div>
                                {userProfile.planId !== 'creator' && <Button>Upgrade Plan</Button>}
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="font-semibold text-lg">Character Credits</h4>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">{(totalCredits - userProfile.creditsUsed).toLocaleString()}</span> remaining
                                    </p>
                                </div>
                                <Progress value={creditUsagePercentage} className="h-3" />
                                <div className="flex justify-between items-start text-xs text-muted-foreground mt-2">
                                     <div className="flex items-center gap-1.5">
                                        {nextRenewalDate && (
                                            <>
                                                <CalendarClock className="h-3 w-3" />
                                                <span>Credits renew on {format(nextRenewalDate, 'MMM d, yyyy')}</span>
                                            </>
                                        )}
                                    </div>
                                    <span>
                                        {userProfile.creditsUsed.toLocaleString()} of {totalCredits.toLocaleString()} characters used
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Pricing Plans */}
                    <Card>
                         <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <CardTitle>Explore Plans</CardTitle>
                                    <CardDescription>Choose a plan that fits your creative needs.</CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="billing-cycle" className={billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}>Monthly</Label>
                                    <Switch
                                        id="billing-cycle"
                                        checked={billingCycle === 'yearly'}
                                        onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                                    />
                                    <Label htmlFor="billing-cycle" className={billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}>Yearly</Label>
                                    <div className="text-xs font-bold uppercase text-green-600 bg-green-500/10 px-2 py-1 rounded-full">20% Off</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <Card className={`flex flex-col ${userProfile.planId === 'hobbyist' ? 'border-muted' : ''}`}>
                                <CardHeader>
                                    <CardTitle>Hobbyist</CardTitle>
                                    <CardDescription>Perfect for personal projects and getting started.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div className="text-4xl font-bold">
                                        ${hobbyistPrice.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />100,000 Characters/mo</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Up to 130 mins of audio</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Standard Voices</li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="flex-col items-stretch space-y-2">
                                    {userProfile.planId === 'hobbyist' ? (
                                        <Button className="w-full" disabled>Current Plan</Button>
                                    ) : (
                                        <>
                                            <Button className="w-full">Choose Hobbyist</Button>
                                            <Button variant="outline" className="w-full" asChild>
                                              <Link href="https://whop.com/checkout/PLACEHOLDER_HOBBYIST_PLAN_ID" target="_blank" rel="noopener noreferrer">
                                                <ShoppingCart className="mr-2 h-4 w-4" />
                                                Pay with Whop
                                              </Link>
                                            </Button>
                                        </>
                                    )}
                                </CardFooter>
                            </Card>
                            <Card className={`flex flex-col ${userProfile.planId === 'creator' ? 'border-primary' : ''}`}>
                               <CardHeader>
                                    <div className="flex justify-between items-center">
                                       <CardTitle>Creator</CardTitle>
                                       <div className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">Most Popular</div>
                                    </div>
                                    <CardDescription>For content creators and professionals.</CardDescription>
                                </CardHeader>
                               <CardContent className="flex-grow space-y-4">
                                    <div className="text-4xl font-bold">
                                        ${creatorPrice.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />350,000 Characters/mo</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Up to 460 mins of audio</li>
                                        <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Premium & Custom Voices</li>
                                        <li className="flex items-center"><Zap className="mr-2 h-4 w-4 text-yellow-500" />Priority Support</li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="flex-col items-stretch space-y-2">
                                     {userProfile.planId === 'creator' ? (
                                        <Button className="w-full" disabled>Current Plan</Button>
                                    ) : (
                                        <>
                                            <Button className="w-full">{userProfile.planId === 'hobbyist' ? 'Upgrade to Creator' : 'Choose Creator'}</Button>
                                            <Button variant="outline" className="w-full" asChild>
                                              <Link href="https://whop.com/checkout/PLACEHOLDER_CREATOR_PLAN_ID" target="_blank" rel="noopener noreferrer">
                                                <ShoppingCart className="mr-2 h-4 w-4" />
                                                Pay with Whop
                                              </Link>
                                            </Button>
                                        </>
                                    )}
                                </CardFooter>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
    