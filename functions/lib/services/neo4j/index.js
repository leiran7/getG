const neo4j = require("neo4j-driver");
const config = require("../../config");
let neo4jsession;
exports.initializedNeoConnection = () => {
    const driver = neo4j.driver(config.neo4j.uri, neo4j.auth.basic(config.neo4j.user, config.neo4j.password));
    neo4jsession = driver.session();
};
exports.createLinkedinProfileNode = async (id, additionalData) => {
    const writeQuery = `MERGE (p1:LinkedinProfile { internal_id: $id })
      RETURN p1`;
    await writeData(writeQuery, { id });
    //await neo4jsession.close();
};
exports.createConnectRelationship = async (id1, id2) => {
    const writeQuery = `MERGE (p1:LinkedinProfile{internal_id:$id1}) MERGE (p2:LinkedinProfile{internal_id:$id2}) MERGE (p1)-[:KNOWS]->(p2)  return p1,p2`;
    await writeData(writeQuery, { id1, id2 });
    //await neo4jsession.close();
};
let writeData = async (writeQuery, data) => {
    // Write transactions allow the driver to handle retries and transient errors
    return await neo4jsession.writeTransaction((tx) => tx.run(writeQuery, Object.assign({}, data)));
};
//# sourceMappingURL=index.js.map