'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, ShoppingCart, Copy, Check, Gift, AlertTriangle, CalendarClock, Users, Loader2, LogOut, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { addDays, format, differenceInDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirebaseApp, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// FIX: Added getAuth import
import { signOut, getAuth } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// FIX: Added getFirestore import
import { doc, getFirestore } from 'firebase/firestore';

type UserProfile = {
    name: string;
    email: string;
    planId: string;
    subscriptionTier: string | null;
    creditsUsed: number;
    creditsRemaining: number;
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
    // FIX: Initialize auth and db correctly
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
    
    // FIX: Removed 'auth' from useUser destructuring (it doesn't exist there)
    const { user } = useUser();
    const router = useRouter();

    const userDocRef = useMemoFirebase(() => {
        // FIX: Use 'user' directly and 'db' instead of 'auth.firestore'
        if (!user) return null;
        return doc(db, 'users', user.uid);
    }, [user, db]);

    const { data: liveProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
        if (liveProfile) {
            setUserProfile(liveProfile);
            setBillingCycle(liveProfile.subscriptionTier || 'monthly');
            const today = new Date();
            // @ts-ignore
            const subscriptionEndDate = liveProfile.subscriptionEndDate?.toDate();
            // @ts-ignore
            const lastCreditRenewalDate = liveProfile.lastCreditRenewalDate?.toDate();

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

        } else if (!isProfileLoading) {
            // Set a default for non-logged-in or new users for display purposes before redirect
             setUserProfile({
                name: 'Guest',
                email: 'guest@example.com',
                planId: 'free',
                subscriptionTier: null,
                creditsUsed: 0,
                creditsRemaining: 2000,
                totalCredits: 2000
            });
        }
    }, [liveProfile, isProfileLoading]);


    const plansRef = useRef<HTMLDivElement>(null);
    const referralLink = user ? `https://geezvoice.app/join?ref=${user.uid}` : '';
    const creditUsagePercentage = (userProfile) ? (userProfile.creditsRemaining / userProfile.totalCredits) * 100 : 0;

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
            router.push('/');
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

    if (isProfileLoading || !userProfile) {
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
                                <p className="font-semibold">{userProfile.name || user?.displayName || 'N/A'}</p>
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
                            </CardTitle