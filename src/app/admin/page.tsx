'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, UserPlus, Send, MessageSquare, Search, Download, Calendar as CalendarIcon, BarChart3, ShieldAlert, Shield, Loader2, Server } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';
import { format, subDays, formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

type User = {
    id: string;
    name?: string;
    email: string;
    planId: string;
    subscriptionTier: string | null;
    status: string;
    creationDate: Date | string;
    creditsRemaining: number;
    totalCredits: number;
    role?: string;
};

type FraudAttempt = {
    id: string;
    email: string;
    ipAddress: string;
    reason: 'vpn_detected' | 'duplicate_device' | 'duplicate_ip';
    timestamp: { toDate: () => Date };
};

type ServerStatus = {
    isFreeTierEnabled: boolean;
};

// --- Mock Data for Stats ---
const MOCK_GENERATION_DATA = Array.from({ length: 90 }, (_, i) => ({
  date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
  characters: Math.floor(Math.random() * (50000 * (1 - i/120)) + 1000),
}));

const calculateStats = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all') => {
  const now = new Date();
  let filteredData = MOCK_GENERATION_DATA;

  if (period !== 'all') {
    const daysToSubtract = { daily: 1, weekly: 7, monthly: 30, yearly: 365 }[period];
    const startDate = subDays(now, daysToSubtract);
    filteredData = MOCK_GENERATION_DATA.filter(d => new Date(d.date) >= startDate);
  }

  const totalChars = filteredData.reduce((sum, item) => sum + item.characters, 0);
  const totalHours = totalChars / 150000; // Approx. 150k chars per hour

  return {
    characters: totalChars,
    hours: totalHours,
  };
};
// --- End Mock Data ---


