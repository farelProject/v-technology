'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'login' | 'register' | 'forgot-password';
}

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const { toast } = useToast();
  const router = useRouter();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    if (type === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login Successful',
          description: 'Redirecting you to the main app...',
        });
        router.push('/');
        router.refresh();
      }
    } else if (type === 'register') {
      if (password !== confirmPassword) {
        toast({
          title: 'Registration Failed',
          description: 'Passwords do not match.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        toast({
          title: 'Registration Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration Successful',
          description: 'Please check your email to verify your account.',
        });
        router.push('/login');
      }
    } else if (type === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Password Reset Email Sent',
                description: 'Please check your email for a link to reset your password.',
            });
        }
    }


    setIsLoading(false);
  }

  const renderRegisterFields = () => (
    <>
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your Name"
          type="text"
          autoCapitalize="words"
          autoComplete="name"
          disabled={isLoading}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          disabled={isLoading}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          disabled={isLoading}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
       <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          disabled={isLoading}
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
    </>
  );

  const renderLoginFields = () => (
     <>
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" passHref className="text-sm text-primary hover:underline underline-offset-4">
                    Forgot Password?
                </Link>
            </div>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
     </>
  );
  
  const renderForgotPasswordFields = () => (
     <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          disabled={isLoading}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
  );


  const getTitle = () => {
    switch (type) {
        case 'login': return 'Sign In';
        case 'register': return 'Create Account';
        case 'forgot-password': return 'Reset Password';
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
            {type === 'register' && renderRegisterFields()}
            {type === 'login' && renderLoginFields()}
            {type === 'forgot-password' && renderForgotPasswordFields()}

          <Button disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getTitle()}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {type === 'login' && "Or continue with"}
            {type === 'register' && 'Already have an account?'}
            {type === 'forgot-password' && 'Remembered your password?'}
          </span>
        </div>
      </div>
       {type === 'login' && (
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            Don't have an account? Sign Up
          </Link>
        </p>
      )}
      {(type === 'register' || type === 'forgot-password') && (
         <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign In
          </Link>
        </p>
      )}
    </div>
  );
}
