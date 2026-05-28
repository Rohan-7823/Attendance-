
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { getUsers, saveUsers } from "@/lib/data";
import { User } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, UserCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function FacultyVerificationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
      return;
    }
    if (user && user.role !== "superadmin" && user.role !== "admin") {
      router.push("/dashboard");
    }
    setAllUsers(getUsers());
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const faculty = allUsers.filter(u => u.role === 'faculty');
  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveFaculty = (facultyId: string) => {
    const updatedUsers = allUsers.map(u => 
      u.id === facultyId ? { ...u, isApproved: true, status: 'active' as const } : u
    );
    saveUsers(updatedUsers);
    setAllUsers(updatedUsers);
  };

  const handleRejectFaculty = (facultyId: string) => {
    const updatedUsers = allUsers.filter(u => u.id !== facultyId);
    saveUsers(updatedUsers);
    setAllUsers(updatedUsers);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Faculty Verification</h2>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculty..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>
            Manage faculty registration and approval status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
                {filteredFaculty.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.email}</TableCell>
                    <TableCell>{f.department || "N/A"}</TableCell>
                    <TableCell>
                      {f.isApproved ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!f.isApproved && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleApproveFaculty(f.id)} 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRejectFaculty(f.id)} 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredFaculty.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      No faculty found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredFaculty.map((f) => (
              <div key={f.id} className="border rounded-lg p-4 space-y-3 bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{f.name}</p>
                    <p className="text-sm text-muted-foreground">{f.email}</p>
                  </div>
                  {f.isApproved ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Department:</span> {f.department || "N/A"}
                </div>
                <div className="flex gap-2 pt-2">
                  {!f.isApproved && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-green-600"
                      onClick={() => handleApproveFaculty(f.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-1 text-red-600"
                    onClick={() => handleRejectFaculty(f.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ))}
            {filteredFaculty.length === 0 && (
              <div className="text-center py-10 text-muted-foreground italic">
                No faculty found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
