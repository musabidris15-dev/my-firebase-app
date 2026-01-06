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
    subscriptionTier?: string | null;
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

  // Firestore Queries
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);

  const adminsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'admins') : null, [firestore]);
  const { data: allAdmins } = useCollection<any>(adminsQuery);

  const serverStatusRef = useMemoFirebase(() => firestore ? doc(firestore, 'server', 'status') : null, [firestore]);
  const { data: serverStatus } = useDoc<{isFreeTierEnabled: boolean}>(serverStatusRef);

  // Protection Redirect
  useEffect(() => {
    if (!isAuthLoading && !isAdminCheckLoading) {
        if (!user || !adminRecord) {
            router.push('/');
        }
    }
  }, [user, isAuthLoading, isAdminCheckLoading, adminRecord, router]);

  // Search Logic
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
        !users ? [] : term === '' ? users : users.filter(u => 
            (u.name || '').toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        )
    );
  }, [searchTerm, users]);

  // --- FIXED SAVE LOGIC ---
  const handleSaveChanges = async () => {
    if (!editingUser || !firestore) return;
    setIsSaving(true);
    try {
      // Find the document by the ID (this is the key to syncing correctly)
      const userRef = doc(firestore, 'users', editingUser.id);
      
      const updatedData = {
        name: editingUser.name || 'N/A',
        planId: editingUser.planId,
        creditsRemaining: Number(editingUser.creditsRemaining), // Must be a number for user dashboards
        subscriptionTier: editingUser.planId === 'free' ? 'free' : 'paid'
      };

      // Push to Firestore
      await updateDoc(userRef, updatedData);

      toast({ 
        title: 'User Updated', 
        description: `Successfully synced ${editingUser.email} across all platforms.` 
      });
      
      setEditingUser(null);
    } catch (e: any) {
      console.error("Logic Error:", e);
      toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
    } finally { setIsSaving(false); }
  };

  const toggleFreeTier = async (val: boolean) => {
    if (!serverStatusRef) return;
    await setDoc(serverStatusRef, { isFreeTierEnabled: val }, { merge: true });
  };

  if (isAuthLoading || isAdminCheckLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!adminRecord) return null;

  return (
    <div className="container mx-auto max-w-7xl py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-sm text-muted-foreground mt-2">Managing as: {user?.email}</p>
      </header>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="security">System Control</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Directory</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search name/email..." className="pl-8 w-[250px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areUsersLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin inline mr-2"/>Updating...</TableCell></TableRow>
                  ) : filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-semibold">{u.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{u.planId}</Badge></TableCell>
                      <TableCell>{(u.creditsRemaining || 0).toLocaleString()}</TableCell>
                      <TableCell>
                         {allAdmins?.some((a:any) => a.id === u.email) ? (
                            <Badge variant="destructive">Admin</Badge>
                         ) : (
                            <Badge variant="secondary">Member</Badge>
                         )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(u)}>Edit User Info</DropdownMenuItem>
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

        <TabsContent value="security">
           <Card className="border-red-200">
              <CardHeader><CardTitle className="text-red-600 flex items-center gap-2"><ShieldAlert/> Kill Switch</CardTitle></CardHeader>
              <CardContent>
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                       <div className="font-bold">Free Tier Audio</div>
                       <div className="text-sm text-muted-foreground">Toggle generation for all free users.</div>
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
            <DialogTitle>Update User Profile</DialogTitle>
            <DialogDescription>Changes take effect immediately for {editingUser?.email}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <Input className="col-span-3" value={editingUser.name || ''} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Credits</Label>
                <Input type="number" className="col-span-3" value={editingUser.creditsRemaining} onChange={(e) => setEditingUser({...editingUser, creditsRemaining: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Plan</Label>
                <Select value={editingUser.planId} onValueChange={(v) => setEditingUser({...editingUser, planId: v})}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">free</SelectItem>
                    <SelectItem value="hobbyist">hobbyist</SelectItem>
                    <SelectItem value="creator">creator</SelectItem>
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