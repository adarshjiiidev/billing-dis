"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, X, AlertTriangle } from "lucide-react";

const ALL_CLASSES = [
    "Pre-Nursery", "Nursery", "LKG", "UKG",
    "Class 1", "Class 2", "Class 3", "Class 4",
    "Class 5", "Class 6", "Class 7", "Class 8",
    "Class 9", "Class 10", "Class 11", "Class 12"
];

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modals state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editStudentId, setEditStudentId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [feeStructures, setFeeStructures] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        grade: "",
        rollNumber: "",
        parentName: "",
        parentContact: "",
        address: "",
        studentType: "day_scholar" as "hosteler" | "day_scholar",
        usesTransport: false,
        transportDistance: "" as string | number,
        paymentFrequency: "monthly" as "monthly" | "quarterly" | "yearly"
    });

    const fetchData = async () => {
        try {
            if (typeof window !== "undefined" && window.electron) {
                setLoading(true);
                const [stuRes, feeRes] = await Promise.all([
                    window.electron.invoke('get-students'),
                    window.electron.invoke('get-fees')
                ]);
                if (stuRes.success) setStudents(stuRes.data);
                if (feeRes.success) {
                    const validFees = feeRes.data.filter((f: any) => !f.grade.toLowerCase().includes('hostel') && !f.grade.toLowerCase().includes('transport'));
                    setFeeStructures(validFees);
                }
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

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (typeof window !== 'undefined' && window.electron) {
                const payload = {
                    ...formData,
                    transportDistance: Number(formData.transportDistance) || 0
                };
                let res;
                if (editStudentId) {
                    res = await window.electron.invoke('update-student', { id: editStudentId, data: payload });
                } else {
                    res = await window.electron.invoke('add-student', payload);
                }

                if (res.success) {
                    setIsAddOpen(false);
                    setEditStudentId(null);
                    setFormData({ firstName: "", lastName: "", grade: "", rollNumber: "", parentName: "", parentContact: "", address: "", studentType: "day_scholar", usesTransport: false, transportDistance: "", paymentFrequency: "monthly" });
                    fetchData();
                } else {
                    alert('Error adding student: ' + res.error);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditClick = (student: any) => {
        setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade,
            rollNumber: student.rollNumber,
            parentName: student.parentName,
            parentContact: student.parentContact,
            address: student.address || "",
            studentType: student.studentType || "day_scholar",
            usesTransport: student.usesTransport || false,
            transportDistance: student.transportDistance || "",
            paymentFrequency: student.paymentFrequency || "monthly"
        });
        setEditStudentId(student._id);
        setIsAddOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            if (window.electron) {
                const res = await window.electron.invoke('delete-student', deleteConfirmId);
                if (res.success) {
                    setDeleteConfirmId(null);
                    fetchData();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredStudents = students.filter(s =>
        s.firstName.toLowerCase().includes(search.toLowerCase()) ||
        s.lastName.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Students Directory</h1>
                    <p className="text-gray-500 mt-1">Manage enrollments, grades, and contact details.</p>
                </div>
                <button
                    onClick={() => {
                        setEditStudentId(null);
                        setFormData({ firstName: "", lastName: "", grade: "", rollNumber: "", parentName: "", parentContact: "", address: "", studentType: "day_scholar", usesTransport: false, transportDistance: "", paymentFrequency: "monthly" });
                        setIsAddOpen(true);
                    }}
                    className="premium-button-primary flex items-center gap-2 rounded-full px-5"
                >
                    <Plus className="w-4 h-4" /> Add Student
                </button>
            </div>

            <div className="glass-panel p-6 shadow-sm border border-border/60">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="glass-input pl-11 bg-gray-50/50 border-gray-200"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-left bg-white">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider bg-gray-50/50">
                                    <th className="px-6 py-4 font-bold">Roll No.</th>
                                    <th className="px-6 py-4 font-bold">Student</th>
                                    <th className="px-6 py-4 font-bold">Class</th>
                                    <th className="px-6 py-4 font-bold">Parent Contact</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-gray-500 font-medium">No students found.</td></tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5 font-bold text-gray-600">{student.rollNumber}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-foreground block">{student.firstName} {student.lastName}</span>
                                                        <span className="text-xs font-semibold px-2 py-0.5 mt-1 rounded-md inline-block tracking-wide uppercase bg-gray-100 text-gray-500">
                                                            {student.studentType === 'hosteler' ? 'Hosteler' : student.usesTransport ? 'Transport' : 'Day Scholar'}
                                                        </span>
                                                        <span className="text-xs font-semibold px-2 py-0.5 mt-1 ml-2 rounded-md inline-block tracking-wide uppercase bg-blue-50/50 text-blue-600 border border-blue-100">
                                                            {student.paymentFrequency || 'Monthly'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-medium text-gray-600">Grade {student.grade}</td>
                                            <td className="px-6 py-5">
                                                <div className="font-medium text-gray-700">{student.parentName}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{student.parentContact}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={student.status === 'active' ? 'badge-success' : 'badge-danger'}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditClick(student)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeleteConfirmId(student._id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
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

            {/* Add Student Modal (Light Theme Style) */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl relative animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                        <button onClick={() => setIsAddOpen(false)} className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-700 transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                            <h2 className="text-2xl font-bold text-foreground mb-1">{editStudentId ? "Edit Student" : "Add New Student"}</h2>
                            <p className="text-gray-500 text-sm mb-8">Enter the student's personal and academic details below.</p>

                            <form onSubmit={handleAddSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">First Name</label>
                                        <input required type="text" className="glass-input bg-gray-50/50" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Last Name</label>
                                        <input required type="text" className="glass-input bg-gray-50/50" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Roll Number</label>
                                        <input required type="text" className="glass-input bg-gray-50/50" value={formData.rollNumber} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Class / Grade</label>
                                        <select required className="glass-input bg-gray-50/50 w-full" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })}>
                                            <option value="" disabled>Select Class</option>
                                            {ALL_CLASSES.map(cls => (
                                                <option key={cls} value={cls}>{cls}</option>
                                            ))}
                                            {/* Fallback option if current grade is missing from standard classes */}
                                            {formData.grade && !ALL_CLASSES.includes(formData.grade) && (
                                                <option value={formData.grade} className="text-gray-400">{formData.grade} (Legacy)</option>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Payment Frequency</label>
                                        <select required className="glass-input bg-gray-50/50 w-full" value={formData.paymentFrequency} onChange={e => setFormData({ ...formData, paymentFrequency: e.target.value as any })}>
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Parent Name</label>
                                        <input required type="text" className="glass-input bg-gray-50/50" value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Parent Contact</label>
                                        <input required type="text" className="glass-input bg-gray-50/50" value={formData.parentContact} onChange={e => setFormData({ ...formData, parentContact: e.target.value })} />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Address</label>
                                        <textarea className="glass-input bg-gray-50/50 min-h-[50px]" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 border-t border-border/60 pt-4 mt-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Student Type</label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all ${formData.studentType === 'day_scholar' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-gray-50/30'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <input type="radio" name="studentType" value="day_scholar" checked={formData.studentType === 'day_scholar'} onChange={() => setFormData({ ...formData, studentType: 'day_scholar' })} className="accent-primary" />
                                                    <span className="font-bold text-foreground">Day Scholar (Outsider)</span>
                                                </div>
                                                <p className="text-xs text-gray-500 ml-5 font-medium">Student commutes from home daily.</p>
                                            </label>
                                            <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all ${formData.studentType === 'hosteler' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-gray-50/30'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <input type="radio" name="studentType" value="hosteler" checked={formData.studentType === 'hosteler'} onChange={() => setFormData({ ...formData, studentType: 'hosteler', usesTransport: false, transportDistance: "" })} className="accent-primary" />
                                                    <span className="font-bold text-foreground">Hosteler</span>
                                                </div>
                                                <p className="text-xs text-gray-500 ml-5 font-medium">Student stays in the school hostel.</p>
                                            </label>
                                        </div>
                                    </div>

                                    {formData.studentType === 'hosteler' && (
                                        <div className="col-span-1 md:col-span-2 bg-orange-50/60 border border-orange-100 rounded-xl p-4 flex gap-3 text-sm">
                                            <AlertTriangle className="w-5 h-5 text-primary shrink-0" />
                                            <div>
                                                <p className="font-bold text-foreground">Hostel Fee Applies</p>
                                                <p className="text-gray-600 font-medium">This student will be billed the flat Hostel Fee of ₹ 1,20,000/- Per Year automatically.</p>
                                            </div>
                                        </div>
                                    )}

                                    {formData.studentType === 'day_scholar' && (
                                        <div className="col-span-1 md:col-span-2 bg-gray-50/50 border border-border/60 rounded-xl p-4 space-y-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={formData.usesTransport} onChange={(e) => setFormData({ ...formData, usesTransport: e.target.checked })} className="accent-primary w-4 h-4 rounded text-primary form-checkbox" />
                                                <span className="font-bold text-foreground">Student uses School Transport</span>
                                            </label>

                                            {formData.usesTransport && (
                                                <div className="animate-in fade-in slide-in-from-top-2 ml-6">
                                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Transport Distance (in KM)</label>
                                                    <div className="flex items-center gap-2">
                                                        <input type="number" min="0" step="0.1" placeholder="e.g. 5.5" className="glass-input bg-white w-32" value={formData.transportDistance} onChange={e => setFormData({ ...formData, transportDistance: e.target.value })} />
                                                        <span className="text-sm font-bold text-gray-400">KM</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2 font-medium">Transport fees are calculated automatically based on this distance.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                                <div className="flex justify-end pt-2 mt-4 text-center">
                                    <button type="submit" className="premium-button-black w-full text-center py-3.5">Save Student</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Specific Styled UI (Bottom Right Image Ref) */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl relative animate-in zoom-in-95 p-8 text-center border overflow-hidden">
                        <button onClick={() => setDeleteConfirmId(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                        <div className="mx-auto w-12 h-12 rounded-full border-[6px] border-red-50 bg-red-100 flex items-center justify-center mb-4 mt-2">
                            <AlertTriangle className="w-5 h-5 text-danger" />
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2">Delete user?</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Are you sure you want to delete this user? Once deleted, all associated data will be permanently lost.
                        </p>

                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center justify-between bg-red-50 hover:bg-red-100 text-danger font-bold py-3.5 px-5 rounded-xl transition-colors group"
                        >
                            Yes, Delete <Trash2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
