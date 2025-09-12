
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import type { Student } from '../types';
import { StudentStatus } from '../types';

const StudentLookup: React.FC = () => {
    const [studentId, setStudentId] = useState('');
    const [foundStudent, setFoundStudent] = useState<Student | null>(null);
    const [error, setError] = useState('');
    const { findStudentById, getStudentsByCommitteeId } = useData();

    useEffect(() => {
        // FIX: Use StudentStatus.Waiting enum member with correct PascalCase casing.
        if (foundStudent?.status === StudentStatus.Waiting) {
            const interval = setInterval(() => {
                const updatedStudent = findStudentById(String(foundStudent.id));
                // Always update the student data to ensure the component re-renders
                // with the latest information, including queue position changes.
                if (updatedStudent) {
                    setFoundStudent(updatedStudent);
                }
            }, 5000); // Poll every 5 seconds for status and queue changes

            return () => clearInterval(interval);
        }
    }, [foundStudent, findStudentById]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFoundStudent(null);

        if (!studentId) {
            setError('الرجاء إدخال رقم تسجيل الطالب.');
            return;
        }

        const student = findStudentById(studentId);
        if (student) {
            setFoundStudent(student);
        } else {
            setError('لم يتم العثور على طالب بهذا الرقم.');
        }
    };
    
    const getQueuePositionInfo = (student: Student) => {
        // FIX: Use StudentStatus.Completed enum member with correct PascalCase casing.
        if (student.status === StudentStatus.Completed) {
            return { positionText: 'لقد أكملت مقابلتك بنجاح.', waitText: 'نتمنى لك كل التوفيق!', isNextInLine: false };
        }
        // FIX: Use StudentStatus.InProgress enum member with correct PascalCase casing.
        if (student.status === StudentStatus.InProgress) {
            return { positionText: 'أنت حالياً في المقابلة.', waitText: 'حظاً موفقاً!', isNextInLine: false };
        }

        const committeeQueue = getStudentsByCommitteeId(student.committeeId)
            // FIX: Use StudentStatus enum members with correct PascalCase casing.
            .filter(s => s.status === StudentStatus.Waiting || s.status === StudentStatus.InProgress)
            .sort((a,b) => a.queuePosition - b.queuePosition);
        
        const myIndex = committeeQueue.findIndex(s => s.id === student.id);
        
        if(myIndex === -1) {
             return { positionText: 'أنت في قائمة الانتظار.', waitText: 'سيتم تحديد دورك قريباً.', isNextInLine: false };
        }
        
        // The student is next if they are at index 1 (index 0 is IN_PROGRESS)
        const isNextInLine = myIndex === 1;
        const peopleAhead = myIndex;
        const estimatedWait = peopleAhead * 5; // Assuming 5 minutes per student

        return {
            positionText: `أنت رقم ${myIndex + 1} في الطابور.`,
            waitText: `الوقت التقديري المتبقي للانتظار: ${estimatedWait} دقيقة.`,
            isNextInLine,
        };
    };

    const queueInfo = foundStudent ? getQueuePositionInfo(foundStudent) : null;

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <UserSearchIcon />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">الاستعلام عن حالة الطالب</h1>
                    <p className="text-gray-500 mb-6">أدخل رقم التسجيل الخاص بك لمعرفة دورك في الطابور.</p>

                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                            placeholder="أدخل رقم التسجيل هنا"
                            className="w-full text-center p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            aria-label="رقم تسجيل الطالب"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg"
                        >
                            بحث
                        </button>
                    </form>
                    
                    {error && <p className="mt-4 text-red-500 font-semibold">{error}</p>}
                </div>
                
                {foundStudent && queueInfo && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 animate-fade-in-up">
                        {queueInfo.isNextInLine && <NotificationBanner />}
                        <h2 className="text-2xl font-bold text-gray-800 text-center">مرحباً, {foundStudent.name}</h2>
                        <div className="mt-4 text-center space-y-4">
                            {/* FIX: Use StudentStatus.Completed enum member with correct PascalCase casing. */}
                            <div className={`p-6 rounded-lg ${foundStudent.status === StudentStatus.Completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                                <p className="text-xl font-bold text-blue-800">
                                    {queueInfo.positionText}
                                </p>
                                <p className="text-md text-gray-600 mt-1">
                                    {queueInfo.waitText}
                                </p>
                            </div>
                            <div className="text-right text-sm text-gray-500 p-2 border-t">
                                <p><strong>التخصص:</strong> {foundStudent.specialty}</p>
                                <p><strong>الحالة:</strong> {translateStatus(foundStudent.status)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const NotificationBanner = () => (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6 flex items-center shadow-md animate-fade-in-up" role="alert">
        <BellIcon />
        <div className="mr-3">
            <p className="font-bold">تنبيه: أنت التالي في قائمة الانتظار!</p>
            <p className="text-sm">الرجاء الاستعداد والتوجه إلى قاعة اللجنة.</p>
        </div>
    </div>
);

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const UserSearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

const translateStatus = (status: StudentStatus) => {
    switch (status) {
        // FIX: Use StudentStatus.Waiting enum member with correct PascalCase casing.
        case StudentStatus.Waiting: return 'في الانتظار';
        // FIX: Use StudentStatus.InProgress enum member with correct PascalCase casing.
        case StudentStatus.InProgress: return 'في المقابلة';
        // FIX: Use StudentStatus.Completed enum member with correct PascalCase casing.
        case StudentStatus.Completed: return 'مكتمل';
        default: return status;
    }
}

export default StudentLookup;
