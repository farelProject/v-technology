import { AppShell } from '@/components/app-shell';
import { ChatView } from '@/components/chat/chat-view';

export default function Home() {
  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem)]">
        <ChatView />
      </div>
    </AppShell>
  );
}
