import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/daddys';

const StudentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    grade: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    parentName: { type: String, required: true },
    parentContact: { type: String, required: true },
    address: { type: String },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    color: { type: String, default: 'bg-primary' },
    assignedTo: { type: String }
}, { timestamps: true });
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

const ReminderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    datetime: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);

const FeeStructureSchema = new mongoose.Schema({
    grade: { type: String, required: true, unique: true },
    admissionFee: { type: Number, default: 0 },
    formFee: { type: Number, default: 0 },
    additionalFee: { type: Number, default: 0 },
    monthlyFee: { type: Number, default: 0 },
    termFee: { type: Number, default: 0 },
    annualFee: { type: Number, default: 0 },
}, { timestamps: true });
const FeeStructure = mongoose.models.FeeStructure || mongoose.model('FeeStructure', FeeStructureSchema);


async function seed() {
    try {
        await mongoose.connect(dbUri);
        console.log('Connected to DB:', dbUri);

        await Student.deleteMany({});
        await FeeStructure.deleteMany({});
        await Task.deleteMany({});
        await Reminder.deleteMany({});

        console.log('Cleared existing data.');

        const fees = await FeeStructure.insertMany([
            { grade: 'PC to UKG', admissionFee: 2200, formFee: 500, additionalFee: 550, monthlyFee: 1450, termFee: 1300, annualFee: 1550 },
            { grade: '1 to 3', admissionFee: 2750, formFee: 500, additionalFee: 550, monthlyFee: 1950, termFee: 1550, annualFee: 1750 },
            { grade: '4 to 5', admissionFee: 3100, formFee: 500, additionalFee: 550, monthlyFee: 2200, termFee: 1750, annualFee: 2000 },
            { grade: '6 to 8', admissionFee: 3300, formFee: 500, additionalFee: 550, monthlyFee: 2500, termFee: 2000, annualFee: 2200 },
            { grade: '9 to 10', admissionFee: 3850, formFee: 500, additionalFee: 550, monthlyFee: 2750, termFee: 2200, annualFee: 2400 },
            { grade: '11 to 12', admissionFee: 4400, formFee: 500, additionalFee: 550, monthlyFee: 3450, termFee: 2450, annualFee: 2650 }
        ]);
        console.log(`Seeded ${fees.length} fees.`);

        const tasks = await Task.insertMany([
            { title: 'Update fee structure for Term 2', dueDate: new Date(Date.now() + 86400000 * 2), status: 'pending', color: 'bg-orange-500' },
            { title: 'Send fee reminders to parents', dueDate: new Date(Date.now() + 86400000 * 3), status: 'pending', color: 'bg-blue-500' },
            { title: 'Review discount applications', dueDate: new Date(Date.now() + 86400000 * 5), status: 'pending', color: 'bg-green-500' }
        ]);
        console.log(`Seeded ${tasks.length} tasks.`);

        const reminders = await Reminder.insertMany([
            { title: 'Parent-Teacher Meeting', description: 'Grade 10 PTM', datetime: new Date(Date.now() + 86400000 * 4) },
            { title: 'Annual Sports Day', description: 'Main ground', datetime: new Date(Date.now() + 86400000 * 10) },
            { title: 'Science Fair', description: 'School auditorium', datetime: new Date(Date.now() + 86400000 * 14) }
        ]);
        console.log(`Seeded ${reminders.length} reminders (events).`);

        mongoose.connection.close();
        console.log('Finished seeding.');
    } catch (err) {
        console.error('Error seeding DB:', err);
        process.exit(1);
    }
}

seed();
