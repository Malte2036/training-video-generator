import { Models } from 'appwrite';

export type VideoPart = {
	storageId?: string;
	youtubeVideoId: string;
	start: number;
	end: number;
} & Models.Document;
