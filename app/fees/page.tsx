"use client";

import { useEffect, useState } from "react";
import { Plus, CreditCard, Edit2, Trash2, X, AlertCircle } from "lucide-react";

export default function FeesPage() {
    const [fees, setFees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editFeeId, setEditFeeId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        grade: "",
        admissionFee: "",
        formFee: "",
        additionalFee: "",
        monthlyFee: "",
        termFee: "",
        annualFee: ""
    });

    const fetchFees = async () => {
        try {
            if (typeof window !== "undefined" && window.electron) {
                setLoading(true);
                const res = await window.electron.invoke('get-fees');
                if (res.success) {
                    const validFees = res.data.filter((f: any) => !f.grade.toLowerCase().includes('hostel') && !f.grade.toLowerCase().includes('transport'));
                    setFees(validFees);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (window.electron) {
                const payload = {
                    ...formData,
                    admissionFee: Number(formData.admissionFee) || 0,
                    formFee: Number(formData.formFee) || 0,
                    additionalFee: Number(formData.additionalFee) || 0,
                    monthlyFee: Number(formData.monthlyFee) || 0,
                    termFee: Number(formData.termFee) || 0,
                    annualFee: Number(formData.annualFee) || 0,
                };

                let res;
                if (editFeeId) {
                    res = await window.electron.invoke('update-fee', { id: editFeeId, data: payload });
                } else {
                    res = await window.electron.invoke('add-fee', payload);
                }

                if (res.success) {
                    setIsAddOpen(false);
                    setEditFeeId(null);
                    setFormData({ grade: "", admissionFee: "", formFee: "", additionalFee: "", monthlyFee: "", termFee: "", annualFee: "" });
                    fetchFees();
                } else {
                    alert('Error adding fee: ' + res.error);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditClick = (fee: any) => {
        setFormData({
            grade: fee.grade,
            admissionFee: fee.admissionFee.toString(),
            formFee: fee.formFee.toString(),
            additionalFee: fee.additionalFee.toString(),
            monthlyFee: fee.monthlyFee.toString(),
            termFee: fee.termFee.toString(),
            annualFee: fee.annualFee.toString(),
        });
        setEditFeeId(fee._id);
        setIsAddOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            if (window.electron) {
                const res = await window.electron.invoke('delete-fee', deleteConfirmId);
                if (res.success) {
                    setDeleteConfirmId(null);
                    fetchFees();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Fee Structures</h1>
                    <p className="text-gray-500 mt-1">Define tuition and miscellaneous fees by class.</p>
                </div>
                <button
                    onClick={() => {
                        setEditFeeId(null);
                        setFormData({ grade: "", admissionFee: "", formFee: "", additionalFee: "", monthlyFee: "", termFee: "", annualFee: "" });
                        setIsAddOpen(true);
                    }}
                    className="premium-button-primary flex items-center gap-2 rounded-full px-5"
                >
                    <Plus className="w-4 h-4" /> Add Structure
                </button>
            </div>

            <div className="glass-panel overflow-hidden border border-border/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/80 border-b border-border text-xs uppercase tracking-wider text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4">Admission Fee</th>
                                <th className="px-6 py-4">Form Fee</th>
                                <th className="px-6 py-4">Additional Fee</th>
                                <th className="px-6 py-4">Monthly Fee</th>
                                <th className="px-6 py-4">Term Fee</th>
                                <th className="px-6 py-4">Annual Fee</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    </td>
                                </tr>
                            ) : fees.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-gray-400 font-medium">
                                        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>No fee structures defined yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                fees.map((fee) => (
                                    <tr key={fee._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">
                                            {fee.grade}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-600">
                                            ₹ {fee.admissionFee.toLocaleString()} /-
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-600">
                                            ₹ {fee.formFee.toLocaleString()} /-
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-600">
                                            ₹ {fee.additionalFee.toLocaleString()} /-
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary">
                                            ₹ {fee.monthlyFee.toLocaleString()} /-
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-600">
                                            ₹ {fee.termFee.toLocaleString()} /-
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                                            ₹ {fee.annualFee.toLocaleString()} /-
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditClick(fee)} className="p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-primary transition-colors border border-transparent shadow-sm"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => setDeleteConfirmId(fee._id)} className="p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-danger transition-colors border border-transparent shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transport Note Footer */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-[24px] p-6 text-sm text-gray-600 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80"></div>
                <h4 className="font-bold text-foreground mb-3 text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Important Notes & Transport Fee
                </h4>
                <div className="space-y-4">
                    <p><strong>Hostel Fee:</strong> ₹ 1,20,000/- (One Lakh Twenty Thousand) Per Year.</p>
                    <div>
                        <p className="font-semibold text-foreground mb-1">Transport Fee Details:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                            <li>330 Rs × 11 months (Under 3 KM)</li>
                            <li>110 Rs per KM × 11 months (Under 10 KM)</li>
                            <li>100 Rs per KM × 11 months (Above 10 KM)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Add Fee Modal (Light Theme Style) */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl relative animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                        <button onClick={() => setIsAddOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors z-10">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                            <h2 className="text-2xl font-bold text-foreground mb-1">{editFeeId ? "Edit Fee Structure" : "Add Fee Structure"}</h2>
                            <p className="text-gray-500 text-sm mb-6">{editFeeId ? "Update pricing for this class." : "Create a new pricing tier for a specific class."}</p>

                            <form onSubmit={handleAddSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Class / Grade</label>
                                    <input required type="text" placeholder="e.g. PC to UKG or 1 to 3" className="glass-input bg-gray-50/50 w-full md:w-1/2" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Admission Fee (₹)</label>
                                        <input type="number" min="0" placeholder="0" className="glass-input bg-gray-50/50 font-bold" value={formData.admissionFee} onChange={e => setFormData({ ...formData, admissionFee: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Form Fee (₹)</label>
                                        <input type="number" min="0" placeholder="0" className="glass-input bg-gray-50/50 font-bold" value={formData.formFee} onChange={e => setFormData({ ...formData, formFee: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Additional Fee (₹)</label>
                                        <input type="number" min="0" placeholder="0" className="glass-input bg-gray-50/50 font-bold" value={formData.additionalFee} onChange={e => setFormData({ ...formData, additionalFee: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 text-primary">Monthly Fee (₹)</label>
                                        <input type="number" min="0" placeholder="0" className="glass-input bg-primary/5 font-bold text-primary border-primary/20" value={formData.monthlyFee} onChange={e => setFormData({ ...formData, monthlyFee: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Term Fee (₹)</label>
                                        <input type="number" min="0" placeholder="0" className="glass-input bg-gray-50/50 font-bold" value={formData.termFee} onChange={e => setFormData({ ...formData, termFee: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Annual Fee (₹)</label>
                                        <input type="number" min="0" placeholder="0" className="glass-input bg-gray-50/50 font-bold" value={formData.annualFee} onChange={e => setFormData({ ...formData, annualFee: e.target.value })} />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button type="submit" className="premium-button-black w-full text-center py-3 mt-2">Create Structure</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Specific Styled UI */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl relative animate-in zoom-in-95 p-8 text-center border overflow-hidden">
                        <button onClick={() => setDeleteConfirmId(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                        <div className="mx-auto w-12 h-12 rounded-full border-[6px] border-amber-50 bg-warning/10 flex items-center justify-center mb-4 mt-2">
                            <AlertCircle className="w-5 h-5 text-warning" />
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2">Are you sure?</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            You're about to delete this fee structure. This action cannot be undone.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-black text-white hover:bg-gray-800 font-bold py-3 px-4 rounded-xl transition-colors"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 bg-white border border-gray-200 text-foreground hover:bg-gray-50 font-bold py-3 px-4 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
