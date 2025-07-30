'use client';

import { useEffect, useState } from 'react';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getPasswordByEmail } from '@/lib/auth-service';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export default function ResetPasswordPage({ params }: { params: { email: string } }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const email = decodeURIComponent(params.email || '');

  useEffect(() => {
    if (!email) {
        setIsLoading(false);
        toast({
            title: 'Error',
            description: 'Email tidak valid.',
            variant: 'destructive'
        });
        return;
    }

    const fetchPassword = async () => {
      const result = await getPasswordByEmail(email);
      if (result.success && result.password) {
        setPassword(result.password);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Tidak dapat mengambil kata sandi.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    };

    fetchPassword();
  }, [email, toast]);

  return (
    <AuthLayout
      title="Kata Sandi Anda"
      description="Ini adalah kata sandi Anda. Simpan di tempat yang aman."
    >
      <Card className="w-full">
        <CardHeader>
           <CardTitle className="text-center text-lg">Email: {email}</CardTitle>
           <CardDescription className="text-center">Kata sandi Anda ditemukan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isLoading ? (
                <Skeleton className="h-10 w-full" />
            ) : password ? (
                 <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        readOnly
                        value={password}
                        className="w-full rounded-md border bg-muted px-3 py-2 text-center text-lg font-bold"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                 </div>
            ) : (
                <p className="text-center text-destructive">Kata sandi tidak ditemukan.</p>
            )}

          <Button asChild className="w-full">
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
