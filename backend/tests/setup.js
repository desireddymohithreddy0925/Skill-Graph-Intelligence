const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let mongoServer;

// Set the environment variable for testing synchronously before any requires
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Start in-memory MongoDB Replica Set before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const baseUri = mongoServer.getUri();
  const mongoUri = baseUri.includes('?') ? baseUri + '&retryWrites=false' : baseUri + '?retryWrites=false';
  
  process.env.MONGO_URI = mongoUri;
  
  // If mongoose is somehow already connected, disconnect it first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri, { retryWrites: false });
});

// Clear all collections after each test to ensure test isolation
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Stop the in-memory server and disconnect mongoose after all tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
