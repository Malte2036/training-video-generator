import { VideoPart, videoPartConverter } from '@/models/VideoPart';
import {
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/contexts/FirebaseContext';

export default function VideoPartsPage() {
	const router = useRouter();

	const [videoParts, setVideoParts] = useState<VideoPart[]>([]);

	useEffect(() => {
		const fetchVideoParts = async () => {
			const querySnapshot = await getDocs(collection(db, 'VideoParts'));
			setVideoParts(
				querySnapshot.docs.map((doc) =>
					videoPartConverter.fromFirestore(doc, undefined)
				)
			);
		};
		fetchVideoParts();
	}, []);

	return (
		<>
			<h1>VideoPartsPage</h1>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>youtubeId</TableCell>
							<TableCell>start</TableCell>
							<TableCell>end</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{videoParts.map((videoPart) => (
							<TableRow key={videoPart.$id}>
								<TableCell>
									<span style={{ cursor: 'pointer' }}>
										{videoPart.youtubeVideoId}
									</span>
								</TableCell>
								<TableCell>{videoPart.start}</TableCell>
								<TableCell>{videoPart.end}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<br />
			<Button onClick={() => router.push('/videos/parts/add')}>
				Create new
			</Button>
		</>
	);
}
