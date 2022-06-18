const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.addEmployee = functions.https.onRequest(async (request, response) => {
  if (
    !request.body.hasOwnProperty("profileURL") ||
    !request.body.hasOwnProperty("friends")
  ) {
    response
      .status(400)
      .end("profileURL and friends fields should be included in the data");
  }

  let docRef = admin.firestore().collection("employees").doc(body.profileURL);
  await docRef.set({
    ...request.body,
  });

  response.status(200).end();
});

exports.addEmployees = functions.https.onRequest(async (request, response) => {
  let employeesColRef = admin.firestore().collection("employees");
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
