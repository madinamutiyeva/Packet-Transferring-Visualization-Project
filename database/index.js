const { MongoClient, ServerApiVersion } = require('mongodb');
const config = require('../config/config');

const mongoURI = config.mongoURI;
const dbName = "algorithms_project";

const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


module.exports = {
  client,
  dbName
}