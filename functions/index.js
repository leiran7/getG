const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {
  initializedNeoConnection,
  createLinkedinProfileNode,
  createConnectRelationship,
} = require("./models/neo4j");

admin.initializeApp();
initializedNeoConnection();
let firebaseDB = admin.firestore();

exports.addEmployee = functions.https.onRequest(async (request, response) => {
  if (
    !request.body.hasOwnProperty("profileURL") ||
    !request.body.hasOwnProperty("friends")
  ) {
    response
      .status(400)
      .end("profileURL and friends fields should be included in the data");
  }

  let batch = firebaseDB.batch();
  let employeeDocRef = firebaseDB.collection("jops-employeeData").doc();
  let employeeDocData = {
    url: request.body.profileURL,
    connections: [],
  };

  request.body.friends.forEach((friendURL) => {
    let docRef = firebaseDB.collection("jops-employeeData").doc();
    batch.set(docRef, {
      url: friendURL,
      connections: [employeeDocRef.id],
    });

    employeeDocData.connections.push(docRef.id);
  });

  batch.set(employeeDocRef, employeeDocData);
  await batch.commit();
  response.status(200).end();
});

exports.onDocumentCreated = functions.firestore
  .document("jops-employeeData/{docId}")
  .onCreate(async (snap, context) => {
    let docData = snap.data();
    let docId = context.params.docId;
    //scrape the fucking data
    //send to neo4j
    await createLinkedinProfileNode(docId);
    for (const friendId of docData.connections) {
      await createConnectRelationship(docId, friendId);
    }

    //move the doc to completed jobs collections (delete and move)
    await moveDocToCompletedJopsCollection(docId, docData);
  });

let moveDocToCompletedJopsCollection = async (docId, docData) => {
  let batch = firebaseDB.batch();
  let newDocRef = firebaseDB.collection("completed-jops").doc(docId);
  batch.set(newDocRef, docData);
  let oldDocRef = firebaseDB.collection("jops-employeeData").doc(docId);
  batch.delete(oldDocRef);
  await batch.commit();
};
