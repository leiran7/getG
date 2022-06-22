const { firebaseDB, functions } = require("../firebase");
exports.addEmployeeFunction = functions.https.onRequest(async (request, response) => {
    if (!request.body.hasOwnProperty("profileURL") ||
        !request.body.hasOwnProperty("friends")) {
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
//# sourceMappingURL=cloud-functions.js.map