
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { 
  getCourses, 
  getStudentAttendance, 
  getUsers, 
  getStudents, 
  getSubjects,
  saveSubjects,
  saveUsers,
  saveCourses,
  getAttendanceReports
} from "@/lib/data";
import type { Course, AttendanceRecord, User, Subject } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BookOpen, 
  User as UserIcon, 
  Users, 
  PlusCircle, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck,
  GraduationCap
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h2>
        {user.role === 'superadmin' || user.role === 'admin' ? (
          <SuperAdminDashboard />
        ) : user.role === 'faculty' ? (
          <FacultyDashboard user={user} />
        ) : (
          <StudentDashboard user={user} />
        )}
    </div>
  );
}

function DashboardSkeleton() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64" />
            </div>
        </div>
    );
}

function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const allUsers = getUsers();
  const subjects = getSubjects();
  const courses = getCourses();
  const students = allUsers.filter(u => u.role === 'student');
  const faculty = allUsers.filter(u => u.role === 'faculty');
  const pendingFaculty = faculty.filter(f => f.status === 'pending' || f.isApproved === false);
  const reports = getAttendanceReports();

  const handleApproveFaculty = (facultyId: string) => {
    const updatedUsers = allUsers.map(u => 
      u.id === facultyId ? { ...u, isApproved: true, status: 'active' as const } : u
    );
    saveUsers(updatedUsers);
    window.location.reload(); // Quick refresh for demo purposes
  };

  const handleRejectFaculty = (facultyId: string) => {
    const updatedUsers = allUsers.filter(u => u.id !== facultyId);
    saveUsers(updatedUsers);
    window.location.reload();
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex w-full overflow-x-auto justify-start md:justify-center">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="faculty">Faculty Approval</TabsTrigger>
        <TabsTrigger value="mapping">System Mapping</TabsTrigger>
        <TabsTrigger value="reports">All Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faculty.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingFaculty.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 md:col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.slice(0, 5).map(report => (
                  <div key={report.id} className="flex items-center">
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback className="bg-primary/5">{report.facultyName?.charAt(0) || "F"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1 overflow-hidden">
                      <p className="text-sm font-medium leading-none truncate">{report.facultyName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {report.courseName} ({report.class})
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs whitespace-nowrap">
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {reports.length === 0 && <p className="text-sm text-muted-foreground italic">No recent activity found.</p>}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start h-10 px-4" asChild>
                <Link href="/courses/new"><PlusCircle className="mr-2 h-4 w-4" /> Add New Course</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 px-4" onClick={() => (window.alert("Export functionality coming soon!"))}>
                <BookOpen className="mr-2 h-4 w-4" /> Generate Master Report
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 px-4">
               <ShieldCheck className="mr-2 h-4 w-4" /> System Audit Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="faculty">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Verification Requests</CardTitle>
            <CardDescription>Review and approve new faculty registrations.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[600px] md:min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingFaculty.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium whitespace-nowrap">{f.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{f.email}</TableCell>
                      <TableCell className="whitespace-nowrap">{f.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 whitespace-nowrap">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleApproveFaculty(f.id)} className="text-green-500 hover:text-green-600 border-green-200">
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRejectFaculty(f.id)} className="text-red-500 hover:text-red-600">
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingFaculty.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No pending approval requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="mapping">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Subjects Registry</CardTitle>
              <CardDescription>Available subjects in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map(s => (
                  <div key={s.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.code} | {s.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Course Mapping</CardTitle>
              <CardDescription>Mappings between subjects, faculty, and classes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map(c => (
                  <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="overflow-hidden mr-2">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Faculty ID: {c.facultyId} | Classes: {c.classes?.join(', ')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{c.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>All Attendance Reports</CardTitle>
            <CardDescription>Global view of all submitted attendance data.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[600px] md:min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Stats</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{r.courseName}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.class}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.facultyName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {r.attendance.filter(a => a.isPresent).length}/{r.attendance.length} Present
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm italic">
                        No reports generated yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function FacultyDashboard({ user }: { user: User }) {
  const courses = getCourses();
  const facultyCourses = courses.filter(c => c.facultyId === user.id);
  const theoryCourses = facultyCourses.filter(c => c.type === 'Theory');
  const practicalCourses = facultyCourses.filter(c => c.type === 'Practical');
  const facultyClasses = [...new Set(facultyCourses.flatMap(c => c.classes || []))];
  const totalStudents = getStudents().filter(s => facultyClasses.includes(s.class)).length;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facultyCourses.length}</div>
            <p className="text-xs text-muted-foreground">Courses you are teaching this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Students across all your classes</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Department</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.department}</div>
            <p className="text-xs text-muted-foreground">Your primary department</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Your Courses</CardTitle>
                <CardDescription>An overview of the courses you are teaching.</CardDescription>
            </div>
                <Button asChild>
                <Link href="/courses/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Course
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="theory">
                <TabsList className="mb-4">
                    <TabsTrigger value="theory">Theory</TabsTrigger>
                    <TabsTrigger value="practical">Practical</TabsTrigger>
                </TabsList>
                <TabsContent value="theory">
                    <CourseGrid courses={theoryCourses} />
                </TabsContent>
                <TabsContent value="practical">
                    <CourseGrid courses={practicalCourses} />
                </TabsContent>
            </Tabs>
        </CardContent>
       </Card>
    </>
  );
}

function CourseGrid({ courses }: { courses: Course[] }) {
    if (courses.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No courses found.</div>
    }
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
             <Image
                src={`https://placehold.co/600x400.png`}
                alt={course.name}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
                data-ai-hint="education textbook"
              />
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>{course.courseCode}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <div className="flex flex-wrap gap-1 mb-2">
                  {course.classes && course.classes.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {course.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/courses/${course.id}`}>
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
}

function StudentDashboard({ user }: { user: User }) {
  const [attendance, setAttendance] = useState<{ course: Course; records: AttendanceRecord[] }[]>([]);
  const courses = getCourses();
  
  useEffect(() => {
    if (user) {
        setAttendance(getStudentAttendance(user.id));
    }
  }, [user]);

  const calculateAttendancePercentage = (records: AttendanceRecord[]) => {
    if (records.length === 0) return 0;
    const presentCount = records.filter(r => r.isPresent).length;
    return (presentCount / records.length) * 100;
  }
  
  const overallPercentage = calculateAttendancePercentage(attendance.flatMap(a => a.records));

  const studentCourses = courses.filter(c => Array.isArray(c.classes) && c.classes.includes(user.class || ''));
  
  const getLastAbsentRecord = () => {
    const allRecords = attendance.flatMap(a => a.records.map(r => ({...r, courseName: a.course.name})));
    const absentRecords = allRecords.filter(r => !r.isPresent);
    if(absentRecords.length === 0) return null;
    absentRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return absentRecords[0];
  }

  const lastAbsent = getLastAbsentRecord();


  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <Progress value={overallPercentage} className="h-2 w-20" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCourses.length}</div>
            <p className="text-xs text-muted-foreground">Courses this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Absent</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lastAbsent ? (
                <>
                    <div className="text-2xl font-bold">{lastAbsent.courseName}</div>
                    <p className="text-xs text-muted-foreground">on {new Date(lastAbsent.date).toLocaleDateString()}</p>
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">No absences recorded yet!</p>
                </>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
            <CardDescription>Your attendance status in each course.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {attendance.map(({ course, records }) => {
                const percentage = calculateAttendancePercentage(records);
                return (
                  <div key={course.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
