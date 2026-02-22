import { ipcMain } from 'electron';
import { Student, FeeStructure, Transaction, Task, Reminder, Setting } from './models';

// --- Student Handlers ---
ipcMain.handle('get-students', async () => {
    try {
        const students = await Student.find().sort({ createdAt: -1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(students)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('add-student', async (_, studentData) => {
    try {
        const newStudent = new Student(studentData);
        await newStudent.save();
        return { success: true, data: JSON.parse(JSON.stringify(newStudent.toObject())) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-student', async (_, { id, data }) => {
    try {
        const updated = await Student.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-student', async (_, id) => {
    try {
        await Student.findByIdAndDelete(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});


// --- Fee Structure Handlers ---
ipcMain.handle('get-fees', async () => {
    try {
        const fees = await FeeStructure.find().sort({ grade: 1, feeType: 1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(fees)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('add-fee', async (_, feeData) => {
    try {
        const newFee = new FeeStructure(feeData);
        await newFee.save();
        return { success: true, data: JSON.parse(JSON.stringify(newFee.toObject())) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-fee', async (_, { id, data }) => {
    try {
        const updated = await FeeStructure.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-fee', async (_, id) => {
    try {
        await FeeStructure.findByIdAndDelete(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});


// --- Transaction Handlers ---
ipcMain.handle('get-transactions', async (_, filters) => {
    try {
        let query = {};
        if (filters?.studentId) query = { ...query, studentId: filters.studentId };
        if (filters?.status) query = { ...query, status: filters.status };

        // Using populate to get student details alongside the transaction
        const transactions = await Transaction.find(query)
            .populate('studentId', 'firstName lastName grade rollNumber')
            .populate('feeStructureId', 'feeType amount frequency')
            .sort({ paymentDate: -1 })
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(transactions)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('add-transaction', async (_, txData) => {
    try {
        const newTx = new Transaction(txData);
        await newTx.save();

        // Fetch newly saved doc with populated refs to return
        const populatedTx = await Transaction.findById(newTx._id)
            .populate('studentId', 'firstName lastName grade rollNumber')
            .populate('feeStructureId', 'feeType amount frequency')
            .lean();

        return { success: true, data: JSON.parse(JSON.stringify(populatedTx)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

// --- Analytics Handlers ---
ipcMain.handle('get-revenue-stats', async () => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const txs = await Transaction.find({ status: 'completed', paymentDate: { $gte: oneWeekAgo } }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(txs)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

// --- Task Handlers ---
ipcMain.handle('get-tasks', async () => {
    try {
        const tasks = await Task.find().sort({ dueDate: 1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(tasks)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('add-task', async (_, taskData) => {
    try {
        const newTask = new Task(taskData);
        await newTask.save();
        return { success: true, data: JSON.parse(JSON.stringify(newTask.toObject())) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-task', async (_, { id, data }) => {
    try {
        const updated = await Task.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-task', async (_, id) => {
    try {
        await Task.findByIdAndDelete(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

// --- Reminder Handlers ---
ipcMain.handle('get-reminders', async () => {
    try {
        const reminders = await Reminder.find({ isActive: true }).sort({ datetime: 1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(reminders)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('add-reminder', async (_, reminderData) => {
    try {
        const newReminder = new Reminder(reminderData);
        await newReminder.save();
        return { success: true, data: JSON.parse(JSON.stringify(newReminder.toObject())) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-reminder', async (_, id) => {
    try {
        await Reminder.findByIdAndDelete(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

// --- Settings Handlers ---
ipcMain.handle('get-settings', async () => {
    try {
        let settings = await Setting.findOne().lean();
        if (!settings) {
            // Create default settings if none exist
            const newSettings = new Setting();
            await newSettings.save();
            settings = newSettings.toObject();
        }
        return { success: true, data: JSON.parse(JSON.stringify(settings)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-settings', async (_, data) => {
    try {
        const updated = await Setting.findOneAndUpdate({}, data, { returnDocument: 'after', upsert: true }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});
