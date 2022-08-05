import * as admin from "firebase-admin";
import ytdl from "ytdl-core";
import {deleteContentOfDir} from "./utils";
import {VideoGenerator, VideoPart} from "./videoGenerator";
import * as queue from "queue";

enum GeneratedVideoState {
    UNKNOWN = "unknown",
    GENERATING = "generating",
    GENERATED = "generated",
    ERROR = "error",
}

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "training-web-352414.appspot.com",
});

const firestore = admin.firestore();
const storage = admin.storage();

const videoPartsCollection = firestore.collection("VideoParts");
const youtubeVideoMetadataCollection = firestore.collection(
    "YoutubeVideoMetadata"
);
const generatedVideosCollection = firestore.collection("GeneratedVideos");

const videoGeneratorQueue = queue.default({autostart: true, concurrency: 1});

async function uploadVideoToStorage(filename: string) {
    await storage.bucket().upload(`temp/${filename}.mp4`);
    console.log("uploaded video to storage!");
}

async function main() {
    try {
        deleteContentOfDir("temp");
    } catch (error) {
    }

    generatedVideosCollection.onSnapshot(async (snapshot) => {
        const snapshotDocsAdded = snapshot
            .docChanges()
            .filter((d) => d.type === "added" || d.type === "modified")
            .map((d) => d.doc);

        snapshotDocsAdded.map(async (doc) => {
            if (
                !doc.data().state ||
                doc.data().state === GeneratedVideoState.UNKNOWN
            ) {
                videoGeneratorQueue.push(async () => {
                    if (
                        !doc.data().state ||
                        doc.data().state === GeneratedVideoState.UNKNOWN
                    ) {
                        try {
                            try {
                                deleteContentOfDir("temp");
                            } catch (error) {
                            }

                            await generatedVideosCollection
                                .doc(doc.id)
                                .update({state: GeneratedVideoState.GENERATING});

                            const videoPartIds: string[] = doc.data().videoPartIds;
                            const videoPartsData = await Promise.all(
                                videoPartIds.map(
                                    async (p) => await videoPartsCollection.doc(p).get()
                                )
                            );
                            const videoParts: VideoPart[] = videoPartsData.map((data) => ({
                                $id: data.id,
                                youtubeVideoId: data.data()!.youtubeVideoId,
                                start: data.data()!.start,
                                end: data.data()!.end,
                            }));

                            const filename = doc.id;
                            const currentVideoGenerator = new VideoGenerator(
                                videoParts,
                                filename
                            );

                            await currentVideoGenerator.generate();

                            await uploadVideoToStorage(filename);
                            generatedVideosCollection.doc(doc.id).update({
                                state: GeneratedVideoState.GENERATED,
                                storageId: `${filename}.mp4`,
                            });
                        } catch (error) {
                            console.log(`ERROR: with ${doc.id}`);
                            generatedVideosCollection.doc(doc.id).update({
                                state: GeneratedVideoState.ERROR,
                            });
                        }
                    }
                });
            }
        });
    });

    videoPartsCollection.onSnapshot(async (snapshot) => {
        const snapshotDocsAdded = snapshot
            .docChanges()
            .filter((d) => d.type === "added" || d.type === "modified")
            .map((d) => d.doc);

        await Promise.all(
            Array.from(
                new Set(
                    snapshotDocsAdded.map((videoPart) => videoPart.data()!.youtubeVideoId)
                )
            ).map(async (youtubeVideoId) => {
                const info = await ytdl.getBasicInfo(youtubeVideoId);
                const docData = {
                    title: info.videoDetails.title,
                    authorName: info.videoDetails.author.name,
                };

                const ref = youtubeVideoMetadataCollection.doc(youtubeVideoId);
                if (!(await ref.get()).exists) {
                    ref.set(docData);
                } else {
                    ref.update(docData);
                }
                console.log(`Add YoutubeMetadata for ${youtubeVideoId}`);
            })
        );
    });
}

main();
