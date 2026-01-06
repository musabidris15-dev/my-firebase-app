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
import { MoreHorizontal, Download, Search, Send, ShieldAlert, Loader2 } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

type User = {
    id: string;
    name?: string;
    email: string;
    planId: string;
    creditsRemaining: number;
};

type AdminRecord = {
    role: string;
};

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  // --- Dynamic Admin Validation ---
  const adminDocRef = useMemoFirebase(() => 
    (firestore && user?.email) ? doc(firestore, 'admins', user.email) : null, 
    [firestore, user]
  );
  const { data: adminRecord, isLoading: isAdminCheckLoading } = useDoc<AdminRecord>(adminDocRef);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Firestore Data Fetching
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);

  const adminsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'admins') : null, [firestore]);
  const { data: allAdmins } = useCollection<AdminRecord>(adminsQuery);

  const serverStatusRef = useMemoFirebase(() => firestore ? doc(firestore, 'server', 'status') : null, [firestore]);
  const { data: serverStatus } = useDoc<{isFreeTierEnabled: boolean}>(serverStatusRef);

  // Security: Redirect non-admins immediately
  useEffect(() => {
    if (!isAuthLoading && !isAdminCheckLoading) {
        if (!user || !adminRecord) {
            router.push('/');
        }
    }
  }, [user, isAuthLoading, isAdminCheckLoading, adminRecord, router]);

  // Filter Logic
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
        !users ? [] : term === '' ? users : users.filter(u => 
            (u.name || '').toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        )
    );
  }, [searchTerm, users]);

  // --- Database Update Actions ---
  const handleSaveChanges = async () => {
    if (!editingUser || !firestore) return;
    setIsSaving(true);
    try {
      const userRef = doc(firestore, 'users', editingUser.id);
      await updateDoc(userRef, {
        name: editingUser.name || 'N/A',
        planId: editingUser.planId,
        creditsRemaining: Number(editingUser.creditsRemaining),
      });
      toast({ title: 'Update Successful', description: `Saved changes for ${editingUser.email}` });
      setEditingUser(null);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally { setIsSaving(false); }
  };

  const toggleFreeTier = async (val: boolean) => {
    if (!serverStatusRef) return;
    await setDoc(serverStatusRef, { isFreeTierEnabled: val }, { merge: true });
    toast({ title: 'System Updated', description: `Free tier generation is now ${val ? 'Enabled' : 'Disabled'}` });
  };

  if (isAuthLoading || isAdminCheckLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!adminRecord) return null;

  return (
    <div className="container mx-auto max-w-7xl py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Admin Console</h1>
        <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-primary/10">{adminRecord.role}</Badge>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
        </div>
      </header>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="broadcast">Global Broadcast</TabsTrigger>
          <TabsTrigger value="security">System Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registered Users</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search name or email..." className="pl-8 w-[300px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Information</TableHead>
                    <TableHead>Current Plan</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areUsersLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10">Syncing database...</TableCell></TableRow>
                  ) : filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-semibold">{u.name || 'Anonymous'}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{u.planId}</Badge></TableCell>
                      <TableCell>{(u.creditsRemaining || 0).toLocaleString()}</TableCell>
                      <TableCell>
                         {allAdmins?.some(a => a.id === u.email) ? (
                            <Badge className="bg-red-500 hover:bg-red-600">Admin</Badge>
                         ) : (
                            <Badge variant="outline">User</Badge>
                         )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(u)}>Adjust Credits/Plan</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Restrict Access</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast">
           <Card>
              <CardHeader><CardTitle>Push Notification</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <Input placeholder="Announcement Title" />
                 <Textarea placeholder="Message body..." rows={4} />
                 <Button className="w-full"><Send className="mr-2 h-4 w-4"/> Broadcast to All</Button>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="security">
           <Card className="border-red-200 bg-red-50/30">
              <CardHeader><CardTitle className="text-red-700 flex items-center gap-2"><ShieldAlert/> System Controls</CardTitle></CardHeader>
              <CardContent>
                 <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                    <div>
                       <div className="font-bold">Free Tier Generation</div>
                       <div className="text-sm text-muted-foreground">Kill switch for all free-tier audio generation.</div>
                    </div>
                    <Switch checked={serverStatus?.isFreeTierEnabled ?? false} onCheckedChange={toggleFreeTier} />
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Modifying settings for {editingUser?.email}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Credits</Label>
                <Input type="number" className="col-span-3" value={editingUser.creditsRemaining} onChange={(e) => setEditingUser({...editingUser, creditsRemaining: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Plan ID</Label>
                <Select value={editingUser.planId} onValueChange={(v) => setEditingUser({...editingUser, planId: v})}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="hobbyist">Hobbyist</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}