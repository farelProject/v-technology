import { AuthLayout } from '@/components/auth-layout';
import { UserAuthForm } from '@/components/user-auth-form';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email to receive a password reset link"
    >
      <UserAuthForm type="forgot-password" />
    </AuthLayout>
  );
}
