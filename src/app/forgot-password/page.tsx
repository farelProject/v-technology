'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { generatePasswordResetToken } from '@/lib/auth-service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await generatePasswordResetToken(email);

    if (result.success && result.token) {
        // In a real app, you would email this link to the user.
        // For this demo, we'll show it in a toast and log it.
        const resetUrl = `${window.location.origin}/reset-password/${result.token}`;
        console.log('Password Reset URL:', resetUrl);
        toast({
            title: 'Reset Link Sent (Simulation)',
            description: `We've generated a reset link for you. Click to proceed: ${resetUrl}`,
            duration: 15000, // Keep toast longer
        });
         toast({
            title: 'Reset Request Successful',
            description: 'If an account exists with that email, we have sent reset instructions.',
        });
    } else {
        // Show a generic message to prevent email enumeration
        toast({
            title: 'Reset Request Successful',
            description: 'If an account exists with that email, we have sent reset instructions.',
        });
    }
    
    setIsLoading(false);
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email to receive a password reset link"
    >
      <form onSubmit={handlePasswordResetRequest} className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
            />
        </div>
        
        <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
        </Button>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
