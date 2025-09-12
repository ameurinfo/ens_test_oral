
import React from 'react';
import { HashRouter, Route, Routes, NavLink, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import AdminDashboard from './views/AdminDashboard';
import CommitteeView from './views/CommitteeView';
import PublicScreen from './views/PublicScreen';
import StudentLookup from './views/StudentLookup';

const App: React.FC = () => {
    return (
        <DataProvider>
            <HashRouter>
                <div className="bg-gray-100 min-h-screen font-sans">
                    <MainContent />
                </div>
            </HashRouter>
        </DataProvider>
    );
};

const MainContent: React.FC = () => {
    const location = useLocation();
    const isPublicView = location.pathname.startsWith('/public') || location.pathname.startsWith('/student');

    if (isPublicView) {
        return (
             <Routes>
                <Route path="/public/:committeeId" element={<PublicScreen />} />
                <Route path="/student" element={<StudentLookup />} />
            </Routes>
        );
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/committee/:committeeId" element={<CommitteeView />} />
                </Routes>
            </main>
        </div>
    );
};

const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-white text-gray-800 p-4 shadow-lg flex flex-col">
            <h1 className="text-2xl font-bold text-blue-700 mb-8 text-center">
                نظام المسابقة
            </h1>
            <nav className="flex flex-col space-y-2">
                <NavLink to="/" className={({ isActive }) => `flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-blue-50 ${isActive ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}>
                     <HomeIcon />
                    <span>لوحة التحكم الرئيسية</span>
                </NavLink>
                <h2 className="text-sm font-semibold text-gray-500 mt-4 px-3 uppercase">واجهة اللجان</h2>
                <NavLink to="/committee/1" className={({ isActive }) => `flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-blue-50 ${isActive ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}>
                    <UsersIcon />
                    <span>لجنة علوم الحاسوب</span>
                </NavLink>
                 <NavLink to="/committee/2" className={({ isActive }) => `flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-blue-50 ${isActive ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}>
                    <UsersIcon />
                    <span>لجنة الرياضيات</span>
                </NavLink>
                <h2 className="text-sm font-semibold text-gray-500 mt-4 px-3 uppercase">شاشات العرض</h2>
                <a href="#/public/1" target="_blank" className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-blue-50">
                    <TvIcon />
                    <span>شاشة قاعة 1 (حاسوب)</span>
                </a>
                <a href="#/public/2" target="_blank" className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-blue-50">
                    <TvIcon />
                    <span>شاشة قاعة 2 (رياضيات)</span>
                </a>
                <h2 className="text-sm font-semibold text-gray-500 mt-4 px-3 uppercase">الطلبة</h2>
                 <a href="#/student" target="_blank" className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg hover:bg-blue-50">
                    <UserSearchIcon />
                    <span>بحث عن طالب</span>
                </a>
            </nav>
        </aside>
    );
};

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const TvIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const UserSearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12a4 4 0 11-8 0 4 4 0 018 0zm-4 8a4 4 0 110-8 4 4 0 010 8z" /></svg>


export default App;
