import { AuthLayout } from '@/components/auth-layout';
import { UserAuthForm } from '@/components/user-auth-form';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your email and password to sign in"
    >
      <UserAuthForm type="login" />
    </AuthLayout>
  );
}
