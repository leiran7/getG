"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helloWorld = (functions) => functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});
exports.default = helloWorld;
//# sourceMappingURL=hello.js.map