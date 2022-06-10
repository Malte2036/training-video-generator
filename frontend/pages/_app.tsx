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
import { FirebaseContext } from '@/contexts/FirebaseContext';
import Header from '@/components/Header';

export default function TrainingApp({ Component, pageProps }: AppProps) {
	const firebaseContext = useContext(FirebaseContext);
	const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		onAuthStateChanged(firebaseContext.auth, (user) => {
			setLoggedIn(user != null);
		});
	}, []);

	if (loggedIn === undefined) {
		return <>checkLoggedIn...</>;
	} else if (!loggedIn) {
		return (
			<>
				<Button
					onClick={() => {
						const provider = new GoogleAuthProvider();
						signInWithRedirect(firebaseContext.auth, provider);
					}}
				>
					Google Login
				</Button>
			</>
		);
	}
	return (
		<>
			<Header />
			<Component {...pageProps} />
		</>
	);
}
