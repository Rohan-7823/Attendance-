import type { User, Course, Student, AttendanceRecord, AttendanceReport, Notification } from './types';

// This will now act as our in-memory "database" with localStorage synchronization
let users: User[] = [];
let courses: Course[] = [];
let attendance: AttendanceRecord[] = [];
let courseStudents: Record<string, Student[]> = {};
let attendanceReports: AttendanceReport[] = [];
let notifications: Notification[] = [];

// Flag to ensure initialization only runs once
let isInitialized = false;

// --- Data Persistence Synchronization ---
function saveDataToSession() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('attendease_users', JSON.stringify(users));
      localStorage.setItem('attendease_courses', JSON.stringify(courses));
      localStorage.setItem('attendease_attendance', JSON.stringify(attendance));
      localStorage.setItem('attendease_courseStudents', JSON.stringify(courseStudents));
      localStorage.setItem('attendease_reports', JSON.stringify(attendanceReports));
      localStorage.setItem('attendease_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }
}

function ensureInitialized() {
  if (isInitialized) {
    return;
  }

  if (typeof window !== 'undefined') {
    try {
      const savedUsers = localStorage.getItem('attendease_users');
      if (savedUsers) {
        users = JSON.parse(savedUsers);
        
        const savedCourses = localStorage.getItem('attendease_courses');
        if (savedCourses) courses = JSON.parse(savedCourses);
        
        const savedAttendance = localStorage.getItem('attendease_attendance');
        if (savedAttendance) attendance = JSON.parse(savedAttendance);
         
        const savedCourseStudents = localStorage.getItem('attendease_courseStudents');
        if (savedCourseStudents) courseStudents = JSON.parse(savedCourseStudents);
        
        const savedReports = localStorage.getItem('attendease_reports');
        if (savedReports) attendanceReports = JSON.parse(savedReports);
        
        const savedNotifications = localStorage.getItem('attendease_notifications');
        if (savedNotifications) notifications = JSON.parse(savedNotifications);
        
        isInitialized = true;
        return;
      }
    } catch (error) {
      console.error('Failed to load persisted data from localStorage:', error);
    }
  }

  // Fallback to initial mock data if not initialized or if in SSR mode
  initializeData();
}

