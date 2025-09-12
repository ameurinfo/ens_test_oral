import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Student } from '../types';
import { StudentStatus } from '../types';

const CommitteeView: React.FC = () => {
    const { committeeId } = useParams<{ committeeId: string }>();
    const { criteria, getCommitteeById, getStudentsByCommitteeId, getCurrentStudent, getNextStudent, completeEvaluation } = useData();
    
    const id = parseInt(committeeId || '0');
    const committee = getCommitteeById(id);
    const committeeStudents = getStudentsByCommitteeId(id);
    const currentStudent = getCurrentStudent(id);
    const nextStudent = getNextStudent(id);
    const waitingQueue = committeeStudents.filter(s => s.status === StudentStatus.Waiting);

    const [scores, setScores] = useState<{ [key: number]: number }>({});
    const [notes, setNotes] = useState('');

    const resetForm = useCallback(() => {
        const initialScores: { [key: number]: number } = {};
        criteria.forEach(c => {
            initialScores[c.id] = c.maxScore / 2;
        });
        setScores(initialScores);
        setNotes('');
    }, [criteria]);

    useEffect(() => {
        resetForm();
    }, [currentStudent, resetForm]);

    const handleScoreChange = (criterionId: number, value: number) => {
        setScores(prev => ({ ...prev, [criterionId]: value }));
    };

    const handleSubmit = () => {
        if (!currentStudent) return;
        completeEvaluation(currentStudent.id, { scores, notes });
    };

    if (!committee) {
        return <div className="text-center text-red-500">لم يتم العثور على اللجنة</div>;
    }

    return (
        <div className="flex h-full gap-8">
            <div className="flex-1 bg-white p-8 rounded-xl shadow-lg">
                {currentStudent ? (
                    <div className="flex flex-col h-full">
                        <div className="mb-6 border-b pb-4">
                            <p className="text-sm text-gray-500">الطالب الحالي</p>
                            <h2 className="text-4xl font-bold text-blue-700">{currentStudent.name}</h2>
                            <p className="text-lg text-gray-600">رقم التسجيل: {currentStudent.id}</p>
                        </div>
                        
                        <div className="space-y-6 flex-grow overflow-y-auto pr-2">
                            {criteria.map(c => (
                                <div key={c.id}>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">{c.name}</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max={c.maxScore}
                                            value={scores[c.id] || 0}
                                            onChange={(e) => handleScoreChange(c.id, parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="font-bold text-blue-600 w-12 text-center">{scores[c.id] || 0} / {c.maxScore}</span>
                                    </div>
                                </div>
                            ))}
                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">ملاحظات إضافية</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="اكتب ملاحظاتك هنا..."
                                ></textarea>
                            </div>
                        </div>
                        
                        <div className="mt-auto pt-6 border-t">
                            <button 
                                onClick={handleSubmit}
                                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-lg"
                            >
                                إنهاء الجلسة والانتقال للطالب التالي
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-700">اكتملت جميع المقابلات لهذه اللجنة.</h2>
                        <p className="text-gray-500 mt-2">عمل رائع! تم تقييم جميع الطلبة في قائمة الانتظار.</p>
                    </div>
                )}
            </div>
            
            <div className="w-80 bg-white p-6 rounded-xl shadow-lg flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">قائمة الانتظار</h3>
                <div className="flex-grow overflow-y-auto pr-2">
                    {nextStudent && (
                        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg mb-4">
                            <p className="text-sm font-semibold text-blue-800">الطالب التالي</p>
                            <p className="text-lg font-bold text-blue-900">{nextStudent.name}</p>
                        </div>
                    )}
                    <ul className="space-y-3">
                        {waitingQueue.slice(nextStudent ? 1 : 0).map((student: Student) => (
                             <li key={student.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 flex justify-between items-center">
                                 <p className="font-semibold text-gray-800">{student.name}</p>
                                 <span className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                     #{student.id}
                                 </span>
                             </li>
                        ))}
                         {waitingQueue.length === 0 && !currentStudent && (
                             <li className="p-3 text-center text-gray-500">
                                لا يوجد طلبة في قائمة الانتظار.
                             </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CommitteeView;