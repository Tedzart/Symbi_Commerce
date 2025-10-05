// app/logout/page.js
'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logoutAndRedirect = async () => {
      await signOut({ redirect: false });
      router.push('/login');
    };

    logoutAndRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl font-semibold">Logging out...</p>
    </div>
  );
}
