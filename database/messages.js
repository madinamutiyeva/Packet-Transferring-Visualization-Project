const { client, dbName } = require('./index');

const collectionName = 'messages'; // Название коллекции, где будут храниться сообщения чата

const db = client.db(dbName);

async function saveChatMessage(messageData) {
    try {
        const result = await db.collection(collectionName).insertOne(messageData);
        console.log('Chat message inserted:', result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error('Error inserting chat message:', error);
        throw error;
    }
}

async function getChatMessages() {
    try {
        const cursor = db.collection(collectionName).find();
        const chatMessages = await cursor.toArray();
        //console.log(chatMessages);
        // Преобразовываем каждое сообщение
        // const processedMessages = chatMessages.map(message => {
        //     // Создаем новый объект для сообщения без прототипа
        //     const processedMessage = { ...message };

        //     // Удаляем поле _id
        //     delete processedMessage._id;
        //     // Возвращаем обработанное сообщение
        //     return processedMessage;
        // });

        return processedMessages;
    } catch (error) {
        console.error('Error retrieving chat messages:', error);
        throw error;
    }
}





module.exports = {
    saveChatMessage,
    getChatMessages
};

