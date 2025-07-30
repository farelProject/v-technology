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
            title: 'Tautan Reset Terkirim (Simulasi)',
            description: `Kami telah membuat tautan reset untuk Anda. Klik untuk melanjutkan: ${resetUrl}`,
            duration: 15000, // Keep toast longer
        });
         toast({
            title: 'Permintaan Reset Berhasil',
            description: 'Jika ada akun dengan email tersebut, kami telah mengirimkan instruksi reset.',
        });
    } else {
        // Show a generic message to prevent email enumeration
        toast({
            title: 'Permintaan Reset Berhasil',
            description: 'Jika ada akun dengan email tersebut, kami telah mengirimkan instruksi reset.',
        });
    }
    
    setIsLoading(false);
  };

  return (
    <AuthLayout
      title="Lupa Kata Sandi"
      description="Masukkan email Anda untuk menerima tautan reset kata sandi"
    >
      <form onSubmit={handlePasswordResetRequest} className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                placeholder="nama@contoh.com"
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
            Kirim Tautan Reset
        </Button>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          Ingat kata sandi Anda?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Masuk
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
