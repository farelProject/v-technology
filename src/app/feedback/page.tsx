
'use client';

import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function FeedbackPage() {
  const form = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!form.current) {
        setIsLoading(false);
        return;
    }
    
    // IMPORTANT: You need to create an account at https://www.emailjs.com/
    // and create a service and a template. Then, create a .env.local file
    // in the root of your project and add your credentials there.
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

    if(!serviceId || !templateId || !publicKey) {
        toast({
            title: 'Configuration Error',
            description: 'EmailJS credentials are not set up. Please check the environment variables.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    emailjs
      .sendForm(serviceId, templateId, form.current, {
        publicKey: publicKey,
      })
      .then(
        () => {
          toast({
            title: 'Feedback Sent!',
            description: 'Thank you for your feedback.',
          });
          setFeedback('');
        },
        (error) => {
          toast({
            title: 'Failed to Send Feedback',
            description: 'An error occurred: ' + error.text,
            variant: 'destructive',
          });
        }
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>
              We would love to hear your thoughts, suggestions, or issues. Your
              feedback will be sent to farproject.studio@gmail.com.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={form} onSubmit={sendEmail} className="space-y-4">
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
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
