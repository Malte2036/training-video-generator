import { Button } from '@mui/material';
import { AppProps } from 'next/app';
import { useContext, useEffect, useState } from 'react';
import {
	getAuth,
	getRedirectResult,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
	signInWithRedirect,
} from 'firebase/auth';
import { app, auth } from '@/contexts/FirebaseContext';

export default function TrainingApp({ Component, pageProps }: AppProps) {
	const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			setLoggedIn(user != null);
		});
	}, []);

	useEffect(() => {}, []);

	if (loggedIn === undefined) {
		return <>checkLoggedIn...</>;
	} else if (!loggedIn) {
		return (
			<>
				<Button
					onClick={() => {
						const provider = new GoogleAuthProvider();
						signInWithRedirect(auth, provider);
					}}
				>
					Google Login
				</Button>
			</>
		);
	}
	return <Component {...pageProps} />;
}
