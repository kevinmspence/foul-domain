// pages/_app.js
import "@/styles/globals.css";
import Head from "next/head";
import Layout from "@/components/Layout";
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { AudioPlayerProvider } from "@/components/AudioPlayerContext";
import NowPlayingBar from "@/components/NowPlayingBar";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return session ? (
    <div className="text-sm text-right text-white/70">
      Signed in as {session.user.email}{" "}
      <button
        onClick={() => signOut()}
        className="ml-2 underline text-indigo-400 hover:text-indigo-300"
      >
        Sign out
      </button>
    </div>
  ) : (
    <button
      onClick={() => signIn("google")}
      className="text-sm underline text-indigo-400 hover:text-indigo-300"
    >
      Sign in with Google
    </button>
  );
}

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag?.("config", "G-6G9CLBBL99", {
        page_path: url,
      });
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <Head>
        <link rel="icon" href="/fish-favicon.ico" />
      </Head>

      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-6G9CLBBL99"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6G9CLBBL99', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <SessionProvider>
        <AudioPlayerProvider>
          <Layout>
            <div className="p-4 text-right">
              <AuthStatus />
            </div>
            <Component {...pageProps} />
            <NowPlayingBar />
          </Layout>
        </AudioPlayerProvider>
      </SessionProvider>
    </>
  );
}
