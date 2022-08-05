import Ffmpeg from "fluent-ffmpeg";
import {createWriteStream, existsSync} from "fs";
import ytdl from "ytdl-core";

export type VideoPart = {
    $id: string;
    youtubeVideoId: string;
    start: number;
    end: number;
};

const FPS = 30;
const videoPartFilesPath = "files/videoParts/"
const youtubeVideoFilesPath = "files/youtubeVideos/"
export const tempFilesPath = "files/temp/"

export class VideoGenerator {
    videoParts: VideoPart[];
    videoPartsNotAlreadyDownloaded: VideoPart[];
    filename: string;

    constructor(videoParts: VideoPart[], filename: string) {
        this.videoParts = videoParts;
        this.filename = filename;
        this.videoPartsNotAlreadyDownloaded = this.getAllNotDownloadedVideoParts()
    }

    public async generate() {
        console.log(this.videoPartsNotAlreadyDownloaded.map(value => value))

        await this.downloadAllYoutubeVideos();
        await this.cutVideoParts();
        await this.addBeepSoundToVideoParts();
        await this.mergeVideoParts();
    }

    getAllNotDownloadedVideoParts(): VideoPart[] {
        return this.videoParts.filter((videoPart => !existsSync(`${videoPartFilesPath}/${videoPart.$id}.avi`)))
    }

    getAllNotDownloadedYoutubeVideos(): string[] {
        const allYoutubeVideoIds = Array.from(
            new Set(this.videoPartsNotAlreadyDownloaded.map((videoPart) => videoPart.youtubeVideoId))
        );
        return allYoutubeVideoIds.filter((youtubeVideoId => !existsSync(`${youtubeVideoFilesPath}/${youtubeVideoId}.avi`)))
    }

    async downloadAllYoutubeVideos() {
        await Promise.all(
            this.getAllNotDownloadedYoutubeVideos().map(async (youtubeVideoId) => {
                console.log(`start ${youtubeVideoId}`);
                await new Promise((resolve, reject) => {
                    const stream = ytdl(
                        `https://www.youtube.com/watch?v=${youtubeVideoId}`,
                        {
                            quality: "136",
                        }
                    ).pipe(createWriteStream(`${youtubeVideoFilesPath}/${youtubeVideoId}.avi`));

                    stream.on("finish", () => {
                        console.log(`downloaded video ${youtubeVideoId}`);
                        resolve(`downloaded video ${youtubeVideoId}`);
                    });
                });
            })
        );
    }

    async cutVideoParts() {
        await Promise.all(
            this.videoPartsNotAlreadyDownloaded.map(async (videoPart) => {
                await new Promise(async (resolve, reject) => {
                    Ffmpeg()
                        .addInput(`${youtubeVideoFilesPath}${videoPart.youtubeVideoId}.avi`)
                        .setStartTime(videoPart.start)
                        .setDuration(videoPart.end - videoPart.start)
                        .noAudio()
                        .fps(FPS)
                        .saveToFile(`${tempFilesPath}${videoPart.$id}_without_beep.avi`)
                        .on("error", function (err) {
                            console.log("An error occurred: " + err.message);
                            reject("An error occurred: " + err.message);
                        })
                        .on("end", function () {
                            console.log(`Cutting finished for ${videoPart.$id} !`);
                            resolve(`Cutting finished for ${videoPart.$id} !`);
                        });
                });
            })
        );
    }

    async addBeepSoundToVideoParts() {
        await Promise.all(
            this.videoPartsNotAlreadyDownloaded.map(
                async (videoPart) =>
                    await new Promise(async (resolve, reject) => {
                        Ffmpeg()
                            .addInput(`${tempFilesPath}${videoPart.$id}_without_beep.avi`)
                            .addInput(`assets/BeepSoundEffect.mp4`)
                            .fps(FPS)
                            .saveToFile(`${videoPartFilesPath}/${videoPart.$id}.avi`)
                            .on("error", function (err) {
                                console.log("An error occurred: " + err.message);
                                reject("An error occurred: " + err.message);
                            })
                            .on("end", function () {
                                console.log(`added beep sound to ${videoPart.$id} !`);
                                resolve(`added beep sound to ${videoPart.$id} !`);
                            });
                    })
            )
        );
    }

    async mergeVideoParts() {
        console.log("mergeVideoParts");
        await new Promise(async (resolve, reject) => {
            const command = Ffmpeg();
            this.videoParts.forEach((videoPart) =>
                command.addInput(`${videoPartFilesPath}/${videoPart.$id}.avi`)
            );

            command
                .fps(FPS)
                .mergeToFile(`${tempFilesPath}${this.filename}.mp4`)
                .on("error", function (err) {
                    console.log("An error occurred: " + err.message);
                    reject("An error occurred: " + err.message);
                })
                .on("end", function () {
                    console.log(`merged video!!`);
                    resolve(`merged video!!`);
                });
        });
    }
}
