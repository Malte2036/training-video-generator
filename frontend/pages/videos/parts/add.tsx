import { FirebaseContext } from '@/contexts/FirebaseContext';
import { VideoPart, videoPartConverter } from '@/models/VideoPart';
import { Button, Input } from '@mui/material';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { FormEvent, useContext, useState } from 'react';

function AddVideoPartPage() {
	const firebaseContext = useContext(FirebaseContext);
	const router = useRouter();

	const [youtubeVideoId, setYoutubeVideoId] = useState<string>('');
	const [start, setStart] = useState<number | null>();
	const [length, setLength] = useState<number | null>();
	const [repeat, setRepeat] = useState<number | null>();

	async function createVideoPart(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const ref = collection(firebaseContext.db, 'VideoParts').withConverter(
			videoPartConverter
		);

		const repeatTimes = repeat ?? 1;
		for (let i = 0; i < repeatTimes; i++) {
			const currentStart = (start ?? 0) + length! * i;
			await addDoc(
				ref,
				new VideoPart('', youtubeVideoId, currentStart, currentStart + length!)
			);
			console.log(
				`created: ${youtubeVideoId} ${currentStart}:${currentStart + length!}`
			);
		}
		router.push('/videos/parts');
	}

	return (
		<>
			<h1>AddVideoPartPage</h1>
			<form onSubmit={(event) => createVideoPart(event)}>
				<Input
					placeholder="youtubeVideoId"
					required
					value={youtubeVideoId}
					onChange={(event) => setYoutubeVideoId(event.target.value)}
				></Input>
				<Input
					placeholder="start"
					type={'number'}
					required
					value={start ?? ''}
					onChange={(event) => setStart(Number.parseInt(event.target.value))}
				></Input>
				<Input
					placeholder="length"
					type={'number'}
					required
					value={length ?? ''}
					onChange={(event) => setLength(Number.parseInt(event.target.value))}
				></Input>
				<Input
					placeholder="repeat"
					type={'number'}
					value={repeat ?? ''}
					onChange={(event) => setRepeat(Number.parseInt(event.target.value))}
				></Input>
				<Button type="submit">Submit</Button>
			</form>
		</>
	);
}

export default AddVideoPartPage;
