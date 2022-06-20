const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();
exports.functions = functions;
exports.firebaseDB = admin.firestore();
