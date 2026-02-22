import mongoose, { Document } from 'mongoose';
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
export declare const Student: mongoose.Model<any, {}, {}, {}, any, any, any>;
export interface IFeeStructure extends Document {
    grade: string;
    admissionFee: number;
    formFee: number;
    additionalFee: number;
    monthlyFee: number;
    termFee: number;
    annualFee: number;
}
export declare const FeeStructure: mongoose.Model<any, {}, {}, {}, any, any, any>;
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
export declare const Transaction: mongoose.Model<any, {}, {}, {}, any, any, any>;
export interface ITask extends Document {
    title: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
    color: string;
    assignedTo?: string;
}
export declare const Task: mongoose.Model<any, {}, {}, {}, any, any, any>;
export interface IReminder extends Document {
    title: string;
    description?: string;
    datetime: Date;
    isActive: boolean;
}
export declare const Reminder: mongoose.Model<any, {}, {}, {}, any, any, any>;
export interface ISetting extends Document {
    schoolName: string;
    contactEmail: string;
    academicYear: string;
    currencySymbol: string;
    schoolAddress: string;
}
export declare const Setting: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=models.d.ts.map