import { FirebaseContext } from '@/contexts/FirebaseContext';
import {
	GeneratedVideo,
	generatedVideoConverter,
	GeneratedVideoState,
} from '@/models/GeneratedVideo';
import { VideoPart, videoPartConverter } from '@/models/VideoPart';
import {
	YoutubeVideoMetadata,
	youtubeVideoMetadataConverter,
} from '@/models/YoutubeVideoMetadata';
import { addDoc, collection, getDocs, Timestamp } from '@firebase/firestore';
import { Label } from '@mui/icons-material';
import {
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	Input,
} from '@mui/material';
import { useRouter } from 'next/router';
import { FormEvent, useContext, useEffect, useState } from 'react';

export default function GenerateRandomVideoForm() {
	const firebaseContext = useContext(FirebaseContext);

	const [videoParts, setVideoParts] = useState<VideoPart[]>([]);
	const [youtubeVideoMetadatas, setYoutubeVideoMetadatas] = useState<
		YoutubeVideoMetadata[]
	>([]);

	const [selectedYoutubeVideoIds, setSelectedYoutubeVideoIds] = useState<
		Set<string>
	>(new Set());

	const [count, setCount] = useState<number | null>();

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

		setSelectedYoutubeVideoIds(
			new Set(videoParts.map((videoPart) => videoPart.youtubeVideoId))
		);
	}, [videoParts]);

	async function generateRandomVideo(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		let allVideoPartIds = videoParts
			.filter((videoPart) =>
				selectedYoutubeVideoIds.has(videoPart.youtubeVideoId)
			)
			.map((videoPart) => videoPart.$id);

		allVideoPartIds = allVideoPartIds
			.map((value) => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value);

		const videoPartIds = allVideoPartIds.slice(0, count ?? 10);

		const ref = collection(firebaseContext.db, 'GeneratedVideos').withConverter(
			generatedVideoConverter
		);
		await addDoc(
			ref,
			new GeneratedVideo(
				'',
				videoPartIds,
				Timestamp.now(),
				GeneratedVideoState.UNKNOWN,
				''
			)
		);
	}

	return (
		<>
			<form onSubmit={(event) => generateRandomVideo(event)}>
				<Input
					placeholder="count"
					type={'number'}
					value={count ?? ''}
					onChange={(event) => setCount(Number.parseInt(event.target.value))}
				></Input>
				<br />
				<span>Included Videos:</span>
				<FormGroup>
					{videoParts
						.map((videoPart) => videoPart.youtubeVideoId)
						.filter((v, i, a) => a.indexOf(v) === i)
						.map((youtubeVideoId) => (
							<FormControlLabel
								key={youtubeVideoId}
								control={
									<Checkbox
										checked={selectedYoutubeVideoIds.has(youtubeVideoId)}
										onChange={(event, checked) => {
											event.preventDefault();
											setSelectedYoutubeVideoIds((state) => {
												if (checked) {
													return new Set(state.add(youtubeVideoId));
												} else {
													state.delete(youtubeVideoId);
													return new Set(state);
												}
											});
										}}
									/>
								}
								label={
									youtubeVideoMetadatas.find(
										(youtubeVideoMetadata) =>
											youtubeVideoMetadata.$id == youtubeVideoId
									)?.title
								}
							/>
						))}
				</FormGroup>
				<Button type="submit" disabled={selectedYoutubeVideoIds.size == 0}>
					Generate
				</Button>
			</form>
		</>
	);
}
