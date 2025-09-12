import React, { useEffect, useState, memo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Student } from '../types';

const QueueItem: React.FC<{ student: Student, index: number }> = ({ student, index }) => {
    const baseStyle = "p-4 rounded-lg transition-all duration-300";
    const highlightStyle = index === 0 
        ? "bg-green-600 shadow-lg scale-105" 
        : "bg-gray-700";
    
    return (
        <div 
            className={`${baseStyle} ${highlightStyle} animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex justify-between items-baseline">
                <p className={`text-3xl font-bold truncate ${index === 0 ? 'text-white' : 'text-gray-100'}`}>
                    {index + 1}. {student.name}
                </p>
                <span className={`text-lg font-mono flex-shrink-0 ml-4 ${index === 0 ? 'text-green-200' : 'text-gray-400'}`}>
                    #{student.id}
                </span>
            </div>
        </div>
    );
};

const QueueList = memo(({ queue }: { queue: Student[] }) => (
    <div className="space-y-4">
        {queue.length > 0 ? (
            queue.slice(0, 5).map((student, index) => (
                <QueueItem key={student.id} student={student} index={index} />
            ))
        ) : (
            <div className="text-center text-gray-400 text-2xl pt-10">
                القائمة فارغة
            </div>
        )}
    </div>
));


const PublicScreen: React.FC = () => {
    const { committeeId } = useParams<{ committeeId: string }>();
    const { getCommitteeById, getStudentsByCommitteeId, getCurrentStudent } = useData();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const id = parseInt(committeeId || '0');
    const committee = getCommitteeById(id);
    const currentStudent = getCurrentStudent(id);
    const waitingQueue = getStudentsByCommitteeId(id).filter(s => s.status === 'WAITING');

    if (!committee) {
        return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center text-4xl">لم يتم العثور على اللجنة</div>;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col p-10">
            <header className="flex justify-between items-center border-b-2 border-gray-700 pb-4">
                <div>
                    <h1 className="text-5xl font-bold">{committee.name}</h1>
                    <p className="text-2xl text-blue-300">{committee.specialty}</p>
                </div>
                <div className="text-4xl font-mono text-right">
                    {time.toLocaleTimeString('ar-EG')}
                </div>
            </header>

            <main className="flex-1 grid grid-cols-3 gap-10 pt-10">
                <div className="col-span-2 bg-blue-800 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-12">
                     <p className="text-4xl text-blue-200 mb-4">الطالب الحالي في المقابلة</p>
                    {currentStudent ? (
                        <>
                           <h2 className="text-8xl font-bold animate-pulse">{currentStudent.name}</h2>
                           <p className="text-5xl text-gray-300 mt-4">رقم: {currentStudent.id}</p>
                        </>
                    ) : (
                         <h2 className="text-7xl font-bold text-gray-400">لا يوجد طالب حالياً</h2>
                    )}
                </div>

                <div className="col-span-1 bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col">
                    <h3 className="text-4xl font-bold mb-6 text-center">قائمة الانتظار</h3>
                    <div className="flex-grow overflow-y-auto">
                        <QueueList queue={waitingQueue} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PublicScreen;