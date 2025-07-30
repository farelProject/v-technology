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
import { Loader2 } from 'lucide-react';
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
          description: result.message || 'Token reset tidak valid atau telah kedaluwarsa.',
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
        description: 'Kata sandi tidak cocok.',
        variant: 'destructive'
      });
      return;
    }
    if (password.length < 6) {
        toast({
            title: 'Error',
            description: 'Kata sandi harus minimal 6 karakter.',
            variant: 'destructive'
        });
        return;
    }

    setIsResetting(true);
    const result = await resetPassword(token, password);
    if(result.success) {
        toast({
            title: 'Sukses',
            description: 'Kata sandi Anda telah berhasil direset. Silakan masuk.',
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
       <AuthLayout title="Memverifikasi..." description="Harap tunggu sebentar.">
         <Loader2 className="mx-auto h-8 w-8 animate-spin" />
       </AuthLayout>
    )
  }

  if (!isValidToken) {
     return (
       <AuthLayout title="Token Tidak Valid" description="Tautan reset kata sandi ini tidak valid atau telah kedaluwarsa.">
         <Button asChild className="w-full">
            <Link href="/forgot-password">Minta Tautan Baru</Link>
          </Button>
       </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset Kata Sandi Anda"
      description={`Memperbarui kata sandi untuk ${maskEmail(userEmail)}`}
    >
      <Card className="w-full border-none shadow-none">
        <CardContent className="p-0">
          <form onSubmit={handleResetSubmit} className="grid gap-4">
             <div className="grid gap-2">
                <Label htmlFor="new-password">Kata Sandi Baru</Label>
                <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isResetting}
                />
             </div>
             <div className="grid gap-2">
                <Label htmlFor="confirm-password">Konfirmasi Kata Sandi Baru</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isResetting}
                />
             </div>

            <Button type="submit" disabled={isResetting} className="w-full">
               {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Reset Kata Sandi
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
