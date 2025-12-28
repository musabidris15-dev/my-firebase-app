'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';

export function Header({children}: {children?: ReactNode}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6 lg:px-8">
      <div className="flex h-14 items-center">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}