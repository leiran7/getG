const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.addEmployee = functions.https.onRequest(async (request, response) => {
    if(!request.body.profileURL || ! request.body.friends){
        response.status(400).end("profileURL and friends fields should be included in the data");
    }

    let docRef = admin.firestore().collection("persons").doc(body.profileURL);
    await docRef.set({
      ...request.body
    });

    response.status(200).end();
});
