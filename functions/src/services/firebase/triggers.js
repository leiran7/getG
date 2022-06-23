const { firebaseDB, functions } = require("../firebase");
const {
  createLinkedinProfileNode,
  createConnectRelationships,
} = require("../neo4j");
const { scraper } = require("../puppeteer/linkedin-profile-scraper/src/examples/module");

exports.onEmployeeDocumentCreated = functions.firestore
  .document("jops-employeeData/{docId}")
  .onCreate(async (snap, context) => {
    let docData = snap.data();
    let docId = context.params.docId;
    //scrape the fucking data
    let profileProprties = await scraper(docData.profileURL)
    console.log({ profileProprties })
    //build graph in neo4j
    await createLinkedinProfileNode(docId, profileProprties);
    await createConnectRelationships(docId, docData.connections);
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
