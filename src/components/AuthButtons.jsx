// app/components/AuthButtons.jsx
'use client';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="flex space-x-4 invisible">
        <span className="bg-white text-blue-600 px-4 py-2 rounded-md">Register</span>
        <span className="bg-white text-blue-600 px-4 py-2 rounded-md">Login</span>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-6 -ml-4 -translate-x-16"> {/* Shift left */}
        <span className="text-white">Welcome, {session.user.name}</span>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="bg-white text-red-600 px-4 py-2 rounded-md hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-4">
      <Link href="/register" className="bg-white text-blue-300 px-2 py-1 rounded-md hover:bg-blue-40">
        Register
      </Link>
      <Link href="/login" className="bg-white text-blue-300 px-2 py-1 rounded-md hover:bg-blue-40">
        Login
      </Link>
    </div>
  );
}