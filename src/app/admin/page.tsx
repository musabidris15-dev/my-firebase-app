
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
import { MoreHorizontal, UserPlus, Send, MessageSquare, Search, Download, Calendar as CalendarIcon, BarChart3, ShieldAlert, Shield } from 'lucide-react';
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

type User = {
    id: string;
    name: string;
    email: string;
    plan: string;
    tier: string | null;
    status: string;
    joined: string;
    credits: number;
    role: string;
};

type FraudAttempt = {
    id: string;
    email: string;
    ipAddress: string;
    reason: 'vpn_detected' | 'duplicate_device' | 'duplicate_ip';
    timestamp: Date;
};

const initialUsers: User[] = [
  {
    id: 'usr_1',
    name: 'Abebe Bikila',
    email: 'abebe.bikila@example.com',
    plan: 'Creator',
    tier: 'Yearly',
    status: 'Active',
    joined: '2023-01-15',
    credits: 120000,
    role: 'Admin',
  },
  {
    id: 'usr_2',
    name: 'Tirunesh Dibaba',
    email: 'tirunesh.dibaba@example.com',
    plan: 'Hobbyist',
    tier: 'Monthly',
    status: 'Active',
    joined: '2023-02-20',
    credits: 15000,
    role: 'User',
  },
  {
    id: 'usr_3',
    name: 'Haile Gebrselassie',
    email: 'haile.g@example.com',
    plan: 'Free Tier',
    tier: null,
    status: 'Suspended',
    joined: '2023-03-10',
    credits: 0,
    role: 'User',
  },
  {
    id: 'usr_4',
    name: 'Kenenisa Bekele',
    email: 'kenenisa.bekele@example.com',
    plan: 'Creator',
    tier: 'Monthly',
    status: 'Active',
    joined: '2023-04-05',
    credits: 350000,
    role: 'User',
  },
   {
    id: 'usr_5',
    name: 'Meseret Defar',
    email: 'meseret.defar@example.com',
    plan: 'Free Tier',
    tier: null,
    status: 'Active',
    joined: '2023-05-21',
    credits: 1000,
    role: 'User',
  },
];

const MOCK_FRAUD_ATTEMPTS: FraudAttempt[] = [
    { id: 'fa_1', email: 'test1@example.com', ipAddress: '103.208.220.1', reason: 'vpn_detected', timestamp: subDays(new Date(), 1) },
    { id: 'fa_2', email: 'test2@another.com', ipAddress: '98.12.111.45', reason: 'duplicate_device', timestamp: subDays(new Date(), 2) },
    { id: 'fa_3', email: 'test3@example.net', ipAddress: '209.141.56.200', reason: 'vpn_detected', timestamp: subDays(new Date(), 3) },
    { id: 'fa_4', email: 'test4@example.com', ipAddress: '192.168.1.102', reason: 'duplicate_ip', timestamp: subDays(new Date(), 4) },
];


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
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [timeframe, setTimeframe] = useState('monthly');
  const [stats, setStats] = useState({ characters: 0, hours: 0 });
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    setUsers(initialUsers);
    setFilteredUsers(initialUsers);
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (lowercasedTerm === '') {
        setFilteredUsers(users);
    } else {
        const results = users.filter(user =>
            user.name.toLowerCase().includes(lowercasedTerm) ||
            user.email.toLowerCase().includes(lowercasedTerm)
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
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  }

  const handleDownloadUsers = () => {
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
                        modifiersClassNames={{
                           activity: getDayClass,
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
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                      <TableCell>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                          {user.email}
                          </div>
                      </TableCell>
                      <TableCell>
                          <Badge
                          variant={
                              user.status === 'Active' ? 'default' : 'destructive'
                          }
                          className={user.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : 'bg-red-500/20 text-red-700 border-red-500/20'}
                          >
                          {user.status}
                          </Badge>
                      </TableCell>
                      <TableCell>
                          {user.plan}
                          {user.tier && <span className="text-muted-foreground"> ({user.tier})</span>}
                      </TableCell>
                      <TableCell>{user.credits.toLocaleString()}</TableCell>
                      <TableCell>
                          <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                          <Dialog open={editingUser?.id === user.id} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                              <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                      <Link href={`/admin/users/${user.id}`}>View Details</Link>
                                  </DropdownMenuItem>
                                  <DialogTrigger asChild>
                                      <DropdownMenuItem onClick={() => setEditingUser(user)}>Edit User</DropdownMenuItem>
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
                                          <Input id="name" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="col-span-3" />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="email" className="text-right">Email</Label>
                                          <Input id="email" type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="col-span-3" />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="plan" className="text-right">Plan</Label>
                                          <Select value={editingUser.plan} onValueChange={(value) => setEditingUser({...editingUser, plan: value, tier: value === 'Free Tier' ? null : editingUser.tier || 'Monthly'})}>
                                              <SelectTrigger className="col-span-3">
                                                  <SelectValue placeholder="Select a plan" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="Free Tier">Free Tier</SelectItem>
                                                  <SelectItem value="Hobbyist">Hobbyist</SelectItem>
                                                  <SelectItem value="Creator">Creator</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                      {editingUser.plan !== 'Free Tier' && (
                                          <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="tier" className="text-right">Tier</Label>
                                              <Select value={editingUser.tier || 'Monthly'} onValueChange={(value) => setEditingUser({...editingUser, tier: value})}>
                                                  <SelectTrigger className="col-span-3">
                                                      <SelectValue placeholder="Select a tier" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="Monthly">Monthly</SelectItem>
                                                      <SelectItem value="Yearly">Yearly</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                      )}
                                      <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="credits" className="text-right">Credits</Label>
                                          <Input id="credits" type="number" value={editingUser.credits} onChange={(e) => setEditingUser({...editingUser, credits: Number(e.target.value)})} className="col-span-3" />
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

        <TabsContent value="security">
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
                          {MOCK_FRAUD_ATTEMPTS.map(attempt => (
                              <TableRow key={attempt.id}>
                                  <TableCell>
                                      <div>{format(attempt.timestamp, 'yyyy-MM-dd HH:mm')}</div>
                                      <div className="text-xs text-muted-foreground">{formatDistanceToNow(attempt.timestamp, { addSuffix: true })}</div>
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
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    