'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Shield, Zap, Gift, Users, CreditCard, ChevronDown, ChevronUp, PlusCircle, MinusCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { notFound } from 'next/navigation';

const MOCK_USER_DETAILS = {
  usr_1: {
    id: 'usr_1',
    name: 'Abebe Bikila',
    email: 'abebe.bikila@example.com',
    plan: 'Creator',
    tier: 'Yearly',
    status: 'Active',
    joined: '2023-01-15',
    credits: 120000,
    totalCredits: 350000,
    creditHistory: [
      { date: '2023-07-01', description: 'Monthly Renewal', amount: 350000, type: 'gained' },
      { date: '2023-07-05', description: 'Generated Audio (ID: aud_123)', amount: -2500, type: 'spent' },
      { date: '2023-07-10', description: 'Referral Bonus: T. Dibaba', amount: 50000, type: 'gained' },
      { date: '2023-07-12', description: 'Generated Audio (ID: aud_456)', amount: -8000, type: 'spent' },
      { date: '2023-07-20', description: 'Admin Credit Adjustment', amount: 10000, type: 'gained' },
    ],
    referredUsers: [
      { id: 'usr_2', name: 'Tirunesh Dibaba', joined: '2023-02-20', plan: 'Hobbyist (Monthly)' },
      { id: 'usr_4', name: 'Kenenisa Bekele', joined: '2023-04-05', plan: 'Creator (Monthly)' },
    ],
  },
  usr_2: {
    id: 'usr_2',
    name: 'Tirunesh Dibaba',
    email: 'tirunesh.dibaba@example.com',
    plan: 'Hobbyist',
    tier: 'Monthly',
    status: 'Active',
    joined: '2023-02-20',
    credits: 15000,
    totalCredits: 100000,
    creditHistory: [
      { date: '2023-07-01', description: 'Monthly Renewal', amount: 100000, type: 'gained' },
      { date: '2023-07-08', description: 'Generated Audio (ID: aud_789)', amount: -1200, type: 'spent' },
    ],
    referredUsers: [],
  },
    // Add more users if needed
};

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const [isReferralsOpen, setIsReferralsOpen] = useState(true);
  const user = MOCK_USER_DETAILS[params.userId as keyof typeof MOCK_USER_DETAILS];

  if (!user) {
    notFound();
  }
  
  const creditUsagePercentage = (user.credits / user.totalCredits) * 100;

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User List
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column - User Info */}
        <div className="md:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6 text-primary" />
                <span>{user.name}</span>
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                    variant={user.status === 'Active' ? 'default' : 'destructive'}
                    className={user.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : 'bg-red-500/20 text-red-700 border-red-500/20'}
                >
                    {user.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span>{user.joined}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Plan</span>
                <span className="font-semibold">{user.plan} {user.tier && `(${user.tier})`}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Credit Usage
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Remaining Credits</p>
                    <p className="text-4xl font-bold">{user.credits.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">of {user.totalCredits.toLocaleString()}</p>
                </div>
                <Progress value={creditUsagePercentage} className="mt-4 h-3" />
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Credit History</CardTitle>
                    <CardDescription>A log of all credit gains and expenditures.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {user.creditHistory.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className={`text-right font-medium ${item.type === 'gained' ? 'text-green-600' : 'text-red-600'}`}>
                                        <div className="flex items-center justify-end gap-1">
                                            {item.type === 'gained' ? <PlusCircle className="h-4 w-4" /> : <MinusCircle className="h-4 w-4" />}
                                            {Math.abs(item.amount).toLocaleString()}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Collapsible open={isReferralsOpen} onOpenChange={setIsReferralsOpen}>
                <Card>
                    <CardHeader>
                        <CollapsibleTrigger asChild>
                            <div className="flex justify-between items-center cursor-pointer">
                                <div className='flex-1'>
                                    <CardTitle>Referred Users</CardTitle>
                                    <CardDescription>Users who joined using {user.name}'s referral code.</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm">
                                    {isReferralsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </div>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent>
                            {user.referredUsers.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Joined Date</TableHead>
                                            <TableHead>Plan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.referredUsers.map((refUser) => (
                                            <TableRow key={refUser.id}>
                                                <TableCell className="font-medium">{refUser.name}</TableCell>
                                                <TableCell>{refUser.joined}</TableCell>
                                                <TableCell>{refUser.plan}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center text-muted-foreground py-4">No users have been referred yet.</p>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        </div>
      </div>
    </div>
  );
}
