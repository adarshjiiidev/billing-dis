"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  IndianRupee,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  Calendar,
  Clock,
  MoreHorizontal,
  FileText,
  X,
  CheckCircle2,
  Printer
} from "lucide-react";
import AnimatedCounter from "./components/AnimatedCounter";
import CustomDatePicker from "./components/CustomDatePicker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    recentTransactions: [] as any[],
    collectionPercentage: 0
  });

  const [loading, setLoading] = useState(true);

  // Tasks State
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', color: 'bg-primary' });

  // Reminders State
  const [reminders, setReminders] = useState<any[]>([]);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', datetime: '', description: '' });

  // Analytics Stats
  const [revenueStats, setRevenueStats] = useState<any[]>([]);

  const chartData = useMemo(() => {
    // Generate last 7 days including today
    const days: { date: Date, label: string, total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d,
        label: d.toLocaleDateString('en-US', { weekday: 'short' })[0],
        total: 0
      });
    }

    // Map transactions
    revenueStats.forEach(tx => {
      const txDate = new Date(tx.paymentDate);
      const dayIndex = days.findIndex(d =>
        d.date.getDate() === txDate.getDate() &&
        d.date.getMonth() === txDate.getMonth() &&
        d.date.getFullYear() === txDate.getFullYear()
      );
      if (dayIndex !== -1) {
        days[dayIndex].total += tx.amountPaid;
      }
    });

    const maxVal = Math.max(...days.map(d => d.total), 1); // fallback to 1 to avoid div/0

    return days.map(d => ({
      ...d,
      heightPercentage: Math.max((d.total / maxVal) * 100, 5) // minimum 5% height
    }));
  }, [revenueStats]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      if (typeof window !== "undefined" && window.electron) {
        setLoading(true);
        const [studentsRes, transactionsRes, tasksRes, remindersRes, revenueRes] = await Promise.all([
          window.electron.invoke('get-students'),
          window.electron.invoke('get-transactions'),
          window.electron.invoke('get-tasks'),
          window.electron.invoke('get-reminders'),
          window.electron.invoke('get-revenue-stats')
        ]);

        if (studentsRes.success && transactionsRes.success) {
          const students = studentsRes.data;
          const transactions = transactionsRes.data;

          const activeStudentsCount = students.filter((s: any) => s.status === 'active').length;
          const revenue = transactions
            .filter((t: any) => t.status === 'completed')
            .reduce((sum: number, tx: any) => sum + tx.amountPaid, 0);
          const pendingCount = transactions.filter((t: any) => t.status === 'pending').length;

          const pendingAmount = transactions
            .filter((t: any) => t.status === 'pending')
            .reduce((sum: number, tx: any) => sum + tx.amountPaid, 0);

          const totalExpected = revenue + pendingAmount;
          const collectionPercentage = totalExpected > 0 ? Math.round((revenue / totalExpected) * 100) : 0;

          setStats({
            totalStudents: students.length,
            activeStudents: activeStudentsCount,
            totalRevenue: revenue,
            pendingApprovals: pendingCount,
            recentTransactions: transactions.slice(0, 5),
            collectionPercentage
          });
        }

        if (tasksRes.success) setTasks(tasksRes.data);
        if (remindersRes.success) setReminders(remindersRes.data);
        if (revenueRes.success) setRevenueStats(revenueRes.data);
      }
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- Actions ---
  const generateReceipt = (tx: any) => {
    const doc = new jsPDF();
    const studentName = `${tx.studentId?.firstName || 'Student'} ${tx.studentId?.lastName || ''}`;

    // Header
    doc.setFontSize(22);
    doc.text("Daddy's International School", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("123 Education Lane", 105, 28, { align: "center" });

    // Title
    doc.setFontSize(16);
    doc.text("FEE RECEIPT", 105, 45, { align: "center" });

    // Receipt Details
    doc.setFontSize(11);
    doc.text(`Receipt No: ${tx.receiptNumber}`, 14, 60);
    doc.text(`Date: ${new Date(tx.paymentDate).toLocaleDateString()}`, 140, 60);
    doc.text(`Student Name: ${studentName}`, 14, 70);
    doc.text(`Roll No: ${tx.studentId?.rollNumber || 'N/A'}`, 140, 70);
    doc.text(`Grade/Class: ${tx.studentId?.grade || 'N/A'}`, 14, 80);
    doc.text(`Status: ${tx.status.toUpperCase()}`, 140, 80);

    const isHosteler = tx.studentId?.studentType === 'hosteler';
    const usesTransport = tx.studentId?.usesTransport;
    const transportDistance = tx.studentId?.transportDistance || 0;

    let transportDesc = 'Transport Fee';
    if (usesTransport) {
      if (transportDistance <= 3) transportDesc = 'Transport Fee (Under 3 KM)';
      else if (transportDistance <= 10) transportDesc = 'Transport Fee (Under 10 KM)';
      else transportDesc = 'Transport Fee (Above 10 KM)';
    }

    const bodyRows = [
      [tx.feeStructureId?.grade ? `Class ${tx.feeStructureId.grade} Fees` : 'Fee Payment', `Rs. ${tx.amountPaid.toLocaleString()}`]
    ];

    if (isHosteler) {
      bodyRows.push(['+ Hostel Fee (Applicable)', '-']);
    } else if (usesTransport) {
      bodyRows.push([`+ ${transportDesc} (Applicable)`, '-']);
    }

    // Transaction breakdown
    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Amount (INR)']],
      body: bodyRows,
      foot: [['Total Paid', `Rs. ${tx.amountPaid.toLocaleString()}`]],
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] }, // Primary orange
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 135;
    doc.setFontSize(10);
    doc.text("Note: This is a computer-generated receipt and does not require a signature.", 105, finalY + 30, { align: "center" });

    // Save
    doc.save(`Receipt_${tx.receiptNumber}.pdf`);
  };
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.electron) return;
    const res = await window.electron.invoke('add-task', newTask);
    if (res.success) {
      setTasks([...tasks, res.data].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      setIsAddTaskOpen(false);
      setNewTask({ title: '', dueDate: '', color: 'bg-primary' });
    }
  };

  const handleTaskComplete = async (id: string) => {
    if (!window.electron) return;
    const res = await window.electron.invoke('update-task', { id, data: { status: 'completed' } });
    if (res.success) {
      fetchDashboardData(); // Re-fetch to sort or we can just filter
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.electron) return;
    const res = await window.electron.invoke('add-reminder', newReminder);
    if (res.success) {
      setReminders([...reminders, res.data].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));
      setIsAddReminderOpen(false);
      setNewReminder({ title: '', datetime: '', description: '' });
    }
  };

  const handleDeleteReminder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.electron) return;
    const res = await window.electron.invoke('delete-reminder', id);
    if (res.success) {
      setReminders(reminders.filter(r => r._id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage, prioritize, and accomplish your billing tasks with ease.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/students')}
            className="premium-button-primary flex items-center gap-2 rounded-full px-5"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="premium-button-outline flex items-center gap-2 rounded-full px-5 font-semibold text-foreground"
          >
            Import Data
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solid Green Card */}
        <div className="bg-primary text-white p-6 rounded-[24px] shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-semibold text-white/90">Total Enrollments</p>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/10 hover:bg-white/20 cursor-pointer transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-4xl font-bold tracking-tight">
            <AnimatedCounter value={stats.totalStudents} />
          </h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-2.5 py-1 rounded-md text-white/90">
            <Activity className="w-3 h-3" /> Increased from last month
          </div>
        </div>

        {/* White KPI Cards */}
        <StatCard title="Active Students" value={stats.activeStudents} isNumber={true} trend="Increased from last month" />
        <StatCard title="Total Revenue (₹)" value={stats.totalRevenue} isNumber={true} trend="Increased from last month" />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} isNumber={true} trend="On Discuss" noTrendIcon={true} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Analytics & Reminders) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Charts Placeholder */}
            <div className="glass-panel p-6 h-72">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-foreground">Revenue Analytics</h3>
              </div>
              {/* Dynamic Bar Chart */}
              <div className="flex items-end justify-between h-40 gap-2 mt-auto">
                {chartData.map((data, idx) => {
                  const isHighest = data.heightPercentage === 100 && data.total > 0;
                  return (
                    <div
                      key={idx}
                      className={`w-full rounded-t-xl relative transition-all duration-500 ease-out group ${data.total === 0 ? 'bg-gray-100' : isHighest ? 'bg-success/80' : 'bg-primary'
                        }`}
                      style={{ height: `${data.heightPercentage}%` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                        ₹{data.total.toLocaleString()}
                      </div>

                      {isHighest && data.total > 0 && (
                        <>
                          <div className="absolute -top-8 bg-white border border-border shadow-sm px-2 py-1 rounded-md left-1/2 -translate-x-1/2 text-xs font-bold text-foreground">
                            Highest
                          </div>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-white bg-success"></div>
                        </>
                      )}

                      <div className={`absolute ${isHighest && data.total > 0 ? 'bottom-[-24px]' : '-top-6'} left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400`}>
                        {data.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reminders & Action */}
            <div className="glass-panel p-6 h-72 flex flex-col">
              <h3 className="font-bold text-lg text-foreground mb-4">Upcoming Reminders</h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {reminders.length > 0 ? reminders.map((rem: any) => (
                  <div key={rem._id} className="relative group p-3 border border-border/60 rounded-xl hover:border-primary transition-colors">
                    <h4 className="text-[15px] font-bold leading-tight mb-1">{rem.title}</h4>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {new Date(rem.datetime).toLocaleString()}
                    </p>
                    <button
                      onClick={(e) => handleDeleteReminder(rem._id, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-md transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )) : (
                  <div className="text-sm font-medium text-gray-400 text-center mt-8">No active reminders.</div>
                )}
              </div>
              <button onClick={() => setIsAddReminderOpen(true)} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 mt-4 shrink-0 shadow-sm shadow-primary/20">
                <Calendar className="w-5 h-5" /> Schedule Event
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-foreground">Recent Transactions</h3>
              <button
                onClick={() => router.push('/settings')}
                className="px-3 py-1 border border-border rounded-full text-xs font-bold flex items-center gap-1 hover:bg-gray-50 text-foreground"
              >
                <Download className="w-3 h-3" /> Export
              </button>
            </div>

            {stats.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentTransactions.map((tx: any) => (
                  <div key={tx._id} className="flex items-center justify-between p-4 border border-border rounded-2xl hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{tx.studentId?.firstName} {tx.studentId?.lastName}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Receipt: {tx.receiptNumber} • {new Date(tx.paymentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{tx.amountPaid.toLocaleString()}</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${tx.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>{tx.status}</span>
                      </div>
                      <button
                        onClick={() => generateReceipt(tx)}
                        title="Download Receipt"
                        className="p-2 bg-gray-50 border border-border/50 text-gray-500 rounded-lg hover:border-primary hover:text-primary transition-colors hover:shadow-sm"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No recent transactions.</div>
            )}
          </div>
        </div>

        {/* Right Column (Tasks & Progress) */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-foreground">Pending Tasks</h3>
              <button onClick={() => setIsAddTaskOpen(true)} className="px-3 py-1 border border-border rounded-full text-xs font-bold flex items-center gap-1 hover:bg-gray-50">
                <Plus className="w-3 h-3" /> New
              </button>
            </div>
            <div className="space-y-4 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.filter(t => t.status !== 'completed').length > 0 ? (
                tasks.filter(t => t.status !== 'completed').map((task: any) => (
                  <TaskItem
                    key={task._id}
                    title={task.title}
                    date={new Date(task.dueDate).toLocaleDateString()}
                    color={task.color}
                    onComplete={() => handleTaskComplete(task._id)}
                  />
                ))
              ) : (
                <div className="text-sm font-medium text-gray-400 text-center mt-12">All tasks completed!</div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col items-center relative overflow-hidden h-[280px]">
            <h3 className="font-bold text-lg text-foreground absolute top-6 left-6 w-full text-left">Fee Collection Progress</h3>
            {/* Dynamic Donut Chart centered */}
            <div
              className="relative mt-12 w-36 h-36 rounded-full flex flex-col items-center justify-center shrink-0"
              style={{ background: `conic-gradient(#f97316 ${stats.collectionPercentage}%, #f3f4f6 0)` }}
            >
              <div className="absolute inset-[16px] bg-white rounded-full"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-foreground">{stats.collectionPercentage}%</span>
                <p className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-tight uppercase tracking-wider">Target<br />Reached</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-auto w-full justify-center text-xs font-bold text-gray-500 pt-4">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> Collected</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-200"></div> Pending</div>
            </div>
          </div>
        </div>

      </div>
      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-[900px] rounded-[24px] shadow-2xl relative animate-in zoom-in-95 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            <button onClick={() => setIsAddTaskOpen(false)} className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-6">New Task</h3>

              <form onSubmit={handleAddTask} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    className="glass-input w-full"
                    placeholder="E.g., Review fee submissions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Selected Date</label>
                  <div className="h-[42px] px-3 py-2.5 glass-input w-full font-medium text-gray-500 bg-gray-50 flex items-center">
                    {newTask.dueDate
                      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(newTask.dueDate))
                      : 'Select on right'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Color Label</label>
                  <div className="flex gap-3">
                    {['bg-primary', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'].map(color => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setNewTask({ ...newTask, color })}
                        className={`w-8 h-8 rounded-full ${color} ${newTask.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="premium-button-primary w-full">Save Task</button>
                </div>
              </form>
            </div>

            {/* Right Side: Static Calendar */}
            <div className="p-8 bg-gray-50/80 border-l border-border/50 flex flex-col items-center justify-center shrink-0 w-full md:w-[420px]">
              <CustomDatePicker
                isStatic={true}
                className="border-none shadow-none bg-transparent p-0"
                value={newTask.dueDate}
                onChange={date => setNewTask({ ...newTask, dueDate: date })}
                placeholder="Select date"
              />
            </div>

          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {isAddReminderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-[900px] rounded-[24px] shadow-2xl relative animate-in zoom-in-95 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            <button onClick={() => setIsAddReminderOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors z-10">
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Form */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Schedule Event</h3>

              <form onSubmit={handleAddReminder} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newReminder.title}
                    onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                    className="glass-input w-full"
                    placeholder="Meeting with Board"
                  />
                </div>

                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Selected Date</label>
                    <div className="h-[42px] px-3 py-2.5 glass-input w-full font-medium text-gray-500 bg-gray-50 flex items-center">
                      {newReminder.datetime
                        ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(newReminder.datetime.split('T')[0]))
                        : 'Select on right'}
                    </div>
                  </div>
                  <div className="w-1/3 shrink-0">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      required
                      value={newReminder.datetime ? newReminder.datetime.split('T')[1]?.substring(0, 5) || '09:00' : '09:00'}
                      onChange={e => {
                        const date = newReminder.datetime ? newReminder.datetime.split('T')[0] : new Date().toISOString().split('T')[0];
                        setNewReminder({ ...newReminder, datetime: `${date}T${e.target.value}` });
                      }}
                      className="glass-input w-full px-3 py-2.5 h-[42px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea
                    value={newReminder.description || ''}
                    onChange={e => setNewReminder({ ...newReminder, description: e.target.value })}
                    className="glass-input w-full min-h-[80px]"
                    placeholder="Brief details about the event..."
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="premium-button-primary w-full">Schedule Event</button>
                </div>
              </form>
            </div>

            {/* Right Side: Static Calendar */}
            <div className="p-8 bg-gray-50/80 border-l border-border/50 flex flex-col items-center justify-center shrink-0 w-full md:w-[420px]">
              <CustomDatePicker
                isStatic={true}
                className="border-none shadow-none bg-transparent p-0"
                value={newReminder.datetime ? newReminder.datetime.split('T')[0] : ''}
                onChange={date => {
                  const time = newReminder.datetime ? (newReminder.datetime.split('T')[1] || '09:00') : '09:00';
                  setNewReminder({ ...newReminder, datetime: `${date}T${time}` });
                }}
                placeholder="Select date"
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, trend, noTrendIcon, isNumber }: any) {
  return (
    <div className="bg-surface border border-border/50 p-6 rounded-[24px] shadow-sm flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-4">
        <p className="font-semibold text-foreground">{title}</p>
        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-gray-500">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
      <h3 className="text-4xl font-bold tracking-tight text-foreground">
        {isNumber ? <AnimatedCounter value={value} /> : value}
      </h3>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-400">
        {!noTrendIcon && <div className="bg-gray-100 rounded-md p-1.5"><ArrowUpRight className="w-3 h-3 text-gray-500" /></div>}
        {trend}
      </div>
    </div>
  );
}

function TaskItem({ title, date, color, onComplete }: { title: string, color: string, date: string, onComplete: () => void }) {
  return (
    <div className="flex items-start gap-4 cursor-pointer group">
      <div className={`w-8 h-8 rounded-full ${color}/20 flex items-center justify-center shrink-0`}>
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
      </div>
      <div className="flex-1 border-b border-border/50 pb-4 flex justify-between items-center pr-2 relative">
        <div>
          <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-[11px] font-semibold text-gray-400 mt-1">Due date: {date}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="absolute right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-success transition-all p-1"
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
