'use client';

import * as React from 'react';
import emailjs from '@emailjs/browser';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

// Initialize EmailJS - ganti dengan ID Anda
// Anda dapat menemukan ID ini di dasbor EmailJS Anda di bawah Account > API Keys
const SERVICE_ID = 'service_y6ub11m';
const TEMPLATE_ID = 'template_wbjlpgs';
const PUBLIC_KEY = '-74AhVg_5O6x8R4CW';


export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [generatedCode, setGeneratedCode] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [codeSent, setCodeSent] = React.useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!email) {
      toast({ title: 'Error', description: 'Silakan masukkan email Anda.', variant: 'destructive' });
      return;
    }
    setIsSending(true);
    
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(randomCode);

    try {
        await emailjs.init(PUBLIC_KEY);
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            to_email: email,
            code: randomCode,
        });
        toast({ title: 'Sukses', description: 'Kode verifikasi telah dikirim ke email Anda.' });
        setCodeSent(true);
    } catch (err) {
        console.error('Failed to send code:', err);
        toast({ title: 'Gagal', description: 'Gagal mengirim kode verifikasi.', variant: 'destructive' });
    } finally {
        setIsSending(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    if (code === generatedCode) {
        toast({ title: 'Sukses', description: 'Verifikasi berhasil! Mengarahkan...' });
        router.push(`/reset-password/${encodeURIComponent(email)}`);
    } else {
        toast({ title: 'Gagal', description: 'Kode verifikasi salah!', variant: 'destructive' });
        setIsVerifying(false);
    }
  };


  return (
    <AuthLayout
      title="Lupa Kata Sandi"
      description="Masukkan email Anda untuk menerima kode verifikasi"
    >
      <form onSubmit={handleVerifyCode} className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                placeholder="nama@contoh.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSending || codeSent}
                required
            />
        </div>
        
        <Button type="button" onClick={handleSendCode} disabled={isSending || codeSent}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {codeSent ? 'Kode Terkirim' : 'Kirim Kode'}
        </Button>
        
        {codeSent && (
            <>
                <div className="grid gap-2">
                    <Label htmlFor="code">Kode Verifikasi</Label>
                    <Input
                        id="code"
                        placeholder="Masukkan 4 digit kode"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        maxLength={4}
                    />
                </div>
                <Button type="submit" disabled={isVerifying || !code}>
                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Lihat Kata Sandi
                </Button>
            </>
        )}

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
