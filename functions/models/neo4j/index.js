const neo4j = require("neo4j-driver");
const config = require("../../config");

let neo4jsession;

exports.initializedNeoConnection = () => {
  const driver = neo4j.driver(
    config.neo4j.uri,
    neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
  );

  neo4jsession = driver.session();
};

exports.wrireDataToNeo4j = async (name) => {
  const writeQuery = `CREATE (p1:Person { name: $name })
      RETURN p1`;

  let writeResult = await writeData(writeQuery, { name });
  writeResult.records.forEach((record) => {
    const person1Node = record.get("p1");
    console.log(`Created node with name ${person1Node.properties.name}`);
  });

  //await neo4jsession.close();
};

let writeData = async (writeQuery, data) => {
  // Write transactions allow the driver to handle retries and transient errors
  return await neo4jsession.writeTransaction((tx) =>
    tx.run(writeQuery, { ...data })
  );
};
