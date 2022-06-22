import Ffmpeg from "fluent-ffmpeg";
import { createWriteStream } from "fs";
import ytdl from "ytdl-core";

export type VideoPart = {
  $id: string;
  youtubeVideoId: string;
  start: number;
  end: number;
};

export class VideoGenerator {
  videoParts: VideoPart[];
  filename: string;
  constructor(videoParts: VideoPart[], filename: string) {
    this.videoParts = videoParts;
    this.filename = filename;
  }

  public async generate() {
    await this.downloadAllYoutubeVideos();
    await this.cutVideoParts();
    await this.addBeepSoundToVideoParts();
    await this.mergeVideoParts();
  }

  async downloadAllYoutubeVideos() {
    const allYoutubeVideoIds = Array.from(
      new Set(this.videoParts.map((videoPart) => videoPart.youtubeVideoId))
    );
    await Promise.all(
      allYoutubeVideoIds.map(async (youtubeVideoId) => {
        console.log(`start ${youtubeVideoId}`);
        await new Promise((resolve, reject) => {
          const stream = ytdl(
            `https://www.youtube.com/watch?v=${youtubeVideoId}`,
            {
              quality: "highestvideo",
            }
          ).pipe(createWriteStream(`temp/${youtubeVideoId}.avi`));

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
      this.videoParts.map(async (videoPart) => {
        await new Promise(async (resolve, reject) => {
          Ffmpeg()
            .addInput(`temp/${videoPart.youtubeVideoId}.avi`)
            .setStartTime(videoPart.start)
            .setDuration(videoPart.end - videoPart.start)
            .noAudio()
            .saveToFile(`temp/${videoPart.$id}_without_beep.avi`)
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
      this.videoParts.map(
        async (videoPart) =>
          await new Promise(async (resolve, reject) => {
            Ffmpeg()
              .addInput(`temp/${videoPart.$id}_without_beep.avi`)
              .addInput(`assets/BeepSoundEffect.mp4`)
              .saveToFile(`temp/${videoPart.$id}.avi`)
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
      console.log("mergeVideoParts")
    await new Promise(async (resolve, reject) => {
      const command = Ffmpeg();
      this.videoParts.forEach((videoPart) =>
        command.addInput(`temp/${videoPart.$id}.avi`)
      );

      command
        .mergeToFile(`temp/${this.filename}.mp4`)
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
