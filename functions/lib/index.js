"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as functions from "firebase-functions";
const fg = __importStar(require("fast-glob"));
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });
const generateFunctions = () => {
    const entries = fg.sync("lambdas/**/*.ts", { dot: false });
    return entries
        .map((path) => {
        return [
            path.replace("/", "_").replace("lambdas_", ""),
            Object.values(require("./" + path))[0],
        ];
    })
        .reduce((prev, curr) => (Object.assign(Object.assign({}, prev), { [`${curr[0]}`]: curr[1] })), {});
};
console.log(generateFunctions());
exports.default = generateFunctions();
//# sourceMappingURL=index.js.map