const neo4j = require("neo4j-driver");
const config = require("../../config");
let = initializedNeoConnection = () => {
    const driver = neo4j.driver(config.neo4j.uri, neo4j.auth.basic(config.neo4j.user, config.neo4j.password));
    return (neo4jsession = driver.session());
};
exports.createLinkedinProfileNode = async (id, nodeProperties) => {
    const neo4jsession = await initializedNeoConnection();
    const writeQuery = `MERGE (p1:LinkedinProfile { internal_id: $id })
  on match set p1+=$nodeProperties
  on create set p1+=$nodeProperties 
  RETURN p1`;
    await writeData([{ query: writeQuery, params: { id, nodeProperties } }]);
    await neo4jsession.close();
};
let createConnectRelationshipQueryObject = (id1, id2) => {
    const writeQuery = `MERGE (p1:LinkedinProfile{internal_id:$id1}) MERGE (p2:LinkedinProfile{internal_id:$id2}) MERGE (p1)-[:KNOWS]->(p2)  return p1,p2`;
    return { query: writeQuery, params: { id1, id2 } };
};
exports.createConnectRelationships = async (id, connections) => {
    const neo4jsession = await initializedNeoConnection();
    writeQueryArray = [];
    for (const friendId of connections) {
        writeQueryArray.push(createConnectRelationshipQueryObject(id, friendId));
    }
    await writeData(writeQueryArray);
    await neo4jsession.close();
};
//Writing with transaction  Reactive Session
//params: QueryArray - array of Query object
//queryObject  consist of query and params object
let writeData = async (queryObjectArray) => {
    try {
        await neo4jsession.writeTransaction(async (tx) => {
            for (const queryObject of queryObjectArray) {
                await tx.run(queryObject.query, queryObject.params);
            }
        });
    }
    catch (e) {
        console.log("error while writing to neo4j:" + error);
    }
};
//# sourceMappingURL=index.js.map