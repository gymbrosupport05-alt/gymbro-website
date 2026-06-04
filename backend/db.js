const mongoose = require('mongoose');

async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Missing MONGODB_URI env var');
    }

    // mongoose v8: useConnectionString options not needed
    await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB
    });

    console.log('MongoDB connected');
}

module.exports = { connectDB };

