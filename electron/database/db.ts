import mongoose from 'mongoose';

const connectDB = async (uri: string) => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4 // Use IPv4, skip trying IPv6
        });
        console.log('MongoDB successfully connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

export default connectDB;
