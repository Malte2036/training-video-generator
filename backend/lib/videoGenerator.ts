import * as admin from "firebase-admin";
import Ffmpeg from "fluent-ffmpeg";
import { createWriteStream } from "fs";
import ytdl from "ytdl-core";

export async function downloadVideo(youtubeVideoId: string, filename: string) {
  await new Promise((resolve, reject) => {
    const stream = ytdl(`https://www.youtube.com/watch?v=${youtubeVideoId}`, {
      quality: "highestvideo",
    }).pipe(createWriteStream(filename));

    stream.on("finish", () => {
      console.log(`downloaded video ${youtubeVideoId}`);
      resolve(`downloaded video ${youtubeVideoId}`);
    });
  });
}

export async function generateVideo(
  videoParts: admin.firestore.DocumentSnapshot[],
  filename: string
) {
  await Promise.all(
    Array.from(
      new Set(videoParts.map((videoPart) => videoPart.data()!.youtubeVideoId))
    ).map(async (youtubeVideoId) => {
      console.log(`start download ${youtubeVideoId}`);
      await downloadVideo(youtubeVideoId, `temp/${youtubeVideoId}.avi`);
    })
  );

  await Promise.all(
    videoParts.map(async (videoPart) => {
      await new Promise(async (resolve, reject) => {
        const data = videoPart.data()!;
        Ffmpeg()
          .addInput(`temp/${data.youtubeVideoId}.avi`)
          .setStartTime(data.start)
          .setDuration(data.end - data.start)
          .noAudio()
          .saveToFile(`temp/${videoPart.id}_without_beep.avi`)
          .on("error", function (err) {
            console.log("An error occurred: " + err.message);
            reject("An error occurred: " + err.message);
          })
          .on("end", function () {
            console.log(`Cutting finished for ${videoPart.id} !`);
            resolve(`Cutting finished for ${videoPart.id} !`);
          });
      });
    })
  );

  await Promise.all(
    videoParts.map(
      async (videoPart) =>
        await new Promise(async (resolve, reject) => {
          Ffmpeg()
            .addInput(`temp/${videoPart.id}_without_beep.avi`)
            .addInput(`assets/BeepSoundEffect.mp4`)
            .saveToFile(`temp/${videoPart.id}.avi`)
            .on("error", function (err) {
              console.log("An error occurred: " + err.message);
              reject("An error occurred: " + err.message);
            })
            .on("end", function () {
              console.log(`added beep sound to ${videoPart.id} !`);
              resolve(`added beep sound to ${videoPart.id} !`);
            });
        })
    )
  );

  await new Promise(async (resolve, reject) => {
    const command = Ffmpeg();
    videoParts.forEach((videoPart) =>
      command.addInput(`temp/${videoPart.id}.avi`)
    );

    command
      .mergeToFile(`temp/${filename}.mp4`)
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
