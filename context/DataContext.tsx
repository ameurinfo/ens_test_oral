import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Student, Committee, Criterion, Evaluation } from '../types';
import { StudentStatus } from '../types';
import { getInitialCommittees, getInitialCriteria, getInitialStudents } from '../services/mockApi';

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [committees, setCommittees] = useState<Committee[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);

    useEffect(() => {
        setStudents(getInitialStudents());
        setCommittees(getInitialCommittees());
        setCriteria(getInitialCriteria());
    }, []);

    const getCommitteeById = (id: number): Committee | undefined => {
        return committees.find(c => c.id === id);
    };
    
    const getStudentsByCommitteeId = (id: number): Student[] => {
        return students.filter(s => s.committeeId === id).sort((a, b) => a.queuePosition - b.queuePosition);
    };

    const getCurrentStudent = (committeeId: number): Student | undefined => {
        const committeeStudents = getStudentsByCommitteeId(committeeId);
        // FIX: Use StudentStatus enum for type safety and consistency.
        return committeeStudents.find(s => s.status === StudentStatus.InProgress);
    }

    const getNextStudent = (committeeId: number): Student | undefined => {
        const committeeStudents = getStudentsByCommitteeId(committeeId);
        // FIX: Use StudentStatus enum for type safety and consistency.
        const waitingStudents = committeeStudents.filter(s => s.status === StudentStatus.Waiting);
        return waitingStudents.length > 0 ? waitingStudents[0] : undefined;
    }

    const completeEvaluation = (studentId: number, evaluation: Evaluation) => {
        setStudents(prevStudents => {
            const newStudents = [...prevStudents];
            const studentIndex = newStudents.findIndex(s => s.id === studentId);
            if (studentIndex === -1) return prevStudents;
            
            const currentStudent = newStudents[studentIndex];
            
            // Mark current student as completed
            // FIX: Use StudentStatus enum to fix "Type '...' is not assignable to type 'StudentStatus'" error.
            newStudents[studentIndex] = { ...currentStudent, status: StudentStatus.Completed, evaluation };

            // Find next waiting student for the same committee and mark as in progress
            const committeeStudents = newStudents
                // FIX: Use StudentStatus enum for type safety and consistency.
                .filter(s => s.committeeId === currentStudent.committeeId && s.status === StudentStatus.Waiting)
                .sort((a, b) => a.queuePosition - b.queuePosition);

            if (committeeStudents.length > 0) {
                const nextStudentId = committeeStudents[0].id;
                const nextStudentIndex = newStudents.findIndex(s => s.id === nextStudentId);
                if(nextStudentIndex !== -1) {
                    // FIX: Use StudentStatus enum to fix "Type '...' is not assignable to type 'StudentStatus'" error.
                    newStudents[nextStudentIndex] = { ...newStudents[nextStudentIndex], status: StudentStatus.InProgress };
                }
            }

            return newStudents;
        });
    };
    
    const findStudentById = (studentId: string): Student | undefined => {
        const id = parseInt(studentId, 10);
        if (isNaN(id)) return undefined;
        return students.find(s => s.id === id);
    };

    return (
        <DataContext.Provider value={{ students, committees, criteria, getCommitteeById, getStudentsByCommitteeId, getCurrentStudent, getNextStudent, completeEvaluation, findStudentById }}>
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
