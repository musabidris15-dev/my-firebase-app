
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, ShoppingCart, Copy, Check, Gift, AlertTriangle, CalendarClock, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { addDays, format, differenceInDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirebaseApp } from '@/firebase';

type UserProfile = {
    name: string;
    email: string;
    planId: string;
    subscriptionTier: string | null;
    creditsUsed: number;
    creditsRemaining: number;
};

type PlanDetails = {
    totalCredits: number;
};

type PlanKey = 'hobbyist_monthly' | 'hobbyist_yearly' | 'creator_monthly' | 'creator_yearly';

export default function ProfilePage() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
    const [copied, setCopied] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [creatorGlow, setCreatorGlow] = useState(false);
    const [daysUntilPlanExpires, setDaysUntilPlanExpires] = useState<number | null>(null);
    const [nextRenewalDate, setNextRenewalDate] = useState<string | null>(null);
    const [shouldShowRenewalMessage, setShouldShowRenewalMessage] = useState(false);
    const [isLoading, setIsLoading] = useState<PlanKey | null>(null);
    const { toast } = useToast();
    const firebaseApp = useFirebaseApp();
    const plansRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // --- All data is now loaded on the client side ---
        const initialProfile: UserProfile = {
            name: 'Free User',
            email: 'free.user@example.com',
            planId: 'free',
            subscriptionTier: null,
            creditsUsed: 0,
            creditsRemaining: 1000,
        };

        const initialPlanDetails: PlanDetails = {
            totalCredits: 1000
        };
        
        setUserProfile(initialProfile);
        setPlanDetails(initialPlanDetails);
        setBillingCycle(initialProfile.subscriptionTier || 'monthly');

        // Date-sensitive calculations
        const today = new Date();
        const subscriptionEndDate = null; // Free users don't have an end date
        const lastCreditRenewalDate = null; // Free users don't have renewals
        
        if (subscriptionEndDate) {
            const days = differenceInDays(subscriptionEndDate, today);
            const expiresSoon = isBefore(subscriptionEndDate, addDays(today, 30));
            setDaysUntilPlanExpires(days > 0 ? days : 0);
            setShouldShowRenewalMessage(expiresSoon && days > 0);
        } else {
            setDaysUntilPlanExpires(null);
            setShouldShowRenewalMessage(false);
        }

        if (lastCreditRenewalDate) {
            setNextRenewalDate(format(addDays(lastCreditRenewalDate, 30), 'MMM d, yyyy'));
        } else {
            setNextRenewalDate(null);
        }
    }, []);

    const referralLink = userProfile ? `https://geezvoice.app/join?ref=${userProfile.name.toLowerCase().replace(' ', '-')}` : '';
    const creditUsagePercentage = (userProfile && planDetails) ? (userProfile.creditsRemaining / planDetails.totalCredits) * 100 : 0;

    const getReferralBonus = () => {
        if (!userProfile) return null;
        switch (userProfile.planId) {
            case 'creator': return '15%';
            case 'hobbyist': return '5%';
            default: return null;
        }
    };

    const referralBonus = getReferralBonus();

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const handleUpgradeClick = () => {
        const planKey: PlanKey = billingCycle === 'monthly' ? 'creator_monthly' : 'creator_yearly';
        handlePurchase(planKey);
    };

    const handlePurchase = async (planKey: PlanKey) => {
        if (!firebaseApp) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Firebase is not initialized. Please refresh the page.",
            });
            return;
        }
        setIsLoading(planKey);
        try {
            const functions = getFunctions(firebaseApp);
            const createSession = httpsCallable(functions, 'createWhopCheckoutSession');
            const result = await createSession({ planKey });
            
            const data = result.data as { url?: string };

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned from server.');
            }
        } catch (error: any) {
            console.error("Purchase Error:", error);
            toast({
                variant: 'destructive',
                title: "Uh oh! Something went wrong.",
                description: error.message || "Could not create a checkout session. Please try again.",
            });
        } finally {
            setIsLoading(null);
        }
    };

    const hobbyistPrice = billingCycle === 'monthly' ? 15 : 15 * 12 * 0.8;
    const creatorPrice = billingCycle === 'monthly' ? 39 : 39 * 12 * 0.8;

    if (!userProfile || !planDetails) {
        // Render a loading state or skeleton
        return (
            <div className="container mx-auto max-w-7xl">
                 <header className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight">Account & Subscription</h1>
                    <p className="text-lg text-muted-foreground mt-2">Manage your account settings, subscription plan, and credit usage.</p>
                </header>
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

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
                                    <p className="text-xl font-bold text-primary capitalize">{userProfile.planId === 'free' ? 'Free Tier' : userProfile.planId}{userProfile.subscriptionTier ? ` (${userProfile.subscriptionTier})` : ''}</p>
                                </div>
                                {userProfile.planId !== 'creator' && <Button onClick={handleUpgradeClick}>Upgrade Plan</Button>}
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="font-semibold text-lg">Character Credits</h4>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">{userProfile.creditsRemaining.toLocaleString()}</span> remaining
                                    </p>
                                </div>
                                <Progress value={creditUsagePercentage} className="h-3" />
                                <div className="flex justify-between items-start text-xs text-muted-foreground mt-2">
                                     <div className="flex items-center gap-1.5">
                                        {nextRenewalDate ? (
                                            <>
                                                <CalendarClock className="h-3 w-3" />
                                                <span>Credits renew on {nextRenewalDate}</span>
                                            </>
                                        ) : <span>One-time credits</span>}
                                    </div>
                                    <span>
                                        {userProfile.creditsUsed.toLocaleString()} of {planDetails.totalCredits.toLocaleString()} characters used
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Pricing Plans */}
                    <div ref={plansRef}>
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
                                <Card className={`flex flex-col ${userProfile.planId === 'hobbyist' ? 'border-primary' : ''}`}>
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
                                            <li className="flex items-center"><Users className="mr-2 h-4 w-4 text-green-500" />5% Referral Bonus</li>
                                        </ul>
                                    </CardContent>
                                    <CardFooter className="flex-col items-stretch space-y-2">
                                        {userProfile.planId === 'hobbyist' ? (
                                            <Button className="w-full" disabled>Current Plan</Button>
                                        ) : (
                                             <Button 
                                                className="w-full"
                                                onClick={() => handlePurchase(billingCycle === 'monthly' ? 'hobbyist_monthly' : 'hobbyist_yearly')}
                                                disabled={isLoading !== null}
                                            >
                                                {isLoading === `hobbyist_${billingCycle}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                                                Pay with Whop
                                            </Button>
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
                                            <li className="flex items-center"><Users className="mr-2 h-4 w-4 text-green-500" />15% Referral Bonus</li>
                                            <li className="flex items-center"><Zap className="mr-2 h-4 w-4 text-yellow-500" />Priority Support</li>
                                        </ul>
                                    </CardContent>
                                    <CardFooter className="flex-col items-stretch space-y-2">
                                         {userProfile.planId === 'creator' ? (
                                            <Button className="w-full" disabled>Current Plan</Button>
                                        ) : (
                                            <Button 
                                                className={cn("w-full", creatorGlow && "animate-pulse shadow-lg shadow-primary/50")}
                                                onClick={() => handlePurchase(billingCycle === 'monthly' ? 'creator_monthly' : 'creator_yearly')}
                                                disabled={isLoading !== null}
                                            >
                                                {isLoading === `creator_${billingCycle}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                                                {userProfile.planId === 'hobbyist' ? 'Upgrade to Creator' : 'Pay with Whop'}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );

    

    

    