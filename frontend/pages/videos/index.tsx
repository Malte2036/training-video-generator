import GenerateRandomVideoForm from '@/components/GenerateRandomVideoForm';
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
import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	onSnapshot,
} from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
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

		const unsubscribe = onSnapshot(
			collection(firebaseContext.db, 'GeneratedVideos'),
			(querySnapshot) => {
				console.log(querySnapshot);
				setGeneratedVideos(
					querySnapshot.docs.map((doc) =>
						generatedVideoConverter.fromFirestore(doc, undefined)
					)
				);
			}
		);
		return () => unsubscribe();
	}, []);

	return (
		<div>
			<h1>VideosPage</h1>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>timestamp</TableCell>
							<TableCell>videoPartIds</TableCell>
							<TableCell>state</TableCell>
							<TableCell>storageId</TableCell>
							<TableCell></TableCell>
							<TableCell></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{generatedVideos
							.sort(
								(a, b) =>
									(a.timestamp?.toMillis() ?? 0) -
									(b.timestamp?.toMillis() ?? 0)
							)
							.map((video) => (
								<TableRow key={video.$id}>
									<TableCell>
										{video.timestamp?.toDate().toLocaleString() ?? 'unknown'}
									</TableCell>
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
										{video.storageId && (
											<Button
												onClick={async () => {
													if (video.storageId) {
														const pathReference = ref(
															firebaseContext.storage,
															video.storageId
														);
														const url = await getDownloadURL(pathReference);
														router.push(url);
													}
												}}
											>
												view
											</Button>
										)}
									</TableCell>
									<TableCell>
										<Button
											onClick={async () => {
												await deleteDoc(
													doc(firebaseContext.db, 'GeneratedVideos', video.$id)
												);
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
			<GenerateRandomVideoForm />
		</div>
	);
}

export default VideosPage;
