"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDocumentCreatedFn = exports.addEmployeeFunctionFn = void 0;
const { onEmployeeDocumentCreated } = require("../services/firebase/triggers");
const { addEmployeeFunction } = require("../services/firebase/cloud-functions");
const { initializedNeoConnection } = require("../services/neo4j");
// //initialization
initializedNeoConnection();
// //cloud functions:
exports.addEmployeeFunctionFn = addEmployeeFunction;
// //triggers:
exports.onDocumentCreatedFn = onEmployeeDocumentCreated;
//# sourceMappingURL=index.js.map