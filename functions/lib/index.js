const { onEmployeeDocumentCreated } = require("./services/firebase/triggers");
const { addEmployeeFunction } = require("./services/firebase/cloud-functions");
//cloud functions:
exports.addEmployeeFunction = addEmployeeFunction;
//triggers:
exports.onDocumentCreated = onEmployeeDocumentCreated;
//# sourceMappingURL=index.js.map