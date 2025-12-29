
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Header } from '@/components/app/header';
import { Home, Mic, User, UserCircle, Bell, ShoppingCart, Shield, Wallet } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FirebaseClientProvider } from '@/firebase';

const mockNotifications = [
    { id: 1, title: 'Welcome to Geez Voice!', message: 'Thanks for signing up. Explore our features and start creating.', read: false, date: '2 hours ago' },
    { id: 2, title: 'New Voices Added', message: 'We have added 5 new Amharic voices to our library. Check them out!', read: false, date: '1 day ago' },
    { id: 3, title: 'Maintenance Scheduled', message: 'We will be undergoing scheduled maintenance on Sunday at 2 AM.', read: true, date: '3 days ago' },
];

const unreadCount = mockNotifications.filter(n => !n.read).length;

const userProfile = {
    name: 'Hobbyist User',
    email: 'hobbyist.user@example.com',
    planId: 'hobbyist',
    creditsRemaining: 15000,
    totalCredits: 100000,
};

const creditUsagePercentage = (userProfile.creditsRemaining / userProfile.totalCredits) * 100;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Geez Voice</title>
        <meta name="description" content="AI-powered Text to Speech synthesis." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <Sidebar collapsible="icon">
                <SidebarContent>
                  <div className="flex h-14 items-center px-4">
                     <Link href="/" className="flex items-center space-x-2">
                      <Image src="/logo.png" alt="Geez Voice Logo" width={24} height={24} className="h-6 w-6" />
                      <span className="font-bold">
                        Geez Voice
                      </span>
                    </Link>
                  </div>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Home">
                        <Link href="/">
                          <Home />
                          <span>Home</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                       <SidebarMenuButton asChild tooltip="Text-to-Speech">
                        <Link href="/tts">
                          <Mic />
                          <span>Text-to-Speech</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {/*
                    <SidebarMenuItem>
                       <SidebarMenuButton asChild tooltip="Voice Changer">
                        <Link href="/voice-changer">
                          <AudioLines />
                          <span>Voice Changer</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                       <SidebarMenuButton asChild tooltip="Image Generation">
                        <Link href="/image-generation">
                          <ImageIcon />
                          <span>Image Generation</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    */}
                  </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start space-x-2 px-3 py-2 h-auto text-left">
                         <Avatar className="h-8 w-8">
                          <AvatarImage
                            src="https://picsum.photos/seed/avatar/100/100"
                            alt="@user"
                          />
                          <AvatarFallback>
                            <User />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 items-start">
                          <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {userProfile.email}
                          </p>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 mb-2 ml-2" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {userProfile.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                       <div className='px-2 py-2 text-sm'>
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">Credits</span>
                              <span className="text-muted-foreground">{userProfile.creditsRemaining.toLocaleString()} / {userProfile.totalCredits.toLocaleString()}</span>
                          </div>
                          <Progress value={creditUsagePercentage} className="h-2" />
                          <Link href="/profile" className='text-xs text-primary hover:underline text-center block mt-2'>
                             Manage Subscription
                          </Link>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className='cursor-pointer'>
                          <UserCircle className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                          <Link href="/admin" className='cursor-pointer'>
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Admin</span>
                          </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Billing</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarFooter>
              </Sidebar>
              <SidebarInset>
                <Header>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="relative">
                              <Bell className="h-5 w-5" />
                              {unreadCount > 0 && (
                                  <span className="absolute top-0 right-0 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                  </span>
                              )}
                              <span className="sr-only">Notifications</span>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                          <DropdownMenuLabel>
                              <div className="flex justify-between items-center">
                                  <span>Notifications</span>
                                  {unreadCount > 0 && <Badge variant="destructive">{unreadCount} New</Badge>}
                              </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <div className="max-h-80 overflow-y-auto">
                              {mockNotifications.map(notification => (
                                  <DropdownMenuItem key={notification.id} className="flex-col items-start gap-1 p-2 cursor-pointer">
                                      <div className="flex justify-between w-full">
                                          <p className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                                          {!notification.read && <span className="h-2 w-2 rounded-full bg-primary ml-2"></span>}
                                      </div>
                                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                                      <p className="text-xs text-muted-foreground/70 mt-1">{notification.date}</p>
                                  </DropdownMenuItem>
                              ))}
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="justify-center">
                              Mark all as read
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                </Header>
                <main className="flex-grow p-4 md:p-6 lg:p-8">{children}</main>
                <footer className="py-6 text-center text-sm text-muted-foreground">
                  <p>&copy; {new Date().getFullYear()} Geez Voice. All Rights Reserved.</p>
                </footer>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
