'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

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
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <header className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Account</h1>
                <p className="text-lg text-muted-foreground mt-2">Manage your account settings and subscription plan.</p>
            </header>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
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

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription & Credits</CardTitle>
                            <CardDescription>Your current plan and usage details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <p className="text-lg font-semibold">Current Plan</p>
                                <p className="text-lg font-bold text-primary">{userProfile.plan}</p>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="font-semibold">Character Credits</h4>
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
                </div>
            </div>
        </div>
    );
}
