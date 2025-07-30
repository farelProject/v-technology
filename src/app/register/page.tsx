import { AuthLayout } from '@/components/auth-layout';
import { UserAuthForm } from '@/components/user-auth-form';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your email and password to get started"
    >
      <UserAuthForm type="register" />
    </AuthLayout>
  );
}
