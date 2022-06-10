import { QueryDocumentSnapshot } from 'firebase/firestore';

export class YoutubeVideoMetadata {
	public $id: string;
	public authorName: string;
	public title: string;

	constructor($id: string, authorName: string, title: string) {
		this.$id = $id;
		this.authorName = authorName;
		this.title = title;
	}
}

// Firestore data converter
export const youtubeVideoMetadataConverter = {
	toFirestore: (youtubeVideoMetadata: YoutubeVideoMetadata) => {
		return {
			authorName: youtubeVideoMetadata.authorName,
			title: youtubeVideoMetadata.title,
		};
	},
	fromFirestore: (snapshot: QueryDocumentSnapshot, options: any) => {
		const data = snapshot.data();
		return new YoutubeVideoMetadata(snapshot.id, data.authorName, data.title);
	},
};
