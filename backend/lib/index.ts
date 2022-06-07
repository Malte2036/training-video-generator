import * as admin from "firebase-admin";
import Ffmpeg from "fluent-ffmpeg";
import { createWriteStream } from "fs";
import ytdl from "ytdl-core";
import { deleteContentOfDir } from "./utils";

enum GeneratedVideoState {
  UNKNOWN = "unknown",
  GENERATING = "generating",
  GENERATED = "generated",
}

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "training-web-352414.appspot.com",
});

const firestore = admin.firestore();
const storage = admin.storage();

const videoPartsCollection = firestore.collection("VideoParts");
const gneratedVideosCollection = firestore.collection("GeneratedVideos");

async function downloadVideo(youtubeVideoId: string, filename: string) {
  await new Promise((resolve, reject) => {
    const stream = ytdl(`https://www.youtube.com/watch?v=${youtubeVideoId}`, {
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

  gneratedVideosCollection.onSnapshot(async (snapshot) => {
    const snapshotDocsAdded = snapshot
      .docChanges()
      .filter((d) => d.type === "added" || d.type === "modified")
      .map((d) => d.doc);

    await Promise.all(
      snapshotDocsAdded.map(async (doc) => {
        if (
          !doc.data().state ||
          doc.data().state === GeneratedVideoState.UNKNOWN
        ) {
          gneratedVideosCollection
            .doc(doc.id)
            .update({ state: GeneratedVideoState.GENERATING });
          const videoPartIds: string[] = doc.data().videoPartIds;
          const videoParts = await Promise.all(
            videoPartIds.map(
              async (p) => await videoPartsCollection.doc(p).get()
            )
          );
          videoParts.forEach((p) => console.log(p.data()));

          const filename = doc.id;
          await generateVideo(videoParts, filename);
          await uploadVideoToStorage(filename);
          gneratedVideosCollection.doc(doc.id).update({
            state: GeneratedVideoState.GENERATED,
            storageId: `${filename}.mp4`,
          });
        }
      })
    );
  });

  deleteContentOfDir("temp");
}

main();
