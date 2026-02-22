import mongoose, { Schema, Document } from 'mongoose';

// --- Student Model ---
export interface IStudent extends Document {
    firstName: string;
    lastName: string;
    grade: string;
    rollNumber: string;
    parentName: string;
    parentContact: string;
    address: string;
    studentType: 'hosteler' | 'day_scholar';
    usesTransport: boolean;
    transportDistance: number;
    paymentFrequency?: 'monthly' | 'quarterly' | 'yearly';
    enrollmentDate: Date;
    status: 'active' | 'inactive';
}

const StudentSchema: Schema = new Schema({
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

export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);


// --- Fee Structure Model ---
export interface IFeeStructure extends Document {
    grade: string;
    admissionFee: number;
    formFee: number;
    additionalFee: number;
    monthlyFee: number;
    termFee: number;
    annualFee: number;
}

const FeeStructureSchema: Schema = new Schema({
    grade: { type: String, required: true, unique: true },
    admissionFee: { type: Number, default: 0 },
    formFee: { type: Number, default: 0 },
    additionalFee: { type: Number, default: 0 },
    monthlyFee: { type: Number, default: 0 },
    termFee: { type: Number, default: 0 },
    annualFee: { type: Number, default: 0 },
}, { timestamps: true });

export const FeeStructure = mongoose.models.FeeStructure || mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema);


// --- Transaction Model ---
export interface ITransaction extends Document {
    studentId: mongoose.Types.ObjectId;
    feeStructureId: mongoose.Types.ObjectId;
    amountPaid: number;
    paymentDate: Date;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque';
    referenceNumber?: string;
    status: 'completed' | 'pending' | 'failed';
    remarks?: string;
    receiptNumber: string;
}

const TransactionSchema: Schema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    feeStructureId: { type: Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'cheque'], required: true },
    referenceNumber: { type: String },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    remarks: { type: String },
    receiptNumber: { type: String, unique: true, required: true }
}, { timestamps: true });

// Auto-generate receipt number before validating
TransactionSchema.pre('validate', function (this: ITransaction, next: any) {
    if (!this.receiptNumber) {
        const dateStr = new Date().toISOString().replace(/[-:]/g, '').split('T')[0];
        const rand = Math.floor(1000 + Math.random() * 9000);
        this.receiptNumber = `REC-${dateStr}-${rand}`;
    }
    next();
});

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

// --- Task Model ---
export interface ITask extends Document {
    title: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
    color: string;
    assignedTo?: string;
}

const TaskSchema: Schema = new Schema({
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    color: { type: String, default: 'bg-primary' },
    assignedTo: { type: String }
}, { timestamps: true });

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

// --- Reminder Model ---
export interface IReminder extends Document {
    title: string;
    description?: string;
    datetime: Date;
    isActive: boolean;
}

const ReminderSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    datetime: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Reminder = mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', ReminderSchema);

// --- Settings Model ---
export interface ISetting extends Document {
    schoolName: string;
    contactEmail: string;
    academicYear: string;
    currencySymbol: string;
    schoolAddress: string;
}

const SettingSchema: Schema = new Schema({
    schoolName: { type: String, default: "Daddy's International School" },
    contactEmail: { type: String, default: "admin@daddysinternational.edu" },
    academicYear: { type: String, default: "2023-2024" },
    currencySymbol: { type: String, default: "₹" },
    schoolAddress: { type: String, default: "123 Education Lane" },
}, { timestamps: true });

export const Setting = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
