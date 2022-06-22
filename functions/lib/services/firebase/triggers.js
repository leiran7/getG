const { firebaseDB, functions } = require("../firebase");
const { createLinkedinProfileNode, createConnectRelationship, } = require("../neo4j");
exports.onEmployeeDocumentCreated = functions.firestore
    .document("jops-employeeData/{docId}")
    .onCreate(async (snap, context) => {
    let docData = snap.data();
    let docId = context.params.docId;
    //scrape the fucking data
    //build graph in neo4j
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
//# sourceMappingURL=triggers.js.map