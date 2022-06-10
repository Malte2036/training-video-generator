import { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { VideoPart, videoPartConverter } from './VideoPart';

export enum GeneratedVideoState {
	UNKNOWN = 'unknown',
	GENERATING = 'generating',
	GENERATED = 'generated',
}

export class GeneratedVideo {
	public $id: string;
	public videoPartIds: string[];
	public timestamp?: Timestamp;
	public state?: GeneratedVideoState;
	public storageId?: string;

	constructor(
		$id: string,
		videoPartIds: string[],
		timestamp?: Timestamp,
		state?: GeneratedVideoState,
		storageId?: string
	) {
		this.$id = $id;
		this.videoPartIds = videoPartIds;
		this.state = state;
		this.timestamp = timestamp;
		this.storageId = storageId;
	}
}

// Firestore data converter
export const generatedVideoConverter = {
	toFirestore: (generatedVideo: GeneratedVideo) => {
		return {
			videoPartIds: generatedVideo.videoPartIds,
			timestamp: generatedVideo.timestamp,
			state: generatedVideo.state,
			storageId: generatedVideo.storageId,
		};
	},
	fromFirestore: (snapshot: QueryDocumentSnapshot, options: any) => {
		const data = snapshot.data();
		return new GeneratedVideo(
			snapshot.id,
			data.videoPartIds,
			data.timestamp,
			data.state,
			data.storageId
		);
	},
};
