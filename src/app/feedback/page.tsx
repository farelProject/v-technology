
'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('');

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = 'Feedback for VTech AI';
    const body = encodeURIComponent(feedback);
    window.location.href = `mailto:farproject.studio@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>
              We would love to hear your thoughts or suggestions. Clicking submit will open your default email client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  name="message"
                  placeholder="Describe your feedback..."
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={!feedback.trim()}>
                <Mail className="mr-2 h-4 w-4" />
                Send via Email
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
