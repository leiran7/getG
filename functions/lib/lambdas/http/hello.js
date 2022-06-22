const { onEmployeeDocumentCreated } = require("./services/firebase/triggers");
const { addEmployeeFunction } = require("./services/firebase/cloud-functions");
const { initializedNeoConnection } = require("./services/neo4j");
//initialization
initializedNeoConnection();
//cloud functions:
exports.addEmployeeFunction = addEmployeeFunction;
//triggers:
exports.onDocumentCreated = onEmployeeDocumentCreated;
//# sourceMappingURL=hello.js.map