'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth-context';
import { getAllChatSessions, deleteChatSession } from '@/lib/chat-service';
import type { ChatSession } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    } else if (user) {
      getAllChatSessions(user.id)
        .then((data) => {
          // Sort sessions by most recent first
          data.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setSessions(data);
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, isAuthLoading, router]);

  const handleDelete = async (sessionId: string) => {
    if (!user) return;
    const result = await deleteChatSession(user.id, sessionId);
    if (result.success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast({ title: 'Chat Deleted', description: 'The chat session has been removed.' });
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <AppShell>
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Chat History</CardTitle>
            <CardDescription>
              Review and continue your past conversations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <Card key={session.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(session.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Button asChild>
                           <Link href={`/?id=${session.id}`}>Continue</Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete this chat session. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(session.id)}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No chat history found.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
