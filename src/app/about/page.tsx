import { AppShell } from '@/components/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { VTechIcon } from '@/components/vtech-icon';


export default function AboutPage() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="text-center">
          <CardHeader>
            <VTechIcon className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-4">About VTech AI</CardTitle>
            <CardDescription>Your Intelligent Assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              VTech AI is a modern and intuitive AI assistant created by Farel Alfareza.
              It's designed to help you with a variety of tasks, from answering complex questions and generating code to creating beautiful images from text prompts.
            </p>
            <p>
              Our mission is to provide a seamless, helpful, and powerful user experience, making advanced AI accessible to everyone.
            </p>
             <p className="font-semibold text-primary pt-4">Version 1.0.0</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