// --- Notification Management ---
export const getNotificationsForStudent = (studentId: string): Notification[] => {
    ensureInitialized();
    return notifications.filter(n => n.studentId === studentId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const saveNotifications = (newNotifications: Notification[]) => {
    ensureInitialized();
    notifications.push(...newNotifications);
    saveDataToSession();
    console.log("Saved notifications:", newNotifications); // For debugging
}

// --- Student Management for Courses ---
export const getStudentsForCourse = (courseId: string): Student[] => {
    ensureInitialized();
    return courseStudents[courseId] || [];
}

export const saveStudentsForCourse = (courseId: string, students: Student[]) => {
    ensureInitialized();
    courseStudents[courseId] = students;
    saveDataToSession();
}

export const addStudentsToClass = (className: string, newStudents: { name: string, rollNumber: string }[]): { added: number, skipped: number } => {
    ensureInitialized();
    const allUsers = getUsers(); // Get current users
    const existingStudentsInClass = allUsers.filter(u => u.role === 'student' && u.class === className);
    const newUsers: User[] = [];
    let addedCount = 0;
    let skippedCount = 0;

    newStudents.forEach(student => {
        const studentExists = existingStudentsInClass.some(u => u.rollNumber === student.rollNumber);
        if (!studentExists) {
            const newUser: User = {
                id: `user-${Date.now()}-${student.rollNumber}`,
                name: student.name,
                rollNumber: student.rollNumber,
                email: `${student.name.toLowerCase().replace(/\s/g,'.')}.${student.rollNumber}@example.com`,
                password: 'password123',
                role: 'student',
                class: className,
                department: 'Imported',
                avatarUrl: 'https://placehold.co/100x100.png',
            };
            newUsers.push(newUser);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    if (newUsers.length > 0) {
        users = [...users, ...newUsers];
        saveDataToSession();
    }

    return { added: addedCount, skipped: skippedCount };
}

export const getStudentsByClass = (className: string): Student[] => {
  ensureInitialized();
  return users.filter(u => u.role === 'student' && u.class === className).map(u => ({
    id: u.id,
    name: u.name,
    rollNumber: u.rollNumber || `S${u.id.replace('student', '')}`, // Generate a sample roll number
    class: u.class || 'N/A'
  }));
}

export const getStudents = (): Student[] => {
  ensureInitialized();
  return users.filter(u => u.role === 'student').map(u => ({
    id: u.id,
    name: u.name,
    rollNumber: u.rollNumber || `S${u.id.replace('student', '')}`, // Generate a sample roll number
    class: u.class || 'N/A'
  }));
}

// --- User Management ---
export const getUsers = (): User[] => {
  ensureInitialized();
  return users;
};

export const saveUsers = (newUsers: User[]) => {
  ensureInitialized();
  users = newUsers;
  saveDataToSession();
};

// --- Course Management ---
export const getCourses = (): Course[] => {
    ensureInitialized();
    return courses;
};

export const saveCourses = (newCourses: Course[]) => {
  ensureInitialized();
  courses = newCourses;
  saveDataToSession();
};

// --- Attendance Management ---
export const getAttendance = (): AttendanceRecord[] => {
    ensureInitialized();
    return attendance;
}

export const saveAttendance = (newAttendance: AttendanceRecord[]) => {
    ensureInitialized();
    attendance = newAttendance;
    saveDataToSession();
}

// --- Attendance Report Management ---
export const getAttendanceReports = (): AttendanceReport[] => {
    ensureInitialized();
    return attendanceReports;
}

export const getAttendanceReportById = (reportId: string): AttendanceReport | undefined => {
    ensureInitialized();
    return attendanceReports.find(r => r.id === reportId);
}

export const saveAttendanceReport = (report: AttendanceReport) => {
    ensureInitialized();
    attendanceReports.push(report);
    // Also save the individual records for historical data
    const newAttendanceRecords = report.attendance.map(att => ({
        id: `att-${report.id}-${att.studentId}`,
        courseId: report.courseId,
        studentId: att.studentId,
        date: report.date,
        isPresent: att.isPresent,
        class: report.class,
    }));
    attendance.push(...newAttendanceRecords);
    saveDataToSession();
}

// --- Helper Functions for Data Querying ---
export const getStudentAttendance = (studentId: string): { course: Course; records: AttendanceRecord[] }[] => {
  ensureInitialized();
  const student = users.find(u => u.id === studentId);
  if (!student) return [];
  
  return courses
    .filter(course => Array.isArray(course.classes) && course.classes.includes(student.class || ''))
    .map(course => ({
        course,
        records: attendance.filter(att => att.studentId === studentId && att.courseId === course.id),
    }));
};

export const getCourseAttendance = (courseId: string): AttendanceRecord[] => {
  ensureInitialized();
  return attendance.filter(att => att.courseId === courseId);
};

function initializeData() {
  if (isInitialized) {
    return;
  }

  users = [
    {
      id: 'student1',
      rollNumber: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      class: 'SE CSE A',
      avatarUrl: 'https://placehold.co/100x100.png',
      mobileNumber: '9876543210'
    },
    {
      id: 'student2',
      rollNumber: '2',
      name: 'Bob Williams',
      email: 'bob@example.com',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      class: 'SE CSE A',
      avatarUrl: 'https://placehold.co/100x100.png',
      mobileNumber: '9876543211'
    },
     {
      id: 'student3',
      rollNumber: '3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      class: 'SE CSE B',
      avatarUrl: 'https://placehold.co/100x100.png',
      mobileNumber: '9876543212'
    },
    {
      id: 'faculty1',
      name: 'Dr. Evelyn Reed',
      email: 'evelyn@example.com',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science',
      avatarUrl: 'https://placehold.co/100x100.png',
    },
  ];

  const defaultCourse: Course = {
    id: 'course-1',
    name: 'Data Structures',
    courseCode: 'CS301',
    facultyId: 'faculty1',
    facultyName: 'Dr. Evelyn Reed',
    classes: ['SE CSE A', 'SE CSE B'],
    totalLectures: 40,
    description: 'An introductory course on fundamental data structures.',
    type: 'Theory',
  };
  courses = [defaultCourse];

  // Correctly get students for the default course
  const allStudents = users.filter(u => u.role === 'student');
  courseStudents[defaultCourse.id] = allStudents
    .filter(s => defaultCourse.classes.includes(s.class || ''))
    .map(u => ({
        id: u.id,
        rollNumber: u.rollNumber || `S${u.id.replace('student','')}`,
        name: u.name,
        class: u.class || 'N/A'
    }));

  saveDataToSession();
  isInitialized = true;
}

// Initialize data as soon as this module is loaded
ensureInitialized();
