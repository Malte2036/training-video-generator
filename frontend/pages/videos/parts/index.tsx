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
import ExpandableRow from '@/components/ExpandableRow';
import {
	YoutubeVideoMetadata,
	youtubeVideoMetadataConverter,
} from '@/models/YoutubeVideoMetadata';

export default function VideoPartsPage() {
	const firebaseContext = useContext(FirebaseContext);
	const router = useRouter();

	const [videoParts, setVideoParts] = useState<VideoPart[]>([]);
	const [youtubeVideoMetadatas, setYoutubeVideoMetadatas] = useState<
		YoutubeVideoMetadata[]
	>([]);

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

	useEffect(() => {
		const fetchYoutubeVideoMetadata = async () => {
			const querySnapshot = await getDocs(
				collection(firebaseContext.db, 'YoutubeVideoMetadata')
			);
			setYoutubeVideoMetadatas(
				querySnapshot.docs.map((doc) =>
					youtubeVideoMetadataConverter.fromFirestore(doc, undefined)
				)
			);
		};
		fetchYoutubeVideoMetadata();
	}, [videoParts]);

	return (
		<>
			<h1>VideoPartsPage</h1>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell></TableCell>
							<TableCell>youtubeId</TableCell>
							<TableCell>authorName</TableCell>
							<TableCell>title</TableCell>
							<TableCell>start</TableCell>
							<TableCell>count</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{[
							...Array.from(
								new Set(videoParts.map((videoPart) => videoPart.youtubeVideoId))
							),
						].map((youtubeVideoId) => (
							<ExpandableRow
								tableCells={[
									<TableCell>{youtubeVideoId}</TableCell>,
									<TableCell>
										{
											youtubeVideoMetadatas.find(
												(metadata) => metadata.$id == youtubeVideoId
											)?.authorName
										}
									</TableCell>,
									<TableCell>
										{
											youtubeVideoMetadatas.find(
												(metadata) => metadata.$id == youtubeVideoId
											)?.title
										}
									</TableCell>,
									<TableCell>
										{
											videoParts
												.filter(
													(videoPart) =>
														videoPart.youtubeVideoId == youtubeVideoId
												)
												.sort((a, b) => a.start - b.start)[0].start
										}
									</TableCell>,
									<TableCell>
										{
											videoParts.filter(
												(videoPart) =>
													videoPart.youtubeVideoId == youtubeVideoId
											).length
										}
									</TableCell>,
								]}
								key={youtubeVideoId}
							>
								<>
									<br />
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
												{videoParts
													.filter(
														(videoPart) =>
															videoPart.youtubeVideoId == youtubeVideoId
													)
													.sort((a, b) => a.start - b.start)
													.map((videoPart) => (
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
																			doc(
																				firebaseContext.db,
																				'VideoParts',
																				videoPart.$id
																			)
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
								</>
							</ExpandableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<br />

			<br />
			<Button onClick={() => router.push('/videos/parts/add')}>
				Create new
			</Button>
		</>
	);
}
