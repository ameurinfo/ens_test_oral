import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { StudentStatus } from '../types';
import type { Student } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const StudentImporter: React.FC = () => {
    const { addStudents, students, getStudentsByCommitteeId } = useData();
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setCsvFile(event.target.files[0]);
            setFeedback(null);
        }
    };

    const handleImport = () => {
        if (!csvFile) {
            setFeedback({ type: 'error', message: 'الرجاء اختيار ملف أولاً.' });
            return;
        }
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const rows = text.split('\n').filter(row => row.trim() !== '');
                const header = rows.shift()?.trim().split(',').map(h => h.trim());
                
                if (!header || !['id', 'name', 'specialty', 'committeeId'].every(h => header.includes(h))) {
                    throw new Error('ملف CSV يجب أن يحتوي على الأعمدة: id, name, specialty, committeeId');
                }

                const existingIds = new Set(students.map(s => s.id));
                
                const newStudents: Student[] = rows.map((row, index) => {
                    const values = row.trim().split(',');
                    const studentData: any = {};
                    header.forEach((h, i) => studentData[h] = values[i]?.trim());
                    
                    const id = parseInt(studentData.id, 10);
                    const committeeId = parseInt(studentData.committeeId, 10);

                    if (isNaN(id) || isNaN(committeeId)) throw new Error(`خطأ في السطر ${index + 2}: ID و committeeId يجب أن تكون أرقام.`);
                    if (!studentData.name) throw new Error(`خطأ في السطر ${index + 2}: الاسم مطلوب.`);
                    if (existingIds.has(id)) throw new Error(`خطأ في السطر ${index + 2}: رقم التسجيل ${id} موجود بالفعل.`);
                    
                    const committeeStudents = getStudentsByCommitteeId(committeeId);
                    const maxQueuePos = Math.max(0, ...committeeStudents.map(s => s.queuePosition));

                    return {
                        id,
                        name: studentData.name,
                        specialty: studentData.specialty || 'غير محدد',
                        committeeId,
                        status: StudentStatus.Waiting,
                        queuePosition: maxQueuePos + 1,
                    };
                });
                
                addStudents(newStudents);
                setFeedback({ type: 'success', message: `تم استيراد ${newStudents.length} طالب بنجاح!` });
                setCsvFile(null);
            } catch (error: any) {
                setFeedback({ type: 'error', message: error.message || 'حدث خطأ أثناء معالجة الملف.' });
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setIsLoading(false);
            setFeedback({ type: 'error', message: 'فشل في قراءة الملف.' });
        }
        reader.readAsText(csvFile);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-700 mb-4">استيراد الطلبة</h2>
            <p className="text-gray-500 mb-4">
                قم برفع ملف CSV لإضافة طلبة جدد للنظام. يجب أن يحتوي الملف على الأعمدة التالية: 
                <code className="bg-gray-200 p-1 rounded text-sm">id,name,specialty,committeeId</code>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="flex-grow p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={handleImport}
                    disabled={isLoading || !csvFile}
                    className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'جاري الاستيراد...' : 'استيراد'}
                </button>
            </div>
            {feedback && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback.message}
                </div>
            )}
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    const { students, committees } = useData();

    const totalStudents = students.length;
    const completedStudents = students.filter(s => s.status === StudentStatus.Completed).length;
    const remainingStudents = totalStudents - completedStudents;

    const committeeStats = committees.map(committee => {
        const committeeStudents = students.filter(s => s.committeeId === committee.id);
        const total = committeeStudents.length;
        const completed = committeeStudents.filter(s => s.status === StudentStatus.Completed).length;
        return {
            name: committee.name,
            'أنجزوا': completed,
            'متبقي': total - completed,
        };
    });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم الرئيسية</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="إجمالي الطلبة" value={totalStudents} icon={<UsersGroupIcon />} color="blue" />
                <StatCard title="الطلبة الممتحَنون" value={completedStudents} icon={<UserCheckIcon />} color="green" />
                <StatCard title="الطلبة المتبقون" value={remainingStudents} icon={<UserClockIcon />} color="orange" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                 <h2 className="text-xl font-bold text-gray-700 mb-4">تقدم اللجان</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={committeeStats} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-10} textAnchor="end" height={50} />
                        <YAxis allowDecimals={false} />
                        <Tooltip wrapperStyle={{direction: 'rtl'}} contentStyle={{ fontFamily: 'Tajawal' }} />
                        <Legend wrapperStyle={{ fontFamily: 'Tajawal' }} />
                        <Bar dataKey="أنجزوا" fill="#22c55e" name="أنجزوا" />
                        <Bar dataKey="متبقي" fill="#f97316" name="متبقي" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <StudentImporter />

        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 rtl:space-x-reverse">
            <div className={`p-4 rounded-full ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-md">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

const UsersGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UserCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default AdminDashboard;