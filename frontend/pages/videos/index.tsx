import { FirebaseContext } from '@/contexts/FirebaseContext';
import {
	GeneratedVideo,
	generatedVideoConverter,
	GeneratedVideoState,
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
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
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
	}, []);

	async function generateRandomVideo() {
		const querySnapshot = await getDocs(
			collection(firebaseContext.db, 'VideoParts')
		);

		let allVideoPartIds = querySnapshot.docs.map((doc) => doc.id);

		allVideoPartIds = allVideoPartIds
			.map((value) => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value);

		const videoPartIds = allVideoPartIds.slice(0, 2);
		console.log(videoPartIds);

		const ref = collection(firebaseContext.db, 'GeneratedVideos').withConverter(
			generatedVideoConverter
		);
		await addDoc(
			ref,
			new GeneratedVideo('', videoPartIds, GeneratedVideoState.UNKNOWN, '')
		);

		router.reload();
	}

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
			<Button onClick={generateRandomVideo}>Generate random</Button>
		</div>
	);
}

export default VideosPage;
