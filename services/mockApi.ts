
import type { Student, Committee, Criterion } from '../types';
import { StudentStatus } from '../types';

export const getInitialStudents = (): Student[] => {
    const students: Student[] = [
        { id: 101, name: 'أحمد محمود', specialty: 'علوم الحاسوب', committeeId: 1, status: StudentStatus.InProgress, queuePosition: 1 },
        { id: 102, name: 'فاطمة الزهراء', specialty: 'علوم الحاسوب', committeeId: 1, status: StudentStatus.Waiting, queuePosition: 2 },
        { id: 103, name: 'علي حسن', specialty: 'علوم الحاسوب', committeeId: 1, status: StudentStatus.Waiting, queuePosition: 3 },
        { id: 104, name: 'مريم خالد', specialty: 'علوم الحاسوب', committeeId: 1, status: StudentStatus.Waiting, queuePosition: 4 },
        { id: 105, name: 'يوسف عبد الله', specialty: 'علوم الحاسوب', committeeId: 1, status: StudentStatus.Completed, queuePosition: 0, evaluation: {scores: {1: 18, 2: 15, 3: 17}, notes: 'أداء ممتاز'} },
        { id: 106, name: 'سارة إبراهيم', specialty: 'علوم الحاسوب', committeeId: 1, status: StudentStatus.Waiting, queuePosition: 5 },
        { id: 201, name: 'خالد وليد', specialty: 'الرياضيات', committeeId: 2, status: StudentStatus.InProgress, queuePosition: 1 },
        { id: 202, name: 'نور الهدى', specialty: 'الرياضيات', committeeId: 2, status: StudentStatus.Waiting, queuePosition: 2 },
        { id: 203, name: 'عمر فاروق', specialty: 'الرياضيات', committeeId: 2, status: StudentStatus.Waiting, queuePosition: 3 },
        { id: 204, name: 'زينب مصطفى', specialty: 'الرياضيات', committeeId: 2, status: StudentStatus.Completed, queuePosition: 0, evaluation: {scores: {1: 14, 2: 16, 3: 15}, notes: 'يحتاج للتركيز أكثر'} },
        { id: 205, name: 'عبد الرحمن سعيد', specialty: 'الرياضيات', committeeId: 2, status: StudentStatus.Waiting, queuePosition: 4 },
    ];
    return students;
};

export const getInitialCommittees = (): Committee[] => {
    const committees: Committee[] = [
        { id: 1, name: 'لجنة علوم الحاسوب', specialty: 'علوم الحاسوب', members: ['د. محمد صالح', 'د. عائشة بكر', 'م. هند رضا'] },
        { id: 2, name: 'لجنة الرياضيات', specialty: 'الرياضيات', members: ['د. جمال فتحي', 'د. ليلى مراد'] },
    ];
    return committees;
};

export const getInitialCriteria = (): Criterion[] => {
    const criteria: Criterion[] = [
        { id: 1, name: 'المحتوى العلمي والمعرفي', maxScore: 20 },
        { id: 2, name: 'الطلاقة وسلامة النطق', maxScore: 20 },
        { id: 3, name: 'الثقة بالنفس ولغة الجسد', maxScore: 20 },
        { id: 4, name: 'القدرة على التحليل والاستنتاج', maxScore: 20 },
    ];
    return criteria;
};
