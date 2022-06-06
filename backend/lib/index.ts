import * as admin from "firebase-admin";

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

const videoPartsCollection = firestore.collection("VideoParts");

async function main() {
  const docs = await videoPartsCollection.listDocuments();
  const videoParts = await Promise.all(docs.map((doc) => doc.get()));
  videoParts.forEach((v) => console.log(v.data()));
}

main();
