
export type Role = 'student' | 'faculty' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  department?: string;
  class?: string;
  avatarUrl?: string;
  mobileNumber?: string;
  rollNumber?: string;
  isApproved?: boolean;
  status?: 'active' | 'pending' | 'inactive';
}

export interface Course {
  id: string;
  name: string;
  code: string;
  courseCode?: string; // Some parts of the app use code, others courseCode
  facultyId: string;
  classes: string[];
  subjectId?: string;
  type: 'Theory' | 'Practical';
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  isPresent: boolean;
  class?: string;
}

export interface AttendanceReport {
  id: string;
  courseId: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  date: string;
  class: string;
  attendance: {
    studentId: string;
    studentName: string;
    isPresent: boolean;
  }[];
}

export interface Notification {
  id: string;
  studentId: string;
  message: string;
  type: 'attendance_alert' | 'general';
  timestamp: string;
  isRead: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
}
