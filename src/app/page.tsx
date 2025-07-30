import { AppShell } from '@/components/app-shell';
import { ChatView } from '@/components/chat/chat-view';

export default function Home() {
  return (
    <AppShell>
      <ChatView />
    </AppShell>
  );
}
