
'use client';

import Link from 'next/link';
import { Home, MessageSquare, Heart, Info, LogIn, User, LogOut, PlusSquare, History } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

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
        <nav className="flex flex-col space-y-1 px-2 py-4">
            {user && (
                <>
                    <Link href="/chat" passHref>
                        <Button variant="ghost" className="w-full justify-start" onClick={handleLinkClick}>
                            <PlusSquare className="mr-3 h-5 w-5" />
                            New Chat
                        </Button>
                    </Link>
                    <Link href="/history" passHref>
                        <Button variant="ghost" className="w-full justify-start" onClick={handleLinkClick}>
                           <History className="mr-3 h-5 w-5" />
                           Chat History
                        </Button>
                    </Link>
                </>
            )}

            <Separator className="my-2" />
            
            <Link href="/" passHref>
                 <Button variant="ghost" className="w-full justify-start" onClick={handleLinkClick}>
                    <Home className="mr-3 h-5 w-5" />
                    Home
                 </Button>
            </Link>

            <Link href="/profile" passHref>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLinkClick}>
                    <User className="mr-3 h-5 w-5" />
                    Profile
                </Button>
            </Link>
           
            <Link href="/feedback" passHref>
                 <Button variant="ghost" className="w-full justify-start" onClick={handleLinkClick}>
                    <MessageSquare className="mr-3 h-5 w-5" />
                    Feedback
                 </Button>
            </Link>
            <Link href="/about" passHref>
                 <Button variant="ghost" className="w-full justify-start" onClick={handleLinkClick}>
                    <Info className="mr-3 h-5 w-5" />
                    About Web
                 </Button>
            </Link>
            <Link href="/credits" passHref>
                 <Button variant="ghost" className="w-full justify-start" onClick={handleLinkClick}>
                    <Heart className="mr-3 h-5 w-5" />
                    Donate
                 </Button>
            </Link>
            <Link href="/password-generator" passHref>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLinkClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5"><path d="m14.5 10.5 5-5"/><path d="m21 3-5 5"/><path d="M7 14a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/><path d="M11 18a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/><path d="M15 22a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/><path d="M18 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/></svg>
                    Password Generator
                </Button>
            </Link>


             {!user ? (
                <Link href="/login" passHref>
                     <Button variant="outline" className="w-full justify-start mt-4" onClick={handleLinkClick}>
                        <LogIn className="mr-3 h-5 w-5" />
                        Login / Register
                    </Button>
                </Link>
             ) : (
                <>
                  <p className='text-sm text-center text-muted-foreground pt-2'>Signed in as {user.name}</p>
                  <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="mr-3 h-5 w-5" />
                      Logout
                  </Button>
                </>
             )}
        </nav>
      </ScrollArea>
    </div>
  );
}
