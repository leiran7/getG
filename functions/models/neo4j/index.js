const neo4j = require("neo4j-driver");
const config = require("../../config");

exports.initializedNeoConnection = () => {
  const driver = neo4j.driver(
    config.neo4j.uri,
    neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
  );
  return driver.session();
};
