"use client";

import { useEffect, useState } from "react";
import { Receipt, Search, FileText } from "lucide-react";

export default function BillingPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [fees, setFees] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedFee, setSelectedFee] = useState("");
    const [amountPaid, setAmountPaid] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash" as any);
    const [referenceNumber, setReferenceNumber] = useState("");
    const [remarks, setRemarks] = useState("");

    const fetchData = async () => {
        try {
            if (typeof window !== "undefined" && window.electron) {
                setLoading(true);
                const [studentsRes, feesRes, txRes] = await Promise.all([
                    window.electron.invoke('get-students'),
                    window.electron.invoke('get-fees'),
                    window.electron.invoke('get-transactions')
                ]);

                if (studentsRes.success) setStudents(studentsRes.data.filter((s: any) => s.status === 'active'));
                if (feesRes.success) setFees(feesRes.data);
                if (txRes.success) setTransactions(txRes.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Update amount automatically when fee changes
    useEffect(() => {
        if (selectedFee) {
            const feeObj = fees.find(f => f._id === selectedFee);
            if (feeObj) {
                setAmountPaid(feeObj.amount.toString());
            }
        }
    }, [selectedFee, fees]);

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !selectedFee || !amountPaid) return;

        try {
            if (window.electron) {
                const payload = {
                    studentId: selectedStudent,
                    feeStructureId: selectedFee,
                    amountPaid: Number(amountPaid),
                    paymentMethod,
                    referenceNumber,
                    remarks,
                    status: 'completed'
                };
                const res = await window.electron.invoke('add-transaction', payload);
                if (res.success) {
                    setIsModalOpen(false);
                    // Reset form
                    setSelectedStudent("");
                    setSelectedFee("");
                    setAmountPaid("");
                    setPaymentMethod("cash");
                    setReferenceNumber("");
                    setRemarks("");
                    fetchData(); // Refresh list
                } else {
                    alert('Error processing payment: ' + res.error);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Filter fees based on selected student's grade
    const activeStudentObj = students.find(s => s._id === selectedStudent);
    const availableFees = activeStudentObj
        ? fees.filter(f => f.grade === activeStudentObj.grade)
        : fees;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
                    <p className="text-gray-400 mt-1">Accept payments and generate receipts.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="premium-button-primary flex items-center gap-2"
                >
                    <Receipt className="w-4 h-4" />
                    New Payment
                </button>
            </div>

            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-6">Transaction History</h2>
                {loading ? (
                    <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface-hover">
                                <tr className="text-gray-400 text-sm">
                                    <th className="px-6 py-4 font-medium">Receipt No.</th>
                                    <th className="px-6 py-4 font-medium">Student (Roll No.)</th>
                                    <th className="px-6 py-4 font-medium">Fee Type</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Status / Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">No transactions recorded yet.</td></tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-primary flex items-center gap-2">
                                                <FileText className="w-4 h-4" /> {tx.receiptNumber}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold">{tx.studentId?.firstName} {tx.studentId?.lastName}</span>
                                                <span className="text-xs text-gray-500 ml-2">({tx.studentId?.rollNumber})</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {tx.feeStructureId?.feeType} <span className="text-xs text-gray-500">({tx.feeStructureId?.frequency})</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold">₹{tx.amountPaid.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-400 uppercase text-xs font-semibold tracking-wider">
                                                {new Date(tx.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${tx.status === 'completed' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                                        {tx.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500 capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-panel w-full max-w-2xl bg-surface border border-border shadow-2xl p-6 relative animate-in zoom-in-95">
                        <h2 className="text-2xl font-bold mb-6">Process Payment</h2>
                        <form onSubmit={handlePaymentSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">

                                {/* Search & Select Student */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Select Student *</label>
                                    <select
                                        required
                                        className="glass-input appearance-none bg-surface-hover"
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                    >
                                        <option value="" disabled>-- Select a Student --</option>
                                        {students.map(s => (
                                            <option key={s._id} value={s._id}>{s.firstName} {s.lastName} (Roll: {s.rollNumber}, Class: {s.grade})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Select Fee Structure */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Applicable Fee Structure *</label>
                                    <select
                                        required
                                        className="glass-input appearance-none bg-surface-hover"
                                        value={selectedFee}
                                        onChange={(e) => setSelectedFee(e.target.value)}
                                        disabled={!selectedStudent}
                                    >
                                        <option value="" disabled>{selectedStudent ? "-- Select Fee Type --" : "-- Select a Student First --"}</option>
                                        {availableFees.map(f => (
                                            <option key={f._id} value={f._id}>{f.feeType} (₹{f.amount} / {f.frequency})</option>
                                        ))}
                                    </select>
                                    {selectedStudent && availableFees.length === 0 && (
                                        <p className="text-xs text-danger mt-2">No fee structures defined for this student's class (Class {activeStudentObj?.grade}).</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Amount Paying (₹) *</label>
                                    <input required type="number" min="1" className="glass-input font-bold text-lg" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Payment Method *</label>
                                    <select className="glass-input appearance-none" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="bank_transfer">Bank Transfer / UPI</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                </div>

                                {paymentMethod !== 'cash' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Transaction/Transfer Ref. Number</label>
                                        <input type="text" className="glass-input" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} placeholder="e.g. UTR / Cheque No." />
                                    </div>
                                )}

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Remarks (Optional)</label>
                                    <input type="text" className="glass-input" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any notes regarding this payment" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="premium-button-outline">Cancel</button>
                                <button type="submit" className="premium-button-primary" disabled={!selectedStudent || !selectedFee || !amountPaid}>Complete Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
