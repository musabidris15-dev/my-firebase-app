'use client';

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
import { MoreHorizontal, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockUsers = [
  {
    id: 'usr_1',
    name: 'Abebe Bikila',
    email: 'abebe.bikila@example.com',
    plan: 'Premium',
    status: 'Active',
    joined: '2023-01-15',
  },
  {
    id: 'usr_2',
    name: 'Tirunesh Dibaba',
    email: 'tirunesh.dibaba@example.com',
    plan: 'Free Tier',
    status: 'Active',
    joined: '2023-02-20',
  },
  {
    id: 'usr_3',
    name: 'Haile Gebrselassie',
    email: 'haile.g@example.com',
    plan: 'Free Tier',
    status: 'Suspended',
    joined: '2023-03-10',
  },
  {
    id: 'usr_4',
    name: 'Kenenisa Bekele',
    email: 'kenenisa.bekele@example.com',
    plan: 'Premium',
    status: 'Active',
    joined: '2023-04-05',
  },
   {
    id: 'usr_5',
    name: 'Meseret Defar',
    email: 'meseret.defar@example.com',
    plan: 'Free Tier',
    status: 'Active',
    joined: '2023-05-21',
  },
];

export default function AdminPage() {
  return (
    <div className="container mx-auto max-w-7xl">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          User management and application oversight.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
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
                  <TableCell>{user.plan}</TableCell>
                  <TableCell>{user.joined}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Suspend User</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
