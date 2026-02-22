"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Setting = exports.Reminder = exports.Task = exports.Transaction = exports.FeeStructure = exports.Student = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StudentSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    grade: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    parentName: { type: String, required: true },
    parentContact: { type: String, required: true },
    address: { type: String },
    studentType: { type: String, enum: ['hosteler', 'day_scholar'], default: 'day_scholar' },
    usesTransport: { type: Boolean, default: false },
    transportDistance: { type: Number, default: 0 },
    paymentFrequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
exports.Student = mongoose_1.default.models.Student || mongoose_1.default.model('Student', StudentSchema);
const FeeStructureSchema = new mongoose_1.Schema({
    grade: { type: String, required: true, unique: true },
    admissionFee: { type: Number, default: 0 },
    formFee: { type: Number, default: 0 },
    additionalFee: { type: Number, default: 0 },
    monthlyFee: { type: Number, default: 0 },
    termFee: { type: Number, default: 0 },
    annualFee: { type: Number, default: 0 },
}, { timestamps: true });
exports.FeeStructure = mongoose_1.default.models.FeeStructure || mongoose_1.default.model('FeeStructure', FeeStructureSchema);
const TransactionSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    feeStructureId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'cheque'], required: true },
    referenceNumber: { type: String },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    remarks: { type: String },
    receiptNumber: { type: String, unique: true, required: true }
}, { timestamps: true });
// Auto-generate receipt number before validating
TransactionSchema.pre('validate', function (next) {
    if (!this.receiptNumber) {
        const dateStr = new Date().toISOString().replace(/[-:]/g, '').split('T')[0];
        const rand = Math.floor(1000 + Math.random() * 9000);
        this.receiptNumber = `REC-${dateStr}-${rand}`;
    }
    next();
});
exports.Transaction = mongoose_1.default.models.Transaction || mongoose_1.default.model('Transaction', TransactionSchema);
const TaskSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    color: { type: String, default: 'bg-primary' },
    assignedTo: { type: String }
}, { timestamps: true });
exports.Task = mongoose_1.default.models.Task || mongoose_1.default.model('Task', TaskSchema);
const ReminderSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    datetime: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
exports.Reminder = mongoose_1.default.models.Reminder || mongoose_1.default.model('Reminder', ReminderSchema);
const SettingSchema = new mongoose_1.Schema({
    schoolName: { type: String, default: "Daddy's International School" },
    contactEmail: { type: String, default: "admin@daddysinternational.edu" },
    academicYear: { type: String, default: "2023-2024" },
    currencySymbol: { type: String, default: "₹" },
    schoolAddress: { type: String, default: "123 Education Lane" },
}, { timestamps: true });
exports.Setting = mongoose_1.default.models.Setting || mongoose_1.default.model('Setting', SettingSchema);
//# sourceMappingURL=models.js.map