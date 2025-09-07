import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { migrateExistingCards } from '@/utils/cardMigration';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Run migrations for existing cards when the app loads
    if (typeof window !== 'undefined') {
      migrateExistingCards();
    }
  }, []);

  return (
    <>
      <Head>
        <title>CardVerse - Create Cards from Everything</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="Transform any photo into epic fantasy cards with AI-powered analysis. Create your own card universe from everyday objects, pets, landscapes, and more!" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.svg" sizes="32x32" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16x16.svg" sizes="16x16" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
