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

export default function FeedbackPage() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>
              We would love to hear your thoughts, suggestions, or issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea id="feedback" placeholder="Describe your feedback..." rows={5} />
            </div>
            <Button>Submit</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
