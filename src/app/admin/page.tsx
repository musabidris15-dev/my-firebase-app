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
import { MoreHorizontal, UserPlus, Send, MessageSquare, Search } from 'lucide-react';
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
import Link from 'next/link';

const mockUsers = [
  {
    id: 'usr_1',
    name: 'Abebe Bikila',
    email: 'abebe.bikila@example.com',
    plan: 'Creator',
    tier: 'Yearly',
    status: 'Active',
    joined: '2023-01-15',
    credits: 120000,
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
  },
];

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (lowercasedTerm === '') {
        setFilteredUsers(mockUsers);
    } else {
        const results = mockUsers.filter(user =>
            user.name.toLowerCase().includes(lowercasedTerm) ||
            user.email.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredUsers(results);
    }
  }, [searchTerm]);

  return (
    <div className="container mx-auto max-w-7xl">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          User management and application oversight.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
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
                            <Dialog>
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
                                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                                    </DialogTrigger>
                                    <DropdownMenuItem>Suspend User</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                    Delete User
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit User: {user.name}</DialogTitle>
                                        <DialogDescription>
                                            Modify user details and credit balance.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                                Name
                                            </Label>
                                            <Input id="name" defaultValue={user.name} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="email" className="text-right">
                                                Email
                                            </Label>
                                            <Input id="email" type="email" defaultValue={user.email} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="credits" className="text-right">
                                                Credits
                                            </Label>
                                            <Input id="credits" type="number" defaultValue={user.credits} className="col-span-3" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Save Changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
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
        </div>
      </div>
    </div>
  );
}
