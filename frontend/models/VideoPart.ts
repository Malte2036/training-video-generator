import { QueryDocumentSnapshot } from 'firebase/firestore';

export class VideoPart {
	public $id: string;
	public youtubeVideoId: string;
	public start: number;
	public end: number;

	constructor($id: string, youtubeVideoId: string, start: number, end: number) {
		this.$id = $id;
		this.youtubeVideoId = youtubeVideoId;
		this.start = start;
		this.end = end;
	}
}

// Firestore data converter
export const videoPartConverter = {
	toFirestore: (videoPart: VideoPart) => {
		return {
			youtubeVideoId: videoPart.youtubeVideoId,
			start: videoPart.start,
			end: videoPart.end,
		};
	},
	fromFirestore: (snapshot: QueryDocumentSnapshot, options: any) => {
		const data = snapshot.data();
		return new VideoPart(
			snapshot.id,
			data.youtubeVideoId,
			data.start,
			data.end
		);
	},
};
