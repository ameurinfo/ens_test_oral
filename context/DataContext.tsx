import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { Student, Committee, Criterion, Evaluation } from '../types';
import { StudentStatus } from '../types';
import { getInitialStudents, getInitialCommittees, getInitialCriteria } from '../services/mockApi';

interface DataContextType {
    students: Student[];
    committees: Committee[];
    criteria: Criterion[];
    isLoading: boolean;
    getCommitteeById: (id: number) => Committee | undefined;
    getStudentsByCommitteeId: (id: number) => Student[];
    getCurrentStudent: (id: number) => Student | undefined;
    getNextStudent: (id: number) => Student | undefined;
    completeEvaluation: (studentId: number, evaluation: Evaluation) => void;
    findStudentById: (studentId: string) => Student | undefined;
    addStudents: (newStudents: Student[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost/api';
const LOCAL_STORAGE_KEYS = {
    students: 'oral_exam_students',
    committees: 'oral_exam_committees',
    criteria: 'oral_exam_criteria',
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [committees, setCommittees] = useState<Committee[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStudents = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/students`);
            if (!response.ok) throw new Error('Network response for students was not ok.');
            const data: Student[] = await response.json();
            setStudents(data);
            localStorage.setItem(LOCAL_STORAGE_KEYS.students, JSON.stringify(data));
        } catch (error) {
            console.warn("Polling for students failed, using stale data:", error);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // API First
                console.log("Attempting to fetch data from API...");
                const [committeesRes, criteriaRes, studentsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/committees`),
                    fetch(`${API_BASE_URL}/criteria`),
                    fetch(`${API_BASE_URL}/students`),
                ]);

                if (!committeesRes.ok || !criteriaRes.ok || !studentsRes.ok) {
                    throw new Error('Failed to fetch initial data from API.');
                }

                const committeesData = await committeesRes.json();
                const criteriaData = await criteriaRes.json();
                const studentsData = await studentsRes.json();
                
                setCommittees(committeesData);
                setCriteria(criteriaData);
                setStudents(studentsData);

                localStorage.setItem(LOCAL_STORAGE_KEYS.committees, JSON.stringify(committeesData));
                localStorage.setItem(LOCAL_STORAGE_KEYS.criteria, JSON.stringify(criteriaData));
                localStorage.setItem(LOCAL_STORAGE_KEYS.students, JSON.stringify(studentsData));
                console.log("Successfully loaded data from API.");

            } catch (err) {
                console.warn("API fetch failed. Attempting to load from localStorage.", err);
                // Fallback to localStorage
                try {
                    const localCommittees = localStorage.getItem(LOCAL_STORAGE_KEYS.committees);
                    const localCriteria = localStorage.getItem(LOCAL_STORAGE_KEYS.criteria);
                    const localStudents = localStorage.getItem(LOCAL_STORAGE_KEYS.students);

                    if (localCommittees && localCriteria && localStudents) {
                        setCommittees(JSON.parse(localCommittees));
                        setCriteria(JSON.parse(localCriteria));
                        setStudents(JSON.parse(localStudents));
                        console.log("Successfully loaded data from localStorage.");
                    } else {
                        // Fallback to Mock Data
                        console.warn("localStorage is empty. Loading initial mock data.");
                        const mockCommittees = getInitialCommittees();
                        const mockCriteria = getInitialCriteria();
                        const mockStudents = getInitialStudents();

                        setCommittees(mockCommittees);
                        setCriteria(mockCriteria);
                        setStudents(mockStudents);

                        localStorage.setItem(LOCAL_STORAGE_KEYS.committees, JSON.stringify(mockCommittees));
                        localStorage.setItem(LOCAL_STORAGE_KEYS.criteria, JSON.stringify(mockCriteria));
                        localStorage.setItem(LOCAL_STORAGE_KEYS.students, JSON.stringify(mockStudents));
                    }
                } catch (storageError) {
                    console.error("Failed to load from localStorage or mock data:", storageError);
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        loadInitialData();

        const intervalId = setInterval(fetchStudents, 3000);

        return () => {
            clearInterval(intervalId);
        };
    }, [fetchStudents]);

    const addStudents = async (newStudents: Student[]) => {
        const studentsToImport = newStudents.map(({ id, name, specialty, committeeId }) => ({
            id, name, specialty, committeeId
        }));

        try {
            const response = await fetch(`${API_BASE_URL}/students/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(studentsToImport),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to import students');
            }
            
            await fetchStudents();
        } catch (error) {
            console.error('Error importing students:', error);
            throw error;
        }
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

    const completeEvaluation = async (studentId: number, evaluation: Evaluation) => {
        try {
            const response = await fetch(`${API_BASE_URL}/students/${studentId}/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(evaluation),
            });

            if (!response.ok) {
                throw new Error('Failed to submit evaluation');
            }
            
            await fetchStudents();
        } catch (error) {
            console.error('Error completing evaluation:', error);
        }
    };
    
    const findStudentById = (studentId: string): Student | undefined => {
        const id = parseInt(studentId, 10);
        if (isNaN(id)) return undefined;
        return students.find(s => s.id === id);
    };

    return (
        <DataContext.Provider value={{ students, committees, criteria, isLoading, getCommitteeById, getStudentsByCommitteeId, getCurrentStudent, getNextStudent, completeEvaluation, findStudentById, addStudents }}>
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