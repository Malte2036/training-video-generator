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
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { FirebaseContext } from '@/contexts/FirebaseContext';

export default function VideoPartsPage() {
	const firebaseContext = useContext(FirebaseContext);
	const router = useRouter();

	const [videoParts, setVideoParts] = useState<VideoPart[]>([]);

	useEffect(() => {
		const fetchVideoParts = async () => {
			const querySnapshot = await getDocs(
				collection(firebaseContext.db, 'VideoParts')
			);
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
							<TableCell></TableCell>
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
								<TableCell>
									<Button
										onClick={async () => {
											await deleteDoc(
												doc(firebaseContext.db, 'VideoParts', videoPart.$id)
											);
											router.reload();
										}}
									>
										delete
									</Button>
								</TableCell>
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
