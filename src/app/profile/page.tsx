
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, ShoppingCart, Copy, Check, Gift, AlertTriangle, CalendarClock, Users, Loader2, LogOut, Trash2, Code } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { addDays, format, differenceInDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirebaseApp, useUser } from '@/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const planLinks = {
    hobbyist_monthly: 'https://whop.com/checkout/plan_gumriTEj5ozKe',
    hobbyist_yearly: 'https://whop.com/checkout/plan_cGxf08gK0OBVC',
    creator_monthly: 'https://whop.com/checkout/plan_6VPgm0sLSThCZ',
    creator_yearly: 'https://whop.com/checkout/plan_Xh8nEVACfO2aS',
} as const;


export default function ProfilePage() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
    const [copied, setCopied] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [creatorGlow, setCreatorGlow] = useState(false);
    const [daysUntilPlanExpires, setDaysUntilPlanExpires] = useState<number | null>(null);
    const [nextRenewalDate, setNextRenewalDate] = useState<string | null>(null);
    const [shouldShowRenewalMessage, setShouldShowRenewalMessage] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const firebaseApp = useFirebaseApp();
    const { user, auth } = useUser();
    const plansRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const initialProfile: UserProfile = {
            name: 'Abebe Bikila',
            email: 'abebe.bikila@example.com',
            planId: 'free',
            subscriptionTier: null,
            creditsUsed: 200,
            creditsRemaining: 1800,
        };

        const initialPlanDetails: PlanDetails = {
            totalCredits: 2000
        };
        
        setUserProfile(initialProfile);
        setPlanDetails(initialPlanDetails);
        setBillingCycle(initialProfile.subscriptionTier || 'monthly');

        const today = new Date();
        const subscriptionEndDate = null; // No end date for free users
        const lastCreditRenewalDate = null; // No renewal for free users
        
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

    const referralLink = user ? `https://geezvoice.app/join?ref=${user.uid}` : '';
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
    
    const getPlanUrl = (plan: 'hobbyist' | 'creator') => {
        const tier = billingCycle === 'monthly' ? 'monthly' : 'yearly';
        const planKey = `${plan}_${tier}` as keyof typeof planLinks;
        let url = planLinks[planKey];
        if (user) {
            url += `?metadata[firebase_uid]=${user.uid}`;
        }
        return url;
    }

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            const functions = getFunctions(firebaseApp);
            const cancelSub = httpsCallable(functions, 'cancelSubscription');
            const result = await cancelSub();
            toast({
                title: "Subscription Cancellation",
                description: (result.data as any).message || "Your request has been processed.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Cancellation Failed",
                description: error.message || "Could not cancel your subscription. Please contact support.",
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const functions = getFunctions(firebaseApp);
            const deleteAccount = httpsCallable(functions, 'deleteUserAccount');
            await deleteAccount();
            toast({
                title: "Account Deleted",
                description: "Your account and all associated data have been permanently deleted.",
            });
            if(auth) await signOut(auth);
            // Redirect or handle post-deletion state
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: error.message || "Could not delete your account. Please contact support.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/');
        }
    };

    const hobbyistPrice = billingCycle === 'monthly' ? 15 : 144;
    const creatorPrice = billingCycle === 'monthly' ? 39 : 374.40;

    if (!userProfile || !planDetails) {
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
                        <CardFooter>
                            <Button variant="outline" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5 text-primary" />
                                Referral Program
                            </CardTitle>
                            <CardDescription>Invite others and earn rewards.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {referralBonus 
                                    ? `As a ${userProfile.planId} member, you earn a ${referralBonus} credit bonus for every new paid subscriber.`
                                    : 'Invite friends to earn rewards! You will receive credit bonuses for each new subscriber once you upgrade.'
                                }
                            </p>
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
                                {userProfile.planId !== 'creator' && <Button onClick={() => plansRef.current?.scrollIntoView({ behavior: 'smooth' })}>Upgrade Plan</Button>}
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
                        {userProfile.planId !== 'free' && (
                            <CardFooter>
                                <Button variant="outline" onClick={handleCancelSubscription} disabled={isCancelling}>
                                    {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Cancel Subscription
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                    
                    <div id="upgrade-plans" ref={plansRef}>
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
                                             <Button asChild className="w-full" variant={userProfile.planId === 'free' ? 'default' : 'outline'}>
                                                <Link href={getPlanUrl('hobbyist')} target="_blank" rel="noopener noreferrer">
                                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                                    Subscribe
                                                </Link>
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
                                            <Button asChild className={cn("w-full", creatorGlow && "animate-pulse shadow-lg shadow-primary/50")}>
                                                <Link href={getPlanUrl('creator')} target="_blank" rel="noopener noreferrer">
                                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                                    {userProfile.planId === 'hobbyist' ? 'Upgrade to Creator' : 'Subscribe'}
                                                </Link>
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-5 w-5 text-muted-foreground" />
                                Developer Tools
                            </CardTitle>
                             <CardDescription>Use these tools for testing and verification.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="secondary">
                                <Link href={`https://whop.com/checkout/plan_S0CZdw9meDbCs?metadata[firebase_uid]=${user?.uid}`} target="_blank" rel="noopener noreferrer">
                                    Test Webhook ($0 Checkout)
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Deleting your account is a permanent action and cannot be undone. All your data, including generated audio and personal settings, will be erased forever.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete My Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Yes, delete my account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

    