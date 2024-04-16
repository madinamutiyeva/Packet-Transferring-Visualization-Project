const { client, dbName } = require('./index')

const collectionName = 'graphData';

const db = client.db(dbName);

async function saveGraphData(graphData) {
    try {
        const result = await db.collection(collectionName).insertOne(graphData);
        console.log('Graph data inserted:', result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error('Error inserting graph data:', error);
        throw error;
    }
}

async function getGraphData() {
    try {
        const cursor = db.collection(collectionName).find();
        const graphData = await cursor.toArray();
        return graphData;
    } catch (error) {
        console.error('Error retrieving graph data:', error);
        throw error;
    }
}

module.exports = {
    saveGraphData,
    getGraphData
};