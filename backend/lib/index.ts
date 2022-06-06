import * as admin from "firebase-admin";
import Ffmpeg from "fluent-ffmpeg";
import { createWriteStream } from "fs";
import ytdl from "ytdl-core";
import { deleteContentOfDir } from "./utils";

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "training-web-352414.appspot.com",
});

const firestore = admin.firestore();
const storage = admin.storage();

const videoPartsCollection = firestore.collection("VideoParts");

async function downloadVideo(
  youtubeVideoId: string,
  filename: string,
  start: number,
  end: number
) {
  await new Promise((resolve, reject) => {
    const stream = ytdl(`https://www.youtube.com/watch?v=${youtubeVideoId}`, {
      begin: start,
      quality: "137",
    }).pipe(createWriteStream(filename));

    stream.on("finish", () => {
      console.log(`downloaded video ${youtubeVideoId}`);
      resolve(`downloaded video ${youtubeVideoId}`);
    });
  });
}

async function generateVideo(
  videoParts: admin.firestore.DocumentSnapshot[],
  filename: string
) {
  await Promise.all(
    videoParts.map(async (videoPart) => {
      await new Promise(async (resolve, reject) => {
        await downloadVideo(
          videoPart.data()!.youtubeVideoId,
          `temp/${videoPart.data()!.youtubeVideoId}.avi`,
          videoPart.data()!.start,
          videoPart.data()!.end
        );
        Ffmpeg()
          .addInput(`temp/${videoPart.data()!.youtubeVideoId}.avi`)
          .setStartTime(videoPart.data()!.start)
          .setDuration(videoPart.data()!.end - videoPart.data()!.start)
          .noAudio()
          .saveToFile(`temp/${videoPart.id}.avi`)
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

async function uploadVideoToStorage(filename: string) {
  await storage.bucket().upload(`temp/${filename}.mp4`);
  console.log("uploaded video to storage!");
}

async function main() {
  deleteContentOfDir("temp");

  const docs = await videoPartsCollection.listDocuments();
  const videoParts = await Promise.all(docs.map((doc) => doc.get()));
  videoParts.forEach((v) => console.log(v.data()));

  const filename = "generatedVideo";
  await generateVideo(videoParts, filename);
  await uploadVideoToStorage(filename);

  deleteContentOfDir("temp");
}

main();
