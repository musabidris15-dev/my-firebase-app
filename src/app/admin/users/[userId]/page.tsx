'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  User,
  Shield,
  Copy,
  Check,
  DollarSign,
  BarChart,
  History,
  Loader2,
} from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
// UPDATED: Added 'use' to imports
import { useState, useMemo, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';

type UserProfile = {
  id: string;
  name?: string;
  email: string;
  planId: string;
  subscriptionTier: string | null;
  creationDate: { toDate: () => Date };
  lastKnownIp: string;
  creditsRemaining: number;
  totalCredits: number;
  lastLoginDate?: { toDate: () => Date }; 
  lifetimeValue?: number;
};

const VoiceTierChart = ({ data }: { data: { standard: number, premium: number }}) => {
  const chartData = [
    { name: 'Standard', value: data.standard, fill: 'hsl(var(--chart-1))' },
    { name: 'Premium', value: data.premium, fill: 'hsl(var(--chart-2))' },
  ];
  
  return (
    <div className="h-24 w-24 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2}>
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
          </Pie>
          <Tooltip contentStyle={{
            background: 'hsl(var(--card-background))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--card-foreground))',
            borderRadius: 'var(--radius)'
          }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// UPDATED: Changed props definition and added unwrapping logic
export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  // UPDATED: Unwrap params using React.use()
  const { userId } = use(params);
  
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', userId) : null, [firestore, userId]);
  const { data: user, isLoading } = useDoc<UserProfile>(userDocRef);

  const [isReferralsOpen, setIsReferralsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
    notFound();
  }
  
  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // MOCK DATA - Replace with real data when available
  const MOCK_USER_DETAILS = {
     role: 'User',
     status: 'Active',
     loginProvider: 'Email',
     nextBillingDate: '2024-08-05',
     lifetimeValue: 234,
     referredUsers: [],
     ttsUsage: {
        lifetimeCharacters: 25000,
        lastGenerated: '2023-07-29 01:00 PM',
        voiceTierUsage: {
            standard: 10,
            premium: 90,
        },
        totalFilesGenerated: 5,
        generationHistory: [
             { timestamp: '2023-07-29 01:00 PM', charCount: 5000, voice: 'Algenib (Premium)', status: 'Success' },
        ]
    }
  };


  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User List
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6 text-primary" />
                <span>{user.name || 'N/A'}</span>
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">User ID</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{user.id}</span>
                         <Button onClick={() => handleCopy(user.id)} variant="ghost" size="icon" className="h-6 w-6">
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Sign-up Date</span>
                    <span className="font-medium">{format(user.creationDate.toDate(), 'yyyy-MM-dd')}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Last Login</span>
                    <span className="font-medium">{user.lastLoginDate ? format(user.lastLoginDate.toDate(), 'yyyy-MM-dd') : 'N/A'}</span>
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security & Access
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Role</span>
                    <Badge variant={MOCK_USER_DETAILS.role === 'Admin' ? 'destructive' : 'secondary'}>{MOCK_USER_DETAILS.role}</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Status</span>
                     <Badge
                        variant={MOCK_USER_DETAILS.status === 'Active' ? 'default' : 'destructive'}
                        className={MOCK_USER_DETAILS.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : 'bg-red-500/20 text-red-700 border-red-500/20'}
                    >
                        {MOCK_USER_DETAILS.status}
                    </Badge>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Login Provider</span>
                    <Badge variant="outline">{MOCK_USER_DETAILS.loginProvider}</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Last Login IP</span>
                    <span className="font-mono text-xs">{user.lastKnownIp || 'N/A'}</span>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Financials & Subscription
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Current Plan</span>
                    <span className="font-semibold">{user.planId} {user.subscriptionTier && `(${user.subscriptionTier})`}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Next Billing Date</span>
                    <span className="font-medium">{MOCK_USER_DETAILS.nextBillingDate}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Lifetime Value</span>
                    <span className="font-semibold text-green-600">${user.lifetimeValue?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Referred Users</span>
                    <span className="font-semibold">{MOCK_USER_DETAILS.referredUsers.length}</span>
                </div>
            </CardContent>
          </Card>

        </div>

        <div className="md:col-span-2 space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-primary" />
                        TTS Usage Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Lifetime Chars</p>
                            <p className="text-xl font-bold">{(MOCK_USER_DETAILS.ttsUsage.lifetimeCharacters / 1000).toFixed(1)}k</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Files Generated</p>
                            <p className="text-xl font-bold">{MOCK_USER_DETAILS.ttsUsage.totalFilesGenerated}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Last Generation</p>
                            <p className="text-lg font-semibold">{MOCK_USER_DETAILS.ttsUsage.lastGenerated.split(' ')[0]}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg flex flex-col items-center justify-center">
                            <p className="text-xs text-muted-foreground mb-1">Voice Tiers</p>
                            <div className="flex items-center gap-2">
                                <VoiceTierChart data={MOCK_USER_DETAILS.ttsUsage.voiceTierUsage} />
                                <div className="text-xs text-left">
                                    <p><span className="font-semibold">{MOCK_USER_DETAILS.ttsUsage.voiceTierUsage.standard}%</span> Standard</p>
                                    <p><span className="font-semibold">{MOCK_USER_DETAILS.ttsUsage.voiceTierUsage.premium}%</span> Premium</p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground" />Recent Generations</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Voice</TableHead>
                                    <TableHead className="text-right">Characters</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_USER_DETAILS.ttsUsage.generationHistory.map((item, index) => (
                                    <TableRow key={index} className="text-xs">
                                        <TableCell>{item.timestamp}</TableCell>
                                        <TableCell>{item.voice}</TableCell>
                                        <TableCell className="text-right">{item.charCount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={item.status === 'Success' ? 'default' : 'destructive'} 
                                            className={item.status === 'Success' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
             </Card>

             <Collapsible open={isReferralsOpen} onOpenChange={setIsReferralsOpen}>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="flex flex-row items-center justify-between cursor-pointer">
                            <div>
                                <CardTitle>Referred Users</CardTitle>
                                <CardDescription>Users who joined using {user.name}'s referral code.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                                {isReferralsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                <span className="sr-only">Toggle</span>
                            </Button>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            {MOCK_USER_DETAILS.referredUsers.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Joined Date</TableHead>
                                            <TableHead>Plan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {MOCK_USER_DETAILS.referredUsers.map((refUser: any) => (
                                            <TableRow 
                                                key={refUser.id} 
                                                className="cursor-pointer"
                                                onClick={() => router.push(`/admin/users/${refUser.id}`)}
                                            >
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