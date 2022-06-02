import { Models } from "appwrite";

export type VideoPart = {
    youtubeVideoId: string,
    start: number;
    end: number
} & Models.Document