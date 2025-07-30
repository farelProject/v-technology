'use client';

import Link from 'next/link';
import { Home, MessageSquare, Heart, Info, LogIn, User, LogOut } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

interface SidebarProps {
    onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const handleLogout = () => {
    logout();
    handleLinkClick();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>
       <ScrollArea className="flex-1">
        <nav className="space-y-1 px-2 py-4">
            <Link href="/" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
                <Home className="mr-3 h-5 w-5" />
                Home
            </Link>
            {user && (
                <Link href="/profile" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
                    <User className="mr-3 h-5 w-5" />
                    Profile
                </Link>
            )}
            <Link href="/feedback" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
                <MessageSquare className="mr-3 h-5 w-5" />
                Feedback
            </Link>
            <Link href="/about" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
                <Info className="mr-3 h-5 w-5" />
                About Web
            </Link>
            <Link href="/credits" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
                <Heart className="mr-3 h-5 w-5" />
                Donate
            </Link>
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
         {user ? (
            <div className='space-y-2'>
                <p className='text-sm text-center text-muted-foreground'>Signed in as {user.name}</p>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>
            </div>
         ) : (
            <Link href="/login" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
                <LogIn className="mr-3 h-5 w-5" />
                Login / Register
            </Link>
         )}
      </div>
    </div>
  );
}
