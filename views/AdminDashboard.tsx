
import React from 'react';
import { useData } from '../context/DataContext';
import { StudentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
