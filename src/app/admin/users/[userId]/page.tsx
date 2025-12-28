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
  Mail,
  Shield,
  Zap,
  Gift,
  Users,
  CreditCard,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  MinusCircle,
  Copy,
  Check,
  LogIn,
  Calendar,
  Power,
  DollarSign,
  BarChart,
  History,
  Voicemail,
  CheckCircle,
  XCircle,
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
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_USER_DETAILS = {
  usr_1: {
    id: 'usr_1a2b3c4d5e6f',
    name: 'Abebe Bikila',
    email: 'abebe.bikila@example.com',
    plan: 'Creator',
    tier: 'Yearly',
    status: 'Active',
    role: 'Admin',
    signupDate: '2023-01-15',
    lastLoginDate: '2023-07-28',
    loginProvider: 'Google',
    lastKnownIp: '192.168.1.101',
    credits: 120000,
    totalCredits: 350000,
    nextBillingDate: '2024-01-15',
    lifetimeValue: 468,
    churnStatus: 'None',
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
    ttsUsage: {
        lifetimeCharacters: 1250000,
        lastGenerated: '2023-07-28 10:30 AM',
        voiceTierUsage: {
            standard: 60,
            premium: 40,
        },
        totalFilesGenerated: 152,
        generationHistory: [
            { timestamp: '2023-07-28 10:30 AM', charCount: 1200, voice: 'Algenib (Premium)', status: 'Success' },
            { timestamp: '2023-07-27 08:15 PM', charCount: 850, voice: 'Achird (Standard)', status: 'Success' },
            { timestamp: '2023-07-27 08:14 PM', charCount: 150, voice: 'Achird (Standard)', status: 'Fail' },
            { timestamp: '2023-07-26 11:00 AM', charCount: 3500, voice: 'Vindemiatrix (Premium)', status: 'Success' },
            { timestamp: '2023-07-25 02:45 PM', charCount: 500, voice: 'Zephyr (Standard)', status: 'Success' },
        ]
    }
  },
  usr_2: {
    id: 'usr_6g7h8i9j0k1l',
    name: 'Tirunesh Dibaba',
    email: 'tirunesh.dibaba@example.com',
    plan: 'Hobbyist',
    tier: 'Monthly',
    status: 'Active',
    role: 'User',
    signupDate: '2023-02-20',
    lastLoginDate: '2023-07-25',
    loginProvider: 'Email',
    lastKnownIp: '192.168.1.102',
    credits: 15000,
    totalCredits: 100000,
    nextBillingDate: '2023-08-20',
    lifetimeValue: 90,
    churnStatus: 'None',
    creditHistory: [
      { date: '2023-07-20', description: 'Monthly Renewal', amount: 100000, type: 'gained' },
      { date: '2023-07-22', description: 'Generated Audio (ID: aud_789)', amount: -1200, type: 'spent' },
    ],
    referredUsers: [],
    ttsUsage: {
        lifetimeCharacters: 450000,
        lastGenerated: '2023-07-22 03:00 PM',
        voiceTierUsage: {
            standard: 95,
            premium: 5,
        },
        totalFilesGenerated: 48,
        generationHistory: [
            { timestamp: '2023-07-22 03:00 PM', charCount: 1200, voice: 'Achird (Standard)', status: 'Success' },
            { timestamp: '2023-07-18 09:10 AM', charCount: 2000, voice: 'Zephyr (Standard)', status: 'Success' },
            { timestamp: '2023-07-15 01:20 PM', charCount: 500, voice: 'Algenib (Premium)', status: 'Success' },
        ]
    }
  },
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
                        background: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                    }}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}


export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const { userId } = useParams();
  const [isReferralsOpen, setIsReferralsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const user = useMemo(() => MOCK_USER_DETAILS[userId as keyof typeof MOCK_USER_DETAILS], [userId]);

  if (!user) {
    notFound();
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(user.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const creditUsagePercentage = (user.credits / user.totalCredits) * 100;

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
                <span>{user.name}</span>
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">User ID</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{user.id}</span>
                         <Button onClick={handleCopy} variant="ghost" size="icon" className="h-6 w-6">
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Sign-up Date</span>
                    <span className="font-medium">{user.signupDate}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Last Login</span>
                    <span className="font-medium">{user.lastLoginDate}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Login Provider</span>
                    <Badge variant="outline">{user.loginProvider}</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Role</span>
                    <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Status</span>
                    <Badge
                        variant={user.status === 'Active' ? 'default' : 'destructive'}
                        className={user.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : 'bg-red-500/20 text-red-700 border-red-500/20'}
                    >
                        {user.status}
                    </Badge>
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
                    <span className="font-semibold">{user.plan} {user.tier && `(${user.tier})`}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Next Billing Date</span>
                    <span className="font-medium">{user.nextBillingDate}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Lifetime Value</span>
                    <span className="font-semibold text-green-600">${user.lifetimeValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Referred Users</span>
                    <span className="font-semibold">{user.referredUsers.length}</span>
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
                            <p className="text-xl font-bold">{(user.ttsUsage.lifetimeCharacters / 1000).toFixed(1)}k</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Files Generated</p>
                            <p className="text-xl font-bold">{user.ttsUsage.totalFilesGenerated}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Last Generation</p>
                            <p className="text-lg font-semibold">{user.ttsUsage.lastGenerated.split(' ')[0]}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg flex flex-col items-center justify-center">
                            <p className="text-xs text-muted-foreground mb-1">Voice Tiers</p>
                            <div className="flex items-center gap-2">
                                <VoiceTierChart data={user.ttsUsage.voiceTierUsage} />
                                <div className="text-xs text-left">
                                    <p><span className="font-semibold">{user.ttsUsage.voiceTierUsage.standard}%</span> Standard</p>
                                    <p><span className="font-semibold">{user.ttsUsage.voiceTierUsage.premium}%</span> Premium</p>
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
                                {user.ttsUsage.generationHistory.map((item, index) => (
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
                                            <Link key={refUser.id} href={`/admin/users/${refUser.id}`} passHref>
                                                <TableRow className="cursor-pointer">
                                                    <TableCell className="font-medium">{refUser.name}</TableCell>
                                                    <TableCell>{refUser.joined}</TableCell>
                                                    <TableCell>{refUser.plan}</TableCell>
                                                </TableRow>
                                            </Link>
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
