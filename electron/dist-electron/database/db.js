"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async (uri) => {
    if (mongoose_1.default.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4 // Use IPv4, skip trying IPv6
        });
        console.log('MongoDB successfully connected');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map