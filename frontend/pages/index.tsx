import { FirebaseContext } from '@/contexts/FirebaseContext';
import { Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';

function HomePage() {
	const firebaseContext = useContext(FirebaseContext);
	const router = useRouter();

	return (
		<div>
			<h1>Welcome to Training-Web!</h1>
			<br />
			<Link href={'/videos'}>VideosPage</Link>{' '}
			<Link href={'/videos/parts'}>VideoPartsPage</Link>
			<Button
				onClick={async () => {
					await firebaseContext.auth.signOut();
					router.reload();
				}}
			>
				Logout
			</Button>
		</div>
	);
}

export default HomePage;
