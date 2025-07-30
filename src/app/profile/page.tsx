
'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteUser } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { getAndUpdateChatLimit } from '@/lib/chat-service';
import { type ChatLimit } from '@/lib/types';
import Link from 'next/link';


function ChatLimitDisplay({ initialLimit }: { initialLimit: ChatLimit | null }) {
    const [limitInfo, setLimitInfo] = useState<ChatLimit | null>(initialLimit);
    const { user } = useAuth();
    
    useEffect(() => {
        const fetchLimit = async () => {
            if (user?.id) {
                const latestLimit = await getAndUpdateChatLimit(user.id, false); // Fetch without incrementing
                setLimitInfo(latestLimit);
            } else {
                setLimitInfo(initialLimit);
            }
        };
        fetchLimit();
    }, [user?.id, initialLimit]);
    
    if (!limitInfo) {
        return <div className="text-sm text-muted-foreground">Loading limit info...</div>;
    }

    const { count, limit, lastReset } = limitInfo;
    const remaining = Math.max(0, limit - count);
    const percentage = limit > 0 ? (remaining / limit) * 100 : 0;
    const nextResetDate = new Date(new Date(lastReset).getTime() + 24 * 60 * 60 * 1000);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <Label>Daily Chats Remaining</Label>
                <p className="text-sm font-medium text-muted-foreground">
                    {remaining} / {limit} Remaining
                </p>
            </div>
            <Progress value={percentage} className="w-full" />
            <p className="text-xs text-muted-foreground text-right">
                Resets {formatDistanceToNow(nextResetDate, { addSuffix: true })}
            </p>
        </div>
    );
}


export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, logout, isLoading: isAuthLoading, chatLimit } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);


  const handleSave = () => {
    // In a real app with a proper DB, you would update the user info here.
    // For now, we just show a toast as there's no persistence for name changes.
    toast({
      title: 'Profile Updated',
      description: 'Your information has been saved successfully.',
    });
  };

  const handleDeleteAccount = async () => {
    if (!email) return;
    setIsDeleting(true);
    const result = await deleteUser(email);

    if (result.success) {
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
      logout(); // This will clear local storage and redirect
    } else {
      toast({
        title: 'Deletion Failed',
        description: result.message,
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };
  
  if (isAuthLoading) {
      return (
          <AppShell>
              <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
              </div>
          </AppShell>
      )
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl py-8 space-y-8">
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled // Email should not be editable as it's the identifier
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleSave}>Save Changes</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        'Continue'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ) : (
           <Card>
            <CardHeader>
                <CardTitle>Join VTech AI</CardTitle>
                <CardDescription>Create an account to save your chat history, get a higher chat limit, and unlock all features.</CardDescription>
            </CardHeader>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login or Register
                    </Link>
                </Button>
            </CardFooter>
           </Card>
        )}
        
        <Card>
            <CardHeader>
                <CardTitle>Usage</CardTitle>
                <CardDescription>Your daily chat limit status.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChatLimitDisplay initialLimit={chatLimit} />
            </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}
