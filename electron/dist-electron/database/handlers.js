"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const models_1 = require("./models");
// --- Student Handlers ---
electron_1.ipcMain.handle('get-students', async () => {
    try {
        const students = await models_1.Student.find().sort({ createdAt: -1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(students)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('add-student', async (_, studentData) => {
    try {
        const newStudent = new models_1.Student(studentData);
        await newStudent.save();
        return { success: true, data: JSON.parse(JSON.stringify(newStudent.toObject())) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('update-student', async (_, { id, data }) => {
    try {
        const updated = await models_1.Student.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(updated)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('delete-student', async (_, id) => {
    try {
        await models_1.Student.findByIdAndDelete(id);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Fee Structure Handlers ---
electron_1.ipcMain.handle('get-fees', async () => {
    try {
        const fees = await models_1.FeeStructure.find().sort({ grade: 1, feeType: 1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(fees)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('add-fee', async (_, feeData) => {
    try {
        const newFee = new models_1.FeeStructure(feeData);
        await newFee.save();
        return { success: true, data: JSON.parse(JSON.stringify(newFee.toObject())) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('update-fee', async (_, { id, data }) => {
    try {
        const updated = await models_1.FeeStructure.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(updated)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('delete-fee', async (_, id) => {
    try {
        await models_1.FeeStructure.findByIdAndDelete(id);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Transaction Handlers ---
electron_1.ipcMain.handle('get-transactions', async (_, filters) => {
    try {
        let query = {};
        if (filters?.studentId)
            query = { ...query, studentId: filters.studentId };
        if (filters?.status)
            query = { ...query, status: filters.status };
        // Using populate to get student details alongside the transaction
        const transactions = await models_1.Transaction.find(query)
            .populate('studentId', 'firstName lastName grade rollNumber')
            .populate('feeStructureId', 'feeType amount frequency')
            .sort({ paymentDate: -1 })
            .lean();
        return { success: true, data: JSON.parse(JSON.stringify(transactions)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('add-transaction', async (_, txData) => {
    try {
        const newTx = new models_1.Transaction(txData);
        await newTx.save();
        // Fetch newly saved doc with populated refs to return
        const populatedTx = await models_1.Transaction.findById(newTx._id)
            .populate('studentId', 'firstName lastName grade rollNumber')
            .populate('feeStructureId', 'feeType amount frequency')
            .lean();
        return { success: true, data: JSON.parse(JSON.stringify(populatedTx)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Analytics Handlers ---
electron_1.ipcMain.handle('get-revenue-stats', async () => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const txs = await models_1.Transaction.find({ status: 'completed', paymentDate: { $gte: oneWeekAgo } }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(txs)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Task Handlers ---
electron_1.ipcMain.handle('get-tasks', async () => {
    try {
        const tasks = await models_1.Task.find().sort({ dueDate: 1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(tasks)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('add-task', async (_, taskData) => {
    try {
        const newTask = new models_1.Task(taskData);
        await newTask.save();
        return { success: true, data: JSON.parse(JSON.stringify(newTask.toObject())) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('update-task', async (_, { id, data }) => {
    try {
        const updated = await models_1.Task.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(updated)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('delete-task', async (_, id) => {
    try {
        await models_1.Task.findByIdAndDelete(id);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Reminder Handlers ---
electron_1.ipcMain.handle('get-reminders', async () => {
    try {
        const reminders = await models_1.Reminder.find({ isActive: true }).sort({ datetime: 1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(reminders)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('add-reminder', async (_, reminderData) => {
    try {
        const newReminder = new models_1.Reminder(reminderData);
        await newReminder.save();
        return { success: true, data: JSON.parse(JSON.stringify(newReminder.toObject())) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('delete-reminder', async (_, id) => {
    try {
        await models_1.Reminder.findByIdAndDelete(id);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// --- Settings Handlers ---
electron_1.ipcMain.handle('get-settings', async () => {
    try {
        let settings = await models_1.Setting.findOne().lean();
        if (!settings) {
            // Create default settings if none exist
            const newSettings = new models_1.Setting();
            await newSettings.save();
            settings = newSettings.toObject();
        }
        return { success: true, data: JSON.parse(JSON.stringify(settings)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('save-settings', async (_, data) => {
    try {
        const updated = await models_1.Setting.findOneAndUpdate({}, data, { returnDocument: 'after', upsert: true }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(updated)) };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=handlers.js.map