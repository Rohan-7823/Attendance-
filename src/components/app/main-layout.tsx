
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { Logo } from './logo';
import { 
  LayoutDashboard, 
  BookCheck, 
  FileText, 
  BookUser, 
  User as UserIcon, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ThemeToggle } from '../theme-toggle';

const facultyNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/attendance", icon: BookCheck, label: "Mark Attendance" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/courses", icon: BookUser, label: "Courses" },
  { href: "/profile", icon: UserIcon, label: "Profile" },
];

const studentNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/courses", icon: BookUser, label: "Courses" },
  { href: "/profile", icon: UserIcon, label: "Profile" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen bg-background">
        <Skeleton className="hidden md:block w-64 h-full" />
        <div className="flex-1 p-8">
            <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  const navItems = user.role === 'faculty' ? facultyNavItems : studentNavItems;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row min-h-screen w-full bg-background text-foreground">
        
        {/* Mobile Navbar with horizontal scrolling items */}
        <div className="sticky top-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-b w-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <Logo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/profile" className="focus:outline-none">
                <Avatar className="h-8 w-8 ring-2 ring-indigo-500/20 hover:ring-indigo-500/50 transition-all">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-indigo-700 text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Scrollable category pills on mobile */}
          <div className="flex overflow-x-auto whitespace-nowrap px-4 py-2 gap-2 scrollbar-none [&::-webkit-scrollbar]:hidden bg-muted/20">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/profile" && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 border",
                    isActive 
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                      : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Sidebar (Only visible on wide screens) */}
        <Sidebar className="hidden md:flex flex-col border-r bg-card">
            <SidebarNav user={user} />
        </Sidebar>

        {/* Core Main Area */}
        <SidebarInset className="bg-background flex flex-col flex-1 overflow-x-hidden min-h-screen">
          <main className="flex-1 w-full">
            {children}
          </main>
          <footer className="p-6 text-center text-xs text-muted-foreground font-medium uppercase tracking-widest border-t bg-background">
            © 2026 AttendEase Attendance tracking. All rights reserved.
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
