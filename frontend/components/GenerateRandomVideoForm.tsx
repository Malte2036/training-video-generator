import { FirebaseContext } from '@/contexts/FirebaseContext';
import {
	GeneratedVideo,
	generatedVideoConverter,
	GeneratedVideoState,
} from '@/models/GeneratedVideo';
import { addDoc, collection, getDocs } from '@firebase/firestore';
import { Button, Input } from '@mui/material';
import { useRouter } from 'next/router';
import { FormEvent, useContext, useState } from 'react';

export default function GenerateRandomVideoForm() {
	const firebaseContext = useContext(FirebaseContext);

	const [count, setCount] = useState<number | null>();
	async function generateRandomVideo(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const querySnapshot = await getDocs(
			collection(firebaseContext.db, 'VideoParts')
		);

		let allVideoPartIds = querySnapshot.docs.map((doc) => doc.id);

		allVideoPartIds = allVideoPartIds
			.map((value) => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value);

		const videoPartIds = allVideoPartIds.slice(0, count ?? 10);
		console.log(videoPartIds);

		const ref = collection(firebaseContext.db, 'GeneratedVideos').withConverter(
			generatedVideoConverter
		);
		await addDoc(
			ref,
			new GeneratedVideo('', videoPartIds, GeneratedVideoState.UNKNOWN, '')
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
				<Button type="submit">Generate</Button>
			</form>
		</>
	);
}
