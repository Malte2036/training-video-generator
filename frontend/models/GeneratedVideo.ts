import { QueryDocumentSnapshot } from 'firebase/firestore';
import { VideoPart, videoPartConverter } from './VideoPart';

export class GeneratedVideo {
	public $id: string;
	public videoPartIds: string[];

	constructor($id: string, videoParts: string[]) {
		this.$id = $id;
		this.videoPartIds = videoParts;
	}
}

// Firestore data converter
export const generatedVideoConverter = {
	toFirestore: (generatedVideo: GeneratedVideo) => {
		return {
			videoParts: generatedVideo.videoPartIds,
		};
	},
	fromFirestore: (snapshot: QueryDocumentSnapshot, options: any) => {
		const data = snapshot.data();
		return new GeneratedVideo(snapshot.id, data.videoPartIds);
	},
};
