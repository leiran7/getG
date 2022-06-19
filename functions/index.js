const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { initializedNeoConnection } = require("./models/neo4j");

admin.initializeApp();
const session = initializedNeoConnection();

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
    .collection("employees")
    .doc(request.body.profileURL);
  await docRef.set({
    ...request.body,
  });

  console.log("start writing to neo");
  await wrireDataToNeo4j("bb");
  console.log("finish writing to neo");
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

let wrireDataToNeo4j = async (name) => {
  const writeQuery = `CREATE (p1:Person { name: $name })
  RETURN p1`;

  // Write transactions allow the driver to handle retries and transient errors
  const writeResult = await session.writeTransaction((tx) =>
    tx.run(writeQuery, { name })
  );
  writeResult.records.forEach((record) => {
    const person1Node = record.get("p1");
    console.log(`Created node with name ${person1Node.properties.name}`);
  });

  await session.close();
};
