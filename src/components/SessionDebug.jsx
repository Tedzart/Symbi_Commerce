// app/components/SessionDebug.jsx
'use client';
import { useSession } from "next-auth/react";

export default function SessionDebug() {
  const { data: session, status } = useSession();
  return (
    <div className="fixed bottom-0 left-0 bg-black text-white p-2 text-xs">
      <div>Status: {status}</div>
      <div>Session: {JSON.stringify(session)}</div>
    </div>
  );
}