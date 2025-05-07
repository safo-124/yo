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
import { updateCurrentUserName, updateCurrentUserPassword } from '@/lib/actions/user.actions';
import { toast } from "sonner";
import { KeyRound, Edit, Save, User } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

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
  path: ["confirmNewPassword"],
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
      passwordForm.reset();
    } else {
      toast.error(result.error || "Failed to update password.");
      if (result.error?.toLowerCase().includes("current password")) {
        passwordForm.setError("currentPassword", { type: "manual", message: result.error });
      } else {
         passwordForm.setError("newPassword", { type: "manual", message: result.error });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and security</p>
      </div>

      <Separator className="my-6" />

      {/* Update Name Card */}
      <Card className="border-transparent bg-gradient-to-br from-background to-muted/20 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your name as it appears in the application</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={nameForm.handleSubmit(handleNameUpdate)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="newName">Full Name</Label>
              <Input
                id="newName"
                {...nameForm.register("newName")}
                disabled={isNameLoading}
                className={nameForm.formState.errors.newName ? "border-destructive" : ""}
                placeholder="Enter your full name"
              />
              {nameForm.formState.errors.newName && (
                <p className="text-sm text-destructive mt-1">{nameForm.formState.errors.newName.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isNameLoading} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {isNameLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="border-transparent bg-gradient-to-br from-background to-muted/20 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Change your password to keep your account secure</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  disabled={isPasswordLoading}
                  className={passwordForm.formState.errors.currentPassword ? "border-destructive" : ""}
                  placeholder="Enter your current password"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register("newPassword")}
                  disabled={isPasswordLoading}
                  className={passwordForm.formState.errors.newPassword ? "border-destructive" : ""}
                  placeholder="Enter your new password"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  {...passwordForm.register("confirmNewPassword")}
                  disabled={isPasswordLoading}
                  className={passwordForm.formState.errors.confirmNewPassword ? "border-destructive" : ""}
                  placeholder="Confirm your new password"
                />
                {passwordForm.formState.errors.confirmNewPassword && (
                  <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.confirmNewPassword.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isPasswordLoading} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {isPasswordLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}