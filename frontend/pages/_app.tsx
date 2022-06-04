import { AppwriteContext } from "@/contexts/AppwriteContext";
import { Button } from "@mui/material";
import { AppProps } from "next/app";
import { useContext, useEffect, useState } from "react";

export default function TrainingApp({ Component, pageProps }: AppProps) {
  const appwrite = useContext(AppwriteContext);

  const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined);

  async function oAuthLogin(provider: "discord" | "github") {
    appwrite.account.createOAuth2Session(
      provider,
      `${window.location.href}`,
      `${window.location.href}#error`
    );
  }

  useEffect(() => {
    async function checkLoggedIn() {
      let session;
      try {
        session = await appwrite.account.get();
      } catch (error) {}
      setLoggedIn(session ? true : false);
    }
    checkLoggedIn();
  }, [appwrite.account]);

  if (loggedIn === undefined) {
    return <>checkLoggedIn...</>;
  } else if (!loggedIn) {
    return (
      <>
        <Button onClick={() => oAuthLogin("discord")}>Discord Login</Button>
        <Button onClick={() => oAuthLogin("github")}>GitHub Login</Button>
      </>
    );
  }
  return <Component {...pageProps} />;
}
