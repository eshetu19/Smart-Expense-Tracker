
import mongoose from 'mongoose';
import config from './index.js';

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.db.uri, config.db.options);

    console.log(` Database connected: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('  Database connection failed');
    console.error(`   Reason: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log(' Mongoose: connected');
});

mongoose.connection.on('error', (err) => {
  console.error(` Mongoose error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn(' Mongoose: disconnected');
});

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log(' Database connection closed');
  } catch (error) {
    console.error(` Error closing Database: ${error.message}`);
    process.exit(1);
  }
};

export { connectDB, disconnectDB };
export default connectDB;