import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Gift } from 'lucide-react';
import Link from 'next/link';

export default function CreditsPage() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Credits & Support</CardTitle>
            <CardDescription>VTech AI Assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Created with ❤️ by{' '}
              <span className="font-semibold text-primary">
                Farel Alfareza
              </span>
            </p>
            <p className="text-muted-foreground">
              This application is an AI-powered assistant designed to be helpful
              and intuitive.
            </p>
            <div>
              <Button asChild>
                <Link
                  href="https://saweria.co/FarelAlfareza"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Support the Creator
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
