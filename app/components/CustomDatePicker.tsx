import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    isStatic?: boolean;
}

export default function CustomDatePicker({ value, onChange, placeholder = "Select date", className = "", isStatic = false }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial value or default to today
    const initialDate = value ? new Date(value) : new Date();
    const [currentDate, setCurrentDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value + 'T12:00:00') : null); // Avoid timezone shift
    const [tempSelected, setTempSelected] = useState<Date | null>(selectedDate);

    useEffect(() => {
        if (isOpen) {
            const d = value ? new Date(value + 'T12:00:00') : null;
            setSelectedDate(d);
            setTempSelected(d);
            if (d) {
                setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
            } else {
                const today = new Date();
                setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
            }
        }
    }, [isOpen, value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const prevMonthDays = getDaysInMonth(year, month - 1);

        const days = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Next month days to complete the grid (42 cells max)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleApply = () => {
        if (tempSelected) {
            // Format as YYYY-MM-DD
            const year = tempSelected.getFullYear();
            const month = String(tempSelected.getMonth() + 1).padStart(2, '0');
            const day = String(tempSelected.getDate()).padStart(2, '0');
            onChange(`${year}-${month}-${day}`);
        } else {
            onChange('');
        }
        if (!isStatic) setIsOpen(false);
    };

    // If static, dispatch onChange immediately when date is clicked
    useEffect(() => {
        if (isStatic && tempSelected) {
            const year = tempSelected.getFullYear();
            const month = String(tempSelected.getMonth() + 1).padStart(2, '0');
            const day = String(tempSelected.getDate()).padStart(2, '0');
            onChange(`${year}-${month}-${day}`);
        }
    }, [tempSelected, isStatic]);

    const handleCancel = () => {
        setIsOpen(false);
    };

    const isSameDay = (d1: Date | null, d2: Date | null) => {
        if (!d1 || !d2) return false;
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const calendarDays = generateCalendar();
    const formatMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

    // To display in the trigger button
    const displayValue = selectedDate
        ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(selectedDate)
        : "";

    const calendarContent = (
        <div className={`${isStatic ? 'w-full' : 'absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-[100] w-[320px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 origin-top'} bg-white rounded-2xl border border-border/60 p-5 ${isStatic ? className : ''}`}>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button
                    type="button"
                    onClick={prevMonth}
                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-[15px] text-foreground">{formatMonthYear}</span>
                <button
                    type="button"
                    onClick={nextMonth}
                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-foreground transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-[11px] font-bold text-gray-400 text-center py-1 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-1 gap-x-1 mb-6">
                {calendarDays.map((target, idx) => {
                    const isSelected = isSameDay(target.date, tempSelected);
                    const isToday = isSameDay(target.date, new Date());

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setTempSelected(target.date)}
                            className={`
                    w-10 h-10 mx-auto flex items-center justify-center text-sm font-medium rounded-full transition-all
                    ${!target.isCurrentMonth ? 'text-gray-300 pointer-events-none' : 'text-gray-700 hover:bg-gray-100'}
                    ${isSelected ? 'bg-black text-white hover:bg-black shadow-md' : ''}
                    ${isToday && !isSelected ? 'text-primary font-bold bg-primary/5' : ''}
                  `}
                        >
                            {target.date.getDate()}
                        </button>
                    );
                })}
            </div>

            {/* Action Buttons */}
            {!isStatic && (
                <div className="flex gap-3 pt-4 border-t border-border/40">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 py-2.5 rounded-xl border border-border/80 text-foreground font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        className="flex-1 py-2.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-900 shadow-md transition-colors"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );

    if (isStatic) {
        return calendarContent;
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-left px-4 py-2.5 bg-white/50 border border-border/60 hover:border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all focus:outline-none ${!displayValue ? 'text-gray-400' : 'text-foreground font-medium'} ${className}`}
            >
                <span>{displayValue || placeholder}</span>
                <CalendarIcon className="w-4 h-4 text-gray-400" />
            </button>

            {/* Popover */}
            {isOpen && calendarContent}
        </div>
    );
}
