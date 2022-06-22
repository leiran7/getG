const { onEmployeeDocumentCreated } = require("../services/firebase/triggers");
const { addEmployeeFunction } = require("../services/firebase/cloud-functions");
const { initializedNeoConnection } = require("../services/neo4j");

// //initialization
initializedNeoConnection();

// //cloud functions:
export const addEmployeeFunctionFn = addEmployeeFunction;

// //triggers:
export const onDocumentCreatedFn = onEmployeeDocumentCreated;
