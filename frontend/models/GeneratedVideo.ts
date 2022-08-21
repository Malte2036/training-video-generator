import {QueryDocumentSnapshot, Timestamp} from 'firebase/firestore';
import {VideoPart, videoPartConverter} from './VideoPart';

export enum GeneratedVideoState {
    UNKNOWN = 'unknown',
    GENERATING = 'generating',
    GENERATED = 'generated',
}

export class GeneratedVideo {
    public $id: string;
    public videoPartIds: string[];
    public timestamp: Timestamp;

    public state?: GeneratedVideoState;
    public mergeVideoPartsPercent?: number
    public storageId?: string;

    public done: boolean;

    constructor(
        $id: string,
        videoPartIds: string[],
        timestamp: Timestamp,
        state?: GeneratedVideoState,
        mergeVideoPartsPercent?: number,
        storageId?: string,
        done?: boolean
    ) {
        this.$id = $id;
        this.videoPartIds = videoPartIds;
        this.state = state;
        this.timestamp = timestamp;
        this.mergeVideoPartsPercent = mergeVideoPartsPercent;
        this.storageId = storageId;

        this.done = done ?? false;
    }
}

// Firestore data converter
export const generatedVideoConverter = {
    toFirestore: (generatedVideo: GeneratedVideo) => {
        return {
            videoPartIds: generatedVideo.videoPartIds,
            timestamp: generatedVideo.timestamp,
            state: generatedVideo.state,
            mergeVideoPartsPercent: generatedVideo.mergeVideoPartsPercent,
            storageId: generatedVideo.storageId,
            done: generatedVideo.done
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: any) => {
        const data = snapshot.data();
        return new GeneratedVideo(
            snapshot.id,
            data.videoPartIds,
            data.timestamp,
            data.state,
            data.mergeVideoPartsPercent,
            data.storageId,
            data.done
        );
    },
};
