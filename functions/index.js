const { onEmployeeDocumentCreated } = require("./models/firebase/triggers");
const { addEmployeeFunction } = require("./models/firebase/cloud-functions");
const { initializedNeoConnection } = require("./models/neo4j");

//initialization
initializedNeoConnection();

//cloud functions:
exports.addEmployeeFunction = addEmployeeFunction;

//triggers:
exports.onDocumentCreated = onEmployeeDocumentCreated;
