'use client';

import Link from 'next/link';
import { Home, MessageSquare, Heart, Info, LogIn } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface SidebarProps {
    onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps) {
  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>
       <ScrollArea className="flex-1">
        <nav className="px-2 py-4 space-y-2">
            <Link href="/" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
            <Home className="w-5 h-5 mr-3" />
            Home
            </Link>
            <Link href="/feedback" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
            <MessageSquare className="w-5 h-5 mr-3" />
            Feedback
            </Link>
            <Link href="/about" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
            <Info className="w-5 h-5 mr-3" />
            About Web
            </Link>
            <Link href="/credits" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
            <Heart className="w-5 h-5 mr-3" />
            Donate
            </Link>
        </nav>
      </ScrollArea>
      <div className="p-4 mt-auto border-t">
         <Link href="/login" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" onClick={handleLinkClick}>
          <LogIn className="w-5 h-5 mr-3" />
          Login / Register
        </Link>
      </div>
    </div>
  );
}
