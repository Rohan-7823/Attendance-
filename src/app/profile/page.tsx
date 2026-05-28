"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Sparkles, 
  Save, 
  KeyRound, 
  Check, 
  Undo2, 
  GraduationCap, 
  Building2, 
  Clock 
} from "lucide-react";

// Curated high contrast beautiful gradient patterns for customizable avatar defaults
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&h=256&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&fit=crop",
];

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [className, setClassName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobileNumber(user.mobileNumber || "");
      setDepartment(user.department || "");
      setClassName(user.class || "");
      setRollNumber(user.rollNumber || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and Email are required properties.",
        variant: "destructive",
      });
      return;
    }

    updateProfile({
      name,
      email,
      mobileNumber,
      department,
      class: className,
      rollNumber,
      avatarUrl,
    });

    toast({
      title: "Profile Updated",
      description: "Your professional profile has been saved successfully.",
      variant: "default",
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (currentPassword !== user.password) {
      toast({
        title: "Incorrect Password",
        description: "The current password you specified is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Your new password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Mismatch Error",
        description: "Confirm password does not match new password.",
        variant: "destructive",
      });
      return;
    }

    updateProfile({
      password: newPassword,
    });

    toast({
      title: "Password Changed",
      description: "Your login credentials have been securely updated.",
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChangingPassword(false);
  };

  return (
    <div id="profile-container" className="flex-1 space-y-8 p-4 md:p-8 max-w-5xl mx-auto pt-6 pb-20">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">Account & Profile Settings</h1>
          <p className="text-muted-foreground text-sm">Update your digital representation, contact details, and account security controls.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => router.back()}>
          <Undo2 className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Card Summary */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-xl overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-700 to-indigo-950 relative">
              <Badge className="absolute top-4 right-4 bg-indigo-600 border-0 hover:bg-indigo-500 text-xs font-semibold capitalize px-3 py-1 text-white">
                {user.role}
              </Badge>
            </div>
            <CardContent className="pt-0 relative flex flex-col items-center text-center pb-8 border-b">
              <div className="relative -mt-12 mb-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback className="bg-indigo-700 text-white font-bold text-2xl">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-1">{name || "User Name"}</h3>
              <p className="text-sm text-muted-foreground font-mono mb-4">{email || "email@example.com"}</p>
              
              <div className="grid grid-cols-1 gap-2 w-full text-left bg-muted/40 p-3 rounded-xl border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-semibold text-foreground">Department:</span>
                  <span className="ml-auto">{department || "Not Specified"}</span>
                </div>
                {user.role === "student" && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="font-semibold text-foreground">Class:</span>
                      <span className="ml-auto">{className || "Not Specified"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="font-semibold text-foreground">Roll No:</span>
                      <span className="ml-auto">{rollNumber || "Not Specified"}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-4 bg-muted/20 flex flex-col items-stretch space-y-4">
              <Label className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-1">Choose Avatar Picture</Label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`relative rounded-md overflow-hidden aspect-square border-2 transition-all ${
                      avatarUrl === url ? "border-indigo-500 scale-105" : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    {avatarUrl === url && (
                      <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Columns - Editing Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Edit Form */}
          <form onSubmit={handleSaveProfile}>
            <Card className="shadow-xl">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-indigo-400" />
                  <span>Personal Details</span>
                </CardTitle>
                <CardDescription>Modify your visual profiles and communication details</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
                    <Input 
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@uni.edu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-foreground font-medium">Contact Number</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                        <Phone className="h-4 w-4" />
                      </span>
                      <Input 
                        id="mobile"
                        type="tel"
                        className="pl-10"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-foreground font-medium">Academic Department</Label>
                    <Input 
                      id="department"
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Computer Science & Engineering"
                    />
                  </div>
                </div>

                {user.role === "student" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                    <div className="space-y-2">
                      <Label htmlFor="class" className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        <span>Class Section</span>
                      </Label>
                      <Input 
                        id="class"
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="SE CSE A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roll" className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Roll Number</span>
                      </Label>
                      <Input 
                        id="roll"
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="2"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="avatar-custom" className="text-foreground font-medium">Custom Avatar URL</Label>
                  <Input 
                    id="avatar-custom"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

              </CardContent>

              <CardFooter className="border-t p-6 flex justify-end gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors px-6 gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Change Password Card */}
          <Card className="shadow-xl overflow-hidden">
            <CardHeader className="cursor-pointer select-none hover:bg-muted/50 transition-all border-b px-6 py-4 flex flex-row items-center justify-between" onClick={() => setIsChangingPassword(!isChangingPassword)}>
              <div className="space-y-1">
                <CardTitle className="text-md font-bold text-foreground flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-indigo-400" />
                  <span>Security & Password</span>
                </CardTitle>
                <CardDescription>Keep your login credentials securely updated</CardDescription>
              </div>
              <Button type="button" variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white">
                {isChangingPassword ? "Hide" : "Expand Fields"}
              </Button>
            </CardHeader>
            
            {isChangingPassword && (
              <form onSubmit={handleUpdatePassword}>
                <CardContent className="space-y-4 pt-6 px-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-pass">Current Password</Label>
                    <Input 
                      id="current-pass"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-pass">New Password</Label>
                      <Input 
                        id="new-pass"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-pass">Confirm New Password</Label>
                      <Input 
                        id="confirm-pass"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-6 flex justify-end">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2">
                    <Check className="h-4 w-4" />
                    <span>Apply New Password</span>
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}
