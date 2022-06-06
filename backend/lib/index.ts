import * as admin from "firebase-admin";
import { createWriteStream } from "fs";
import ytdl from "ytdl-core";
import { deleteContentOfDir } from "./utils";

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

const videoPartsCollection = firestore.collection("VideoParts");

async function downloadVideo(
  youtubeVideoId: string,
  filename: string,
  start: number,
  end: number
) {
  await new Promise((resolve, reject) => {
    const stream = ytdl(`https://www.youtube.com/watch?v=${youtubeVideoId}`, {
      //range: { start: secondToByte(start), end: secondToByte(end) },
      begin: start,
      quality: "136",
    }).pipe(createWriteStream(filename));

    stream.on("finish", () => {
      console.log("downloaded video");
      resolve("downloaded video");
    });
  });
}

async function main() {
  deleteContentOfDir("temp");

  const docs = await videoPartsCollection.listDocuments();
  const videoParts = await Promise.all(docs.map((doc) => doc.get()));
  videoParts.forEach((v) => console.log(v.data()));

  const videoPart = videoParts[0].data();
  await downloadVideo(videoPart!.youtubeVideoId, `temp/${videoPart!.youtubeVideoId}.mp4`, videoPart!.start, videoPart!.end);
}

main();
