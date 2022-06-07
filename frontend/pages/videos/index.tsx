import { FirebaseContext } from '@/contexts/FirebaseContext';
import {
	GeneratedVideo,
	generatedVideoConverter,
} from '@/models/GeneratedVideo';
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
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

function VideosPage() {
	const firebaseContext = useContext(FirebaseContext);
	const router = useRouter();

	const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

	useEffect(() => {
		const fetchGeneratedVideos = async () => {
			const querySnapshot = await getDocs(
				collection(firebaseContext.db, 'GeneratedVideos')
			);
			setGeneratedVideos(
				querySnapshot.docs.map((doc) =>
					generatedVideoConverter.fromFirestore(doc, undefined)
				)
			);
			console.log(generatedVideos);
		};
		fetchGeneratedVideos();
	}, []);

	return (
		<div>
			<h1>VideosPage</h1>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>videoPartIds</TableCell>
							<TableCell>state</TableCell>
							<TableCell>storageId</TableCell>
							<TableCell></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{generatedVideos.map((video) => (
							<TableRow key={video.$id}>
								<TableCell>
									{video.videoPartIds.map((id) => (
										<span key={id} style={{ cursor: 'pointer' }}>
											{`${id}, `}
										</span>
									))}
								</TableCell>
								<TableCell>{video.state}</TableCell>
								<TableCell>{video.storageId}</TableCell>
								<TableCell>
									<Button
										onClick={async () => {
											await deleteDoc(
												doc(firebaseContext.db, 'GeneratedVideos', video.$id)
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
			<Button onClick={() => undefined}>Generate random</Button>
		</div>
	);
}

export default VideosPage;
