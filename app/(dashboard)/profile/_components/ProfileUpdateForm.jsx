// app/(dashboard)/profile/_components/ProfileUpdateForm.jsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateCurrentUserProfile, updateCurrentUserPassword } from '@/lib/actions/user.actions';
import { toast } from "sonner";
import { KeyRound, Edit, Save, User, Phone, Banknote, Building, Landmark, Info, Lock, UserCheck, BadgeHelp } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Zod Schema for Profile Details Update (Name, Designation, Phone, Bank Info)
const profileDetailsSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").max(100, "Name is too long (max 100 characters)."),
  designation: z.string(), // Now required but can be "NONE"
  phoneNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
});

// Zod Schema for Password Update
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters long."),
  confirmNewPassword: z.string().min(6, "Please confirm your new password."),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});

export default function ProfileUpdateForm({ initialProfile }) {
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Form for updating profile details
  const profileDetailsForm = useForm({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      name: initialProfile?.name || "",
      designation: initialProfile?.designation || "NONE",
      phoneNumber: initialProfile?.phoneNumber || "",
      bankName: initialProfile?.bankName || "",
      bankBranch: initialProfile?.bankBranch || "",
      accountName: initialProfile?.accountName || "",
      accountNumber: initialProfile?.accountNumber || "",
    },
  });

  // Form for updating password
  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Helper function for consistent input styling
  const getInputClasses = (formInstance, fieldName) => `
    h-10 text-sm bg-white dark:bg-slate-700/80 text-slate-900 dark:text-slate-50
    placeholder-slate-400 dark:placeholder-slate-500 rounded-md border
    ${formInstance.formState.errors[fieldName] ? "border-red-500 dark:border-red-600 focus-visible:ring-red-500" : "border-slate-300 dark:border-slate-600 focus-visible:ring-blue-600"}
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background
  `;

  // Handler for profile details update submission
  const handleProfileUpdate = async (data) => {
    setIsProfileLoading(true);
    profileDetailsForm.clearErrors("root.serverError"); // Clear previous server errors
    
    // Add debug information to help troubleshoot
    console.log("Client: Submitting profile update with data:", {
      name: data.name,
      designation: data.designation,
      phoneNumber: data.phoneNumber || "(empty)",
      bankName: data.bankName || "(empty)",
      bankBranch: data.bankBranch || "(empty)",
      accountName: data.accountName || "(empty)",
      accountNumber: data.accountNumber || "(empty)"
    }); 

    // Client-side validation specific to Lecturer and Coordinator roles
    if (initialProfile?.role === 'LECTURER' || initialProfile?.role === 'COORDINATOR') {
      const requiredFields = [
        { field: 'phoneNumber', message: "Phone number is required." },
        { field: 'bankName', message: "Bank name is required." },
        { field: 'bankBranch', message: "Bank branch is required." },
        { field: 'accountName', message: "Account name is required." },
        { field: 'accountNumber', message: "Account number is required." },
      ];

      for (const { field, message } of requiredFields) {
        if (!data[field] || !data[field].trim()) {
          profileDetailsForm.setError(field, { type: "manual", message });
          toast.error(message);
          setIsProfileLoading(false);
          return;
        }
      }
      // More forgiving phone number validation - just make sure it contains digits
      if (data.phoneNumber && !/\d{9,}/.test(data.phoneNumber.replace(/\D/g, ''))) {
        profileDetailsForm.setError('phoneNumber', { type: "manual", message: "Phone number should contain at least 9 digits." });
        toast.error("Invalid phone number format. Please enter a valid phone number.");
        setIsProfileLoading(false);
        return;
      }
      
      // Account number validation
      if (data.accountNumber && !/^\d+$/.test(data.accountNumber.trim())) {
        profileDetailsForm.setError('accountNumber', { type: "manual", message: "Account number must be numeric." });
        toast.error("Account number must be numeric.");
        setIsProfileLoading(false);
        return;
      }
    }

    const result = await updateCurrentUserProfile({
      newName: data.name,
      newDesignation: data.designation === "NONE" ? null : data.designation,
      newPhoneNumber: data.phoneNumber,
      newBankName: data.bankName,
      newBankBranch: data.bankBranch, 
      newAccountName: data.accountName,
      newAccountNumber: data.accountNumber,
    });
    setIsProfileLoading(false);

    console.log("Client: Profile update result from server:", result); // DEBUG LOG

    if (result.success) {
      toast.success(result.message || "Profile updated successfully!");
      profileDetailsForm.reset(result.user); // Reset form with potentially new data returned from server
    } else {
      toast.error(result.error || "Failed to update profile.");
      profileDetailsForm.setError("root.serverError", { type: "manual", message: result.error });
    }
  };

  // Handler for password update submission
  const handlePasswordUpdate = async (data) => {
    setIsPasswordLoading(true);
    passwordForm.clearErrors("root.serverError"); // Clear previous server errors

    // Client-side validation for new password match
    if (data.newPassword !== data.confirmNewPassword) {
      passwordForm.setError("confirmNewPassword", { type: "manual", message: "New passwords do not match." });
      toast.error("New passwords do not match.");
      setIsPasswordLoading(false);
      return;
    }

    const result = await updateCurrentUserPassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    setIsPasswordLoading(false);

    if (result.success) {
      toast.success(result.message || "Password updated successfully!");
      passwordForm.reset(); // Clear all fields after success
    } else {
      toast.error(result.error || "Failed to update password.");
      if (result.error?.toLowerCase().includes("current password")) {
        passwordForm.setError("currentPassword", { type: "manual", message: result.error });
      } else {
        passwordForm.setError("newPassword", { type: "manual", message: result.error });
      }
      passwordForm.setError("root.serverError", { type: "manual", message: result.error });
    }
  };

  return (
    // Outer container: Removed max-w-2xl mx-auto to allow full width, but kept padding
    <div className="space-y-8 p-6 md:p-8 lg:p-10">
      {/* Removed the H1 and P for "Profile Settings" */}
      {/* Removed the separator */}

      {/* Update Profile Details Card */}
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <CardHeader className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <User className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Personal Information</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                  Update your profile details
                </CardDescription>
              </div>
            </div>
            {initialProfile?.role && (
              <Badge className={`${
                initialProfile.role === 'LECTURER' ? 'bg-green-100 text-green-800 border-green-300' :
                initialProfile.role === 'COORDINATOR' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                initialProfile.role === 'REGISTRY' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                'bg-gray-100 text-gray-800 border-gray-300'
              } px-3 py-1 font-medium rounded-full border shadow-sm`}>
                <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                {initialProfile.role}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={profileDetailsForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Full Name</Label>
                  <Input
                    id="name"
                    {...profileDetailsForm.register("name")}
                    disabled={isProfileLoading}
                    className={getInputClasses(profileDetailsForm, "name")}
                    placeholder="Enter your full name"
                  />
                  {profileDetailsForm.formState.errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{profileDetailsForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="designation" className="text-slate-700 dark:text-slate-200">Designation</Label>
                  <Select
                    disabled={isProfileLoading}
                    defaultValue={profileDetailsForm.getValues("designation") || "NONE"}
                    onValueChange={(value) => profileDetailsForm.setValue("designation", value === "NONE" ? null : value)}
                  >
                    <SelectTrigger id="designation" className={getInputClasses(profileDetailsForm, "designation")}>
                      <SelectValue placeholder="Select your designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">No Designation</SelectItem>
                      <SelectItem value="ASSISTANT_LECTURER">Assistant Lecturer</SelectItem>
                      <SelectItem value="LECTURER">Lecturer</SelectItem>
                      <SelectItem value="SENIOR_LECTURER">Senior Lecturer</SelectItem>
                      <SelectItem value="PROFESSOR">Professor</SelectItem>
                      <SelectItem value="ADMINISTRATIVE_STAFF">Administrative Staff</SelectItem>
                      <SelectItem value="TECHNICAL_STAFF">Technical Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {profileDetailsForm.formState.errors.designation && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{profileDetailsForm.formState.errors.designation.message}</p>
                  )}
                </div>
              </div>

              {(initialProfile?.role === 'LECTURER' || initialProfile?.role === 'COORDINATOR') && (
                <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                      <Banknote className="h-5 w-5" /> Payment & Contact Details
                    </h4>
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20">Required</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    These details are required for processing payments and communication.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-200 flex items-center">
                        <Phone className="h-4 w-4 mr-1.5 text-violet-600" /> 
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        {...profileDetailsForm.register("phoneNumber")}
                        disabled={isProfileLoading}
                        className={getInputClasses(profileDetailsForm, "phoneNumber")}
                        placeholder="e.g., +233241234567"
                        required
                      />
                      {profileDetailsForm.formState.errors.phoneNumber && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{profileDetailsForm.formState.errors.phoneNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="bankName" className="text-slate-700 dark:text-slate-200 flex items-center">
                        <Building className="h-4 w-4 mr-1.5 text-violet-600" />
                        Bank Name
                      </Label>
                      <Input
                        id="bankName"
                        {...profileDetailsForm.register("bankName")}
                        disabled={isProfileLoading}
                        className={getInputClasses(profileDetailsForm, "bankName")}
                        placeholder="e.g., GCB Bank"
                        required
                      />
                      {profileDetailsForm.formState.errors.bankName && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{profileDetailsForm.formState.errors.bankName.message}</p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="bankBranch" className="text-slate-700 dark:text-slate-200 flex items-center">
                        <Landmark className="h-4 w-4 mr-1.5 text-violet-600" />
                        Bank Branch
                      </Label>
                      <Input
                        id="bankBranch"
                        {...profileDetailsForm.register("bankBranch")}
                        disabled={isProfileLoading}
                        className={getInputClasses(profileDetailsForm, "bankBranch")}
                        placeholder="e.g., Winneba Branch"
                        required
                      />
                      {profileDetailsForm.formState.errors.bankBranch && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{profileDetailsForm.formState.errors.bankBranch.message}</p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="accountName" className="text-slate-700 dark:text-slate-200 flex items-center">
                        <User className="h-4 w-4 mr-1.5 text-violet-600" />
                        Account Name
                      </Label>
                      <Input
                        id="accountName"
                        {...profileDetailsForm.register("accountName")}
                        disabled={isProfileLoading}
                        className={getInputClasses(profileDetailsForm, "accountName")}
                        placeholder="Name on account"
                        required
                      />
                      {profileDetailsForm.formState.errors.accountName && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{profileDetailsForm.formState.errors.accountName.message}</p>
                      )}
                    </div>
                    
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="accountNumber" className="text-slate-700 dark:text-slate-200 flex items-center">
                        <BadgeHelp className="h-4 w-4 mr-1.5 text-violet-600" />
                        Account Number
                      </Label>
                      <Input
                        id="accountNumber"
                        {...profileDetailsForm.register("accountNumber")}
                        disabled={isProfileLoading}
                        className={getInputClasses(profileDetailsForm, "accountNumber")}
                        placeholder="e.g., 1234567890"
                        required
                      />
                      {profileDetailsForm.formState.errors.accountNumber && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{profileDetailsForm.formState.errors.accountNumber.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {profileDetailsForm.formState.errors.root?.serverError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{profileDetailsForm.formState.errors.root.serverError.message}</p>
            )}
            <Button type="submit" disabled={isProfileLoading} className="w-full sm:w-auto bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium shadow-md transition-all duration-200 ease-in-out">
              <Save className="mr-2 h-4 w-4" />
              {isProfileLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <CardHeader className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Lock className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Password & Security</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                Change your password to keep your account secure.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword" className="text-slate-700 dark:text-slate-200 flex items-center">
                  <KeyRound className="h-4 w-4 mr-1.5 text-violet-600" />
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  disabled={isPasswordLoading}
                  className={getInputClasses(passwordForm, "currentPassword")}
                  placeholder="Enter your current password"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-200 flex items-center">
                  <Lock className="h-4 w-4 mr-1.5 text-violet-600" />
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register("newPassword")}
                  disabled={isPasswordLoading}
                  className={getInputClasses(passwordForm, "newPassword")}
                  placeholder="Enter your new password"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{passwordForm.formState.errors.newPassword.message}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Use at least 6 characters with a mix of letters, numbers & symbols
                </p>
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="confirmNewPassword" className="text-slate-700 dark:text-slate-200 flex items-center">
                  <Lock className="h-4 w-4 mr-1.5 text-violet-600" />
                  Confirm New Password
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  {...passwordForm.register("confirmNewPassword")}
                  disabled={isPasswordLoading}
                  className={getInputClasses(passwordForm, "confirmNewPassword")}
                  placeholder="Confirm your new password"
                />
                {passwordForm.formState.errors.confirmNewPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"><Info className="h-3.5 w-3.5"/>{passwordForm.formState.errors.confirmNewPassword.message}</p>
                )}
              </div>
            </div>
            
            {passwordForm.formState.errors.root?.serverError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{passwordForm.formState.errors.root.serverError.message}</p>
            )}
            
            <div className="flex flex-col xs:flex-row gap-4 items-center">
              <Button 
                type="submit" 
                disabled={isPasswordLoading} 
                className="w-full xs:w-auto bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium shadow-md transition-all duration-200 ease-in-out"
              >
                <Save className="mr-2 h-4 w-4" />
                {isPasswordLoading ? "Updating..." : "Update Password"}
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last password change: {initialProfile?.updatedAt ? new Date(initialProfile.updatedAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}