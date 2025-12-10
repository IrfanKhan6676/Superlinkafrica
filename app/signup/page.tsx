import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignupForm from '@/components/auth/SignupForm';

export default async function SignupPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">Join us today to get started</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
