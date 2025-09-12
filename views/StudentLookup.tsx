
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Student } from '../types';

const StudentLookup: React.FC = () => {
    const [studentId, setStudentId] = useState('');
    const [foundStudent, setFoundStudent] = useState<Student | null>(null);
    const [error, setError] = useState('');
    const { findStudentById, getStudentsByCommitteeId } = useData();

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
        if (student.status === 'COMPLETED') {
            return { positionText: 'لقد أكملت مقابلتك بنجاح.', waitText: 'نتمنى لك كل التوفيق!' };
        }
        if (student.status === 'IN_PROGRESS') {
            return { positionText: 'أنت حالياً في المقابلة.', waitText: 'حظاً موفقاً!' };
        }

        const committeeQueue = getStudentsByCommitteeId(student.committeeId)
            .filter(s => s.status === 'WAITING' || s.status === 'IN_PROGRESS')
            .sort((a,b) => a.queuePosition - b.queuePosition);
        
        const myIndex = committeeQueue.findIndex(s => s.id === student.id);
        
        if(myIndex === -1) {
             return { positionText: 'أنت في قائمة الانتظار.', waitText: 'سيتم تحديد دورك قريباً.' };
        }
        
        const position = myIndex; // 0 means next
        const estimatedWait = position * 5; // Assuming 5 minutes per student

        return {
            positionText: `أنت رقم ${position + 1} في الطابور.`,
            waitText: `الوقت التقديري المتبقي للانتظار: ${estimatedWait} دقيقة.`
        };
    };

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
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="أدخل رقم التسجيل هنا"
                            className="w-full text-center p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                
                {foundStudent && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800">مرحباً, {foundStudent.name}</h2>
                        <div className="mt-4 text-center space-y-4">
                            <div className={`p-6 rounded-lg ${foundStudent.status === 'COMPLETED' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                <p className="text-xl font-bold text-blue-800">
                                    {getQueuePositionInfo(foundStudent).positionText}
                                </p>
                                <p className="text-md text-gray-600 mt-1">
                                    {getQueuePositionInfo(foundStudent).waitText}
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

const UserSearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

const translateStatus = (status: string) => {
    switch (status) {
        case 'WAITING': return 'في الانتظار';
        case 'IN_PROGRESS': return 'في المقابلة';
        case 'COMPLETED': return 'مكتمل';
        default: return status;
    }
}

export default StudentLookup;
