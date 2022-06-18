const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.addCompany = functions.https.onRequest(async (request, response) => {
  console.log("company added successfully");
  switch (request.get("content-type")) {
    case "application/json":
      console.log(request.body);
      break;
  }

  let docRef = admin.firestore().collection("companies").doc("aa");
  await docRef.set({
    aa: 5,
  });

  response.end();
});

exports.addEmployee = functions.https.onRequest((request, response) => {
  console.log("employee added successfully");
  response.end();
});
