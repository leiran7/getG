// import * as functions from "firebase-functions";
import * as fg from "fast-glob";

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
    .reduce((prev, curr) => ({ ...prev, [`${curr[0]}`]: curr[1] }), {});
};

console.log(generateFunctions());
export default generateFunctions();
