import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Student, Committee, Criterion, Evaluation } from '../types';
import { StudentStatus } from '../types';
import { getInitialCommittees, getInitialCriteria, getInitialStudents } from '../services/mockApi';

const STUDENTS_STORAGE_KEY = 'oral_exam_students';
const COMMITTEES_STORAGE_KEY = 'oral_exam_committees';
const CRITERIA_STORAGE_KEY = 'oral_exam_criteria';

interface DataContextType {
    students: Student[];
    committees: Committee[];
    criteria: Criterion[];
    getCommitteeById: (id: number) => Committee | undefined;
    getStudentsByCommitteeId: (id: number) => Student[];
    getCurrentStudent: (id: number) => Student | undefined;
    getNextStudent: (id: number) => Student | undefined;
    completeEvaluation: (studentId: number, evaluation: Evaluation) => void;
    findStudentById: (studentId: string) => Student | undefined;
    addStudents: (newStudents: Student[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [committees, setCommittees] = useState<Committee[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);

    useEffect(() => {
        // Initialize data from localStorage or fall back to mock data
        const loadData = () => {
            try {
                const storedStudents = localStorage.getItem(STUDENTS_STORAGE_KEY);
                if (storedStudents) {
                    setStudents(JSON.parse(storedStudents));
                } else {
                    const initialStudents = getInitialStudents();
                    setStudents(initialStudents);
                    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(initialStudents));
                }

                const storedCommittees = localStorage.getItem(COMMITTEES_STORAGE_KEY);
                if (storedCommittees) {
                    setCommittees(JSON.parse(storedCommittees));
                } else {
                    const initialCommittees = getInitialCommittees();
                    setCommittees(initialCommittees);
                    localStorage.setItem(COMMITTEES_STORAGE_KEY, JSON.stringify(initialCommittees));
                }

                const storedCriteria = localStorage.getItem(CRITERIA_STORAGE_KEY);
                if (storedCriteria) {
                    setCriteria(JSON.parse(storedCriteria));
                } else {
                    const initialCriteria = getInitialCriteria();
                    setCriteria(initialCriteria);
                    localStorage.setItem(CRITERIA_STORAGE_KEY, JSON.stringify(initialCriteria));
                }
            } catch (error) {
                console.error("Failed to load data from localStorage", error);
                // Fallback to mock data if localStorage is corrupt
                setStudents(getInitialStudents());
                setCommittees(getInitialCommittees());
                setCriteria(getInitialCriteria());
            }
        };
        
        loadData();

        // Real-time sync listener for cross-tab updates
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === STUDENTS_STORAGE_KEY && event.newValue) {
                setStudents(JSON.parse(event.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    
    const updateStudentsStateAndStorage = (updatedStudents: Student[]) => {
        setStudents(updatedStudents);
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updatedStudents));
    }

    const addStudents = (newStudents: Student[]) => {
        const existingIds = new Set(students.map(s => s.id));
        const uniqueNewStudents = newStudents.filter(s => !existingIds.has(s.id));

        const updatedStudents = [...students, ...uniqueNewStudents];
        updateStudentsStateAndStorage(updatedStudents);
    };

    const getCommitteeById = (id: number): Committee | undefined => {
        return committees.find(c => c.id === id);
    };
    
    const getStudentsByCommitteeId = (id: number): Student[] => {
        return students.filter(s => s.committeeId === id).sort((a, b) => a.queuePosition - b.queuePosition);
    };

    const getCurrentStudent = (committeeId: number): Student | undefined => {
        const committeeStudents = getStudentsByCommitteeId(committeeId);
        return committeeStudents.find(s => s.status === StudentStatus.InProgress);
    }

    const getNextStudent = (committeeId: number): Student | undefined => {
        const committeeStudents = getStudentsByCommitteeId(committeeId);
        const waitingStudents = committeeStudents.filter(s => s.status === StudentStatus.Waiting);
        return waitingStudents.length > 0 ? waitingStudents[0] : undefined;
    }

    const completeEvaluation = (studentId: number, evaluation: Evaluation) => {
        const newStudents = [...students];
        const studentIndex = newStudents.findIndex(s => s.id === studentId);
        if (studentIndex === -1) return;
        
        const currentStudent = newStudents[studentIndex];
        
        newStudents[studentIndex] = { ...currentStudent, status: StudentStatus.Completed, evaluation };

        const committeeStudents = newStudents
            .filter(s => s.committeeId === currentStudent.committeeId && s.status === StudentStatus.Waiting)
            .sort((a, b) => a.queuePosition - b.queuePosition);

        if (committeeStudents.length > 0) {
            const nextStudentId = committeeStudents[0].id;
            const nextStudentIndex = newStudents.findIndex(s => s.id === nextStudentId);
            if(nextStudentIndex !== -1) {
                newStudents[nextStudentIndex] = { ...newStudents[nextStudentIndex], status: StudentStatus.InProgress };
            }
        }
        
        updateStudentsStateAndStorage(newStudents);
    };
    
    const findStudentById = (studentId: string): Student | undefined => {
        const id = parseInt(studentId, 10);
        if (isNaN(id)) return undefined;
        return students.find(s => s.id === id);
    };

    return (
        <DataContext.Provider value={{ students, committees, criteria, getCommitteeById, getStudentsByCommitteeId, getCurrentStudent, getNextStudent, completeEvaluation, findStudentById, addStudents }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};