export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  // Ensure your email is in this list
  const adminEmails = ['musabidris15@gmail.com', 'geezvoices@gmail.com'];

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [timeframe, setTimeframe] = useState('monthly');
  const [stats, setStats] = useState({ characters: 0, hours: 0 });
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Firestore Data Hooks
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);

  const fraudQuery = useMemoFirebase(() => firestore ? collection(firestore, 'fraudAttempts') : null, [firestore]);
  const { data: fraudAttempts, isLoading: areFraudAttemptsLoading } = useCollection<FraudAttempt>(fraudQuery);
  
  const serverStatusDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'server', 'status') : null, [firestore]);
  const { data: serverStatus, isLoading: isServerStatusLoading } = useDoc<ServerStatus>(serverStatusDocRef);

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    // Basic client-side protection
    if (!isAuthLoading && (!user || !adminEmails.includes(user.email ?? ''))) {
        router.push('/');
    }
  }, [user, isAuthLoading, router, adminEmails]);
  
  useEffect(() => {
    const allUsers = users || [];
    const lowercasedTerm = searchTerm.toLowerCase();
    if (lowercasedTerm === '') {
        setFilteredUsers(allUsers);
    } else {
        const results = allUsers.filter(u =>
            (u.name || '').toLowerCase().includes(lowercasedTerm) ||
            (u.email || '').toLowerCase().includes(lowercasedTerm)
        );
        setFilteredUsers(results);
    }
  }, [searchTerm, users]);


  useEffect(() => {
    // @ts-ignore
    setStats(calculateStats(timeframe));
  }, [timeframe]);


  const handleSaveChanges = () => {
    if (!editingUser) return;
    // Here you would add the logic to save changes to Firestore
    console.log("Saving user:", editingUser);
    setEditingUser(null);
  }

  const handleDownloadUsers = () => {
    if (!users) return;
    const jsonString = JSON.stringify(users, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleFreeTierToggle = async (isEnabled: boolean) => {
    if (!serverStatusDocRef) return;
    try {
        await setDoc(serverStatusDocRef, { isFreeTierEnabled: isEnabled }, { merge: true });
        toast({
            title: 'Success',
            description: `Free tier audio generation has been ${isEnabled ? 'enabled' : 'disabled'}.`,
        });
    } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'Could not update server status.',
        });
    }
  };

  const getDayClass = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayData = MOCK_GENERATION_DATA.find(d => d.date === dateString);
    if (!dayData || dayData.characters === 0) return '';
    
    const chars = dayData.characters;
    if (chars > 40000) return 'bg-primary/80 text-primary-foreground';
    if (chars > 20000) return 'bg-primary/60';
    if (chars > 10000) return 'bg-primary/40';
    if (chars > 5000) return 'bg-primary/20';
    return 'bg-primary/10';
  };
  
  if (isAuthLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          User management, application oversight, and security monitoring.
        </p>
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="flex items-center gap-2"><BarChart3/> Usage Statistics</CardTitle>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Select a timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Last 24 Hours</SelectItem>
                      <SelectItem value="weekly">Last 7 Days</SelectItem>
                      <SelectItem value="monthly">Last 30 Days</SelectItem>
                      <SelectItem value="yearly">Last 365 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Characters Generated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{(stats.characters / 1000000).toFixed(2)}M</p>
                    <p className="text-sm text-muted-foreground">{stats.characters.toLocaleString()} characters</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hours Generated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{stats.hours.toFixed(1)}</p>
                     <p className="text-sm text-muted-foreground">Approximate hours of audio</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarIcon /> Daily Generation Activity</CardTitle>
                    <CardDescription>Calendar heatmap of characters generated per day.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        numberOfMonths={1}
                        modifiers={{
                           activity: MOCK_GENERATION_DATA.map(d => new Date(d.date + 'T12:00:00'))
                        }}
                        
                        className="p-0"
                        classNames={{
                          day_selected: "rounded-md",
                          day_today: "bg-accent text-accent-foreground rounded-md",
                        }}
                    />
                </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
              <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <CardTitle>Users</CardTitle>
                      <div className="flex gap-2 w-full sm:w-auto">
                          <div className="relative w-full sm:w-auto">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                  type="search"
                                  placeholder="Search by name or email..."
                                  className="pl-8 sm:w-[250px] lg:w-[300px]"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                              />
                          </div>
                           <Button size="sm" variant="outline" onClick={handleDownloadUsers} className="whitespace-nowrap">
                              <Download className="mr-2 h-4 w-4" />
                              Download
                          </Button>
                          <Button size="sm" className="whitespace-nowrap">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add User
                          </Button>
                      </div>
                  </div>
              </CardHeader>
              <CardContent>
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>
                      <span className="sr-only">Actions</span>
                      </TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {areUsersLoading ? (
                      <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                              <Loader2 className="h-6 w-6 animate-spin inline-block" />
                          </TableCell>
                      </TableRow>
                  ) : filteredUsers.length > 0 ? filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                      <TableCell>
                          <div className="font-medium">{u.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                          {u.email}
                          </div>
                      </TableCell>
                      <TableCell>
                           <Badge
                              variant={'default'}
                              className={'bg-green-500/20 text-green-700 border-green-500/20'}
                            >
                              Active
                            </Badge>
                      </TableCell>
                      <TableCell>
                          {u.planId || 'free'}
                          {u.subscriptionTier && <span className="text-muted-foreground"> ({u.subscriptionTier})</span>}
                      </TableCell>
                      <TableCell>{(u.creditsRemaining || 0).toLocaleString()}</TableCell>
                      <TableCell>
                          <Badge variant={adminEmails.includes(u.email) ? 'destructive' : 'secondary'}>
                            {adminEmails.includes(u.email) ? 'Admin' : 'User'}
                          </Badge>
                      </TableCell>
                      <TableCell>
                          <Dialog open={editingUser?.id === u.id} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                              <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                      <Link href={`/admin/users/${u.id}`}>View Details</Link>
                                  </DropdownMenuItem>
                                  <DialogTrigger asChild>
                                      <DropdownMenuItem onClick={() => setEditingUser(u)}>Edit User</DropdownMenuItem>
                                  </DialogTrigger>
                                  <DropdownMenuItem>Suspend User</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                  Delete User
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                              </DropdownMenu>
                              {editingUser && (
                              <DialogContent>
                                  <DialogHeader>
                                      <DialogTitle>Edit User: {editingUser.name}</DialogTitle>
                                      <DialogDescription>
                                          Modify user details, plan, and credit balance.
                                      </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="name" className="text-right">Name</Label>
                                          <Input id="name" value={editingUser.name || ''} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="col-span-3" />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="email" className="text-right">Email</Label>
                                          <Input id="email" type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="col-span-3" />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="plan" className="text-right">Plan</Label>
                                          <Select value={editingUser.planId} onValueChange={(value) => setEditingUser({...editingUser, planId: value, subscriptionTier: value === 'free' ? null : editingUser.subscriptionTier || 'monthly'})}>
                                              <SelectTrigger className="col-span-3">
                                                  <SelectValue placeholder="Select a plan" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="free">Free</SelectItem>
                                                  <SelectItem value="hobbyist">Hobbyist</SelectItem>
                                                  <SelectItem value="creator">Creator</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                      {editingUser.planId !== 'free' && (
                                          <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="tier" className="text-right">Tier</Label>
                                              <Select value={editingUser.subscriptionTier || 'monthly'} onValueChange={(value) => setEditingUser({...editingUser, subscriptionTier: value})}>
                                                  <SelectTrigger className="col-span-3">
                                                      <SelectValue placeholder="Select a tier" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="monthly">Monthly</SelectItem>
                                                      <SelectItem value="yearly">Yearly</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                      )}
                                      <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="credits" className="text-right">Credits</Label>
                                          <Input id="credits" type="number" value={editingUser.creditsRemaining || 0} onChange={(e) => setEditingUser({...editingUser, creditsRemaining: Number(e.target.value)})} className="col-span-3" />
                                      </div>
                                  </div>
                                  <DialogFooter>
                                      <Button onClick={handleSaveChanges}>Save Changes</Button>
                                  </DialogFooter>
                              </DialogContent>
                              )}
                          </Dialog>
                      </TableCell>
                      </TableRow>
                  )) : (
                      <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                              No users found.
                          </TableCell>
                      </TableRow>
                  )}
                  </TableBody>
              </Table>
              </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Send Notification
                  </CardTitle>
                  <CardDescription>Send a message to a specific group of users.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="notification-title">Title</Label>
                      <Input id="notification-title" placeholder="e.g., New Feature Announcement" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="notification-message">Message</Label>
                      <Textarea id="notification-message" placeholder="Describe the announcement or update..." rows={4} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="notification-recipient">Recipient Group</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="notification-recipient">
                              <SelectValue placeholder="Select a recipient group" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="free">Free Tier Users</SelectItem>
                              <SelectItem value="hobbyist">Hobbyist Users</SelectItem>
                              <SelectItem value="creator">Creator Users</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </CardContent>
              <CardFooter>
                  <Button className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send Notification
                  </Button>
              </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-primary" />
                        Server Status Controls
                    </CardTitle>
                    <CardDescription>Globally enable or disable features.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isServerStatusLoading ? (
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading server status...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="free-tier-switch" className="text-base">
                                    Free Tier Generation
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable or disable audio generation for all free-tier users.
                                </p>
                            </div>
                            <Switch
                                id="free-tier-switch"
                                checked={serverStatus?.isFreeTierEnabled ?? false}
                                onCheckedChange={handleFreeTierToggle}
                                aria-label="Toggle Free Tier Generation"
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                      <p className="text-xs text-muted-foreground">
                         This is a global switch. When disabled, free users will not be able to generate any audio until it is re-enabled. Paid users are not affected.
                      </p>
                </CardFooter>
            </Card>
           <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-destructive" />
                      Fraud & Abuse Prevention
                  </CardTitle>
                  <CardDescription>Review and manage suspicious user activities.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Timestamp</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>IP Address</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Actions</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                        {areFraudAttemptsLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin inline-block" />
                                </TableCell>
                            </TableRow>
                        ) : fraudAttempts && fraudAttempts.length > 0 ? (
                            fraudAttempts.map(attempt => (
                                <TableRow key={attempt.id}>
                                    <TableCell>
                                        <div>{attempt.timestamp ? format(attempt.timestamp.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A'}</div>
                                        <div className="text-xs text-muted-foreground">{attempt.timestamp ? formatDistanceToNow(attempt.timestamp.toDate(), { addSuffix: true }) : ''}</div>
                                    </TableCell>
                                    <TableCell>{attempt.email}</TableCell>
                                    <TableCell className="font-mono">{attempt.ipAddress}</TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">
                                            {attempt.reason === 'vpn_detected' ? 'VPN Detected' : attempt.reason === 'duplicate_ip' ? 'Duplicate IP' : 'Duplicate Device'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                         <Button variant="outline" size="sm">
                                              Block IP
                                         </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No fraud attempts recorded.
                                </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}