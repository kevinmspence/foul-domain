import "@/styles/globals.css";
import Head from "next/head";
import Layout from "@/components/Layout"; // make sure this path is correct

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/fish-favicon.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
