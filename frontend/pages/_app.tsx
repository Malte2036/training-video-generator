import { AppwriteContext } from "@/contexts/AppwriteContext";
import { AppProps } from "next/app";
import { useContext, useEffect, useState } from "react";

export default function TrainingApp({ Component, pageProps }: AppProps) {
    const appwrite = useContext(AppwriteContext);

    const [sessionCreated, setSessionCreated] = useState<boolean>(false);

    useEffect(() => {
        async function createSession() {
            let session;
            try {
                session = await appwrite.account.get()
            } catch (error) {

            }
            if (!session) {
                await appwrite.account.createAnonymousSession();
            }
            setSessionCreated(true)
        }
        createSession();
    }, [])

    if (!sessionCreated) {
        return <>creating session...</>
    }
    return <Component {...pageProps} />
}