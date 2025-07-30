'use client';

import { useEffect, useState } from 'react';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getUserByResetToken, resetPassword } from '@/lib/auth-service';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

function maskEmail(email: string) {
    if (!email || !email.includes('@')) {
        return '...';
    }
    const [name, domain] = email.split('@');
    if (name.length <= 2) {
        return `${name.slice(0, 1)}**@${domain}`;
    }
    return `${name.slice(0, 2)}${'*'.repeat(name.length - 2)}@${domain}`;
}

export default function ResetPasswordPage({ params }: { params: { email: string } }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const { toast } = useToast();
  const router = useRouter();
  const token = decodeURIComponent(params.email); // It's a token now, not an email

  useEffect(() => {
    const verifyToken = async () => {
      const result = await getUserByResetToken(token);
      if (result.success && result.email) {
        setUserEmail(result.email);
        setIsValidToken(true);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Password reset token is invalid or has expired.',
          variant: 'destructive',
        });
        setIsValidToken(false);
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token, toast]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive'
      });
      return;
    }
    if (password.length < 6) {
        toast({
            title: 'Error',
            description: 'Password must be at least 6 characters long.',
            variant: 'destructive'
        });
        return;
    }

    setIsResetting(true);
    const result = await resetPassword(token, password);
    if(result.success) {
        toast({
            title: 'Success',
            description: 'Your password has been reset successfully. Please log in.',
        });
        router.push('/login');
    } else {
        toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive'
        });
    }
    setIsResetting(false);
  }

  if (isLoading) {
    return (
       <AuthLayout title="Verifying..." description="Please wait a moment.">
         <Loader2 className="mx-auto h-8 w-8 animate-spin" />
       </AuthLayout>
    )
  }

  if (!isValidToken) {
     return (
       <AuthLayout title="Invalid Token" description="This password reset link is invalid or has expired.">
         <Button asChild className="w-full">
            <Link href="/forgot-password">Request a New Link</Link>
          </Button>
       </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      description={`Updating password for ${maskEmail(userEmail)}`}
    >
      <Card className="w-full border-none shadow-none">
        <CardContent className="p-0">
          <form onSubmit={handleResetSubmit} className="grid gap-4">
             <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isResetting}
                      className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
             </div>
             <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isResetting}
                      className="pr-10"
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle confirm password visibility</span>
                  </Button>
                </div>
             </div>

            <Button type="submit" disabled={isResetting} className="w-full">
               {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
