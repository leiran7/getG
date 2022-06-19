const functions = require("firebase-functions");
const admin = require("firebase-admin");

const {
  initializedNeoConnection,
  wrireDataToNeo4j,
} = require("./models/neo4j");

admin.initializeApp();
initializedNeoConnection();

exports.addEmployee = functions.https.onRequest(async (request, response) => {
  if (
    !request.body.hasOwnProperty("profileURL") ||
    !request.body.hasOwnProperty("friends")
  ) {
    response
      .status(400)
      .end("profileURL and friends fields should be included in the data");
  }

  let docRef = admin
    .firestore()
    .collection("jops-employeeData")
    .doc(request.body.profileURL);
  await docRef.set({
    ...request.body,
  });

  response.status(200).end();
});

exports.addEmployees = functions.https.onRequest(async (request, response) => {
  let employeesColRef = admin.firestore().collection("jops-employeeData");
  if (!request.body.hasOwnProperty("employeesList")) {
    response
      .status(400)
      .end(
        "employeesList of type array fields should be included in the data "
      );
  }

  for (const employee of request.body.employeesList) {
    await employeesColRef.doc(employee.profileURL).set({
      ...employee,
    });
  }

  response.status(200).end();
});

exports.onDocumentCreated = functions.firestore
  .document("jops-employeeData/{docId}")
  .onCreate((snap, context) => {
    const newValue = snap.data();
    let docId = context.params.docId;
    //send to neo4j
    //move the doc to completed jops (delete and move)
  });
