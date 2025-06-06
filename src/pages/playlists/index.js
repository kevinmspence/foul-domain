// pages/playlists/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }

  return { props: {} };
}

export default function PlaylistManagerPage() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch("/api/playlists")
      .then((res) => res.json())
      .then((data) => setPlaylists(data))
      .catch((err) => console.error("Failed to fetch playlists:", err));
  }, []);

  return (
    <>
      <Head>
        <title>Manage Playlists | Foul Domain</title>
      </Head>
      <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-yellow-300">Manage Your Playlists</h1>

          {playlists.length === 0 ? (
            <p className="text-white/60">You don’t have any playlists yet.</p>
          ) : (
            <ul className="divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden">
              {playlists.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <Link
                      href={`/playlists/${p.id}`}
                      className="text-indigo-400 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => alert("🔧 Rename coming soon")}
                      className="text-sm text-white/50 hover:text-white"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => alert("🗑️ Delete coming soon")}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
