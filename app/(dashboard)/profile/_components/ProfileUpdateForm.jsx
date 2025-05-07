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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateCurrentUserName, updateCurrentUserPassword } from '@/lib/actions/user.actions';
import { toast } from "sonner";
import { KeyRound, Edit, Save } from 'lucide-react';

// Zod Schema for Name Update
const nameFormSchema = z.object({
  newName: z.string().min(1, "Name cannot be empty.").max(100, "Name is too long (max 100 characters)."),
});

// Zod Schema for Password Update
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters long."),
  confirmNewPassword: z.string().min(6, "Please confirm your new password."),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"], // Point error to the confirmation field
});

export default function ProfileUpdateForm({ initialName }) {
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Form for updating name
  const nameForm = useForm({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      newName: initialName || "",
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

  // Handler for name update submission
  const handleNameUpdate = async (data) => {
    setIsNameLoading(true);
    const result = await updateCurrentUserName({ newName: data.newName });
    setIsNameLoading(false);

    if (result.success) {
      toast.success(result.message || "Name updated successfully!");
      // Optionally, you could update a parent state or re-fetch data if the name
      // is displayed elsewhere on the page dynamically without a full page reload.
      // For now, revalidation in the server action should handle updates on next navigation/refresh.
      // You might want to update the input field if the user could submit again without refresh:
      // nameForm.setValue("newName", result.user.name); // If action returns updated user
    } else {
      toast.error(result.error || "Failed to update name.");
      nameForm.setError("newName", { type: "manual", message: result.error });
    }
  };

  // Handler for password update submission
  const handlePasswordUpdate = async (data) => {
    setIsPasswordLoading(true);
    const result = await updateCurrentUserPassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    setIsPasswordLoading(false);

    if (result.success) {
      toast.success(result.message || "Password updated successfully!");
      passwordForm.reset(); // Clear password fields for security
    } else {
      toast.error(result.error || "Failed to update password.");
      // Set error on a specific field if applicable, e.g., currentPassword
      if (result.error?.toLowerCase().includes("current password")) {
        passwordForm.setError("currentPassword", { type: "manual", message: result.error });
      } else {
         passwordForm.setError("newPassword", { type: "manual", message: result.error }); // Or a general error on one field
      }
    }
  };

  return (
    <>
      {/* Update Name Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Edit className="mr-2 h-5 w-5 text-primary" /> Update Your Name</CardTitle>
          <CardDescription>Change your display name as it appears in the application.</CardDescription>
        </CardHeader>
        <form onSubmit={nameForm.handleSubmit(handleNameUpdate)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newName">Full Name</Label>
              <Input
                id="newName"
                {...nameForm.register("newName")}
                disabled={isNameLoading}
                className={nameForm.formState.errors.newName ? "border-red-500" : ""}
              />
              {nameForm.formState.errors.newName && (
                <p className="text-sm text-red-500 mt-1">{nameForm.formState.errors.newName.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isNameLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isNameLoading ? "Saving Name..." : "Save Name"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5 text-primary" /> Change Your Password</CardTitle>
          <CardDescription>Choose a new, strong password for your account.</CardDescription>
        </CardHeader>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register("currentPassword")}
                disabled={isPasswordLoading}
                className={passwordForm.formState.errors.currentPassword ? "border-red-500" : ""}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register("newPassword")}
                disabled={isPasswordLoading}
                className={passwordForm.formState.errors.newPassword ? "border-red-500" : ""}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                {...passwordForm.register("confirmNewPassword")}
                disabled={isPasswordLoading}
                className={passwordForm.formState.errors.confirmNewPassword ? "border-red-500" : ""}
              />
              {passwordForm.formState.errors.confirmNewPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.confirmNewPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPasswordLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isPasswordLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
