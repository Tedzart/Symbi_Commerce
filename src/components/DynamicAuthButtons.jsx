// app/components/DynamicAuthButtons.jsx
'use client';
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DynamicAuthButtons() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || status === "loading") {
    return (
      <div className="flex space-x-4">
        <div className="bg-white text-blue-600 px-4 py-2 rounded-md opacity-0">Register</div>
        <div className="bg-white text-blue-600 px-4 py-2 rounded-md opacity-0">Login</div>
      </div>
    );
  }

  if (session) {
    return (
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="bg-white text-red-600 px-4 py-2 rounded-md hover:bg-red-100"
      >
        Logout
      </button>
    );
  }

  return (
    <>
      <Link href="/register" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50">
        Register
      </Link>
      <Link href="/login" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50">
        Login
      </Link>
    </>
  );
}