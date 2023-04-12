import "../styles/globals.css";
import "@tremor/react/dist/esm/tremor.css";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";

import { Page } from "../components/Page";
import { MyUserContextProvider } from "../utils/useUser";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  useEffect(() => {
    document.body.classList?.remove("loading");
  }, []);

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <MyUserContextProvider>
        <Page>
          <Component {...pageProps} />
        </Page>
      </MyUserContextProvider>
    </SessionContextProvider>
  );
}
