import * as functions from "firebase-functions";

exports.makeUppercase = functions.firestore
  .document("/VideoParts/{documentId}")
  .onCreate((snap, context) => {
    const youtubeVideoId = snap.data().youtubeVideoId;
    
    functions.logger.log(
      "Uppercasing",
      context.params.documentId,
      youtubeVideoId
    );

    const uppercase = youtubeVideoId.toUpperCase();
    
    return snap.ref.set({ youtubeVideoId: uppercase }, { merge: true });
  });
