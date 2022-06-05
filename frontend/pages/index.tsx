import { AppwriteContext } from '@/contexts/AppwriteContext';
import { auth } from '@/contexts/FirebaseContext';
import { Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';

function HomePage() {
	const appwrite = useContext(AppwriteContext);

	const router = useRouter();

	return (
		<div>
			<h1>Welcome to Training-Web!</h1>
			<br />
			<Link href={'/videos/parts'}>VideoPartsPage</Link>
			<Button
				onClick={async () => {
					await auth.signOut();
					router.reload();
				}}
			>
				Logout
			</Button>
		</div>
	);
}

export default HomePage;
