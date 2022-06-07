import { QueryDocumentSnapshot } from 'firebase/firestore';
import { VideoPart, videoPartConverter } from './VideoPart';

export enum GeneratedVideoState {
	UNKNOWN = 'unknown',
	GENERATING = 'generating',
	GENERATED = 'generated',
}

export class GeneratedVideo {
	public $id: string;
	public videoPartIds: string[];
	public state?: GeneratedVideoState;
	public storageId?: string;

	constructor(
		$id: string,
		videoPartIds: string[],
		state?: GeneratedVideoState,
		storageId?: string
	) {
		this.$id = $id;
		this.videoPartIds = videoPartIds;
		this.state = state;
		this.storageId = storageId;
	}
}

// Firestore data converter
export const generatedVideoConverter = {
	toFirestore: (generatedVideo: GeneratedVideo) => {
		return {
			videoParts: generatedVideo.videoPartIds,
			state: generatedVideo.state,
			storageId: generatedVideo.storageId,
		};
	},
	fromFirestore: (snapshot: QueryDocumentSnapshot, options: any) => {
		const data = snapshot.data();
		return new GeneratedVideo(
			snapshot.id,
			data.videoPartIds,
			data.state,
			data.storageId
		);
	},
};
