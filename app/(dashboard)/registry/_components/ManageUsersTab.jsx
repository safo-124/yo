// app/(dashboard)/registry/_components/ManageUsersTab.jsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createUserByRegistry } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { UserPlus } from "lucide-react"; // Icon

export default function ManageUsersTab({ initialUsers = [], centers = [], fetchError }) {
  const [users, setUsers] = useState(initialUsers);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form state for new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState(''); // 'COORDINATOR' or 'LECTURER'
  const [selectedCenterForLecturer, setSelectedCenterForLecturer] = useState('');

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const resetForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('');
    setSelectedCenterForLecturer('');
    setFormError('');
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsLoading(true);

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || !newUserRole) {
      setFormError("Name, email, password, and role are required.");
      setIsLoading(false);
      return;
    }

    // Basic password validation (example)
    if (newUserPassword.trim().length < 6) {
      setFormError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    const userData = {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword.trim(), // Password will be hashed by the server action
      role: newUserRole,
      lecturerCenterId: newUserRole === 'LECTURER' ? selectedCenterForLecturer || null : null,
    };

    const result = await createUserByRegistry(userData);

    if (result.success) {
      toast.success(`User "${result.user.name}" created successfully!`);
      // Parent page revalidation will update initialUsers prop, then useEffect updates local state.
      setIsUserDialogOpen(false);
      resetForm();
    } else {
      setFormError(result.error || "Failed to create user.");
      toast.error(result.error || "Failed to create user.");
    }
    setIsLoading(false);
  };

  if (fetchError) {
    return <p className="text-red-600">Error loading user data: {fetchError}</p>;
  }

  return (
    <div className="space-y-4">
      <Dialog open={isUserDialogOpen} onOpenChange={(isOpen) => {
        setIsUserDialogOpen(isOpen);
        if (!isOpen) resetForm(); // Reset form when dialog closes
      }}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Enter details for the new Coordinator or Lecturer. The password will be hashed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g., Jane Smith"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="userEmail">Email Address</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="userPassword">Password</Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="userRole">Role</Label>
                <Select
                  value={newUserRole}
                  onValueChange={setNewUserRole}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger id="userRole">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                    <SelectItem value="LECTURER">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newUserRole === 'LECTURER' && (
                <div className="space-y-1">
                  <Label htmlFor="lecturerCenter">Assign to Center (Optional)</Label>
                  <Select
                    value={selectedCenterForLecturer}
                    onValueChange={setSelectedCenterForLecturer}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="lecturerCenter">
                      <SelectValue placeholder="Select a center if applicable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {centers.length > 0 ? (
                        centers.map((center) => (
                          <SelectItem key={center.id} value={center.id}>
                            {center.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-centers" disabled>
                          No centers available.
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formError && (
                <p className="text-sm text-red-600 text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">
                  {formError}
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating User..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Associated Center</TableHead>
              <TableHead>Created At</TableHead>
              {/* <TableHead>Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.role === 'COORDINATOR' && user.coordinatedCenter?.name
                      ? `Coordinates: ${user.coordinatedCenter.name}`
                      : user.role === 'LECTURER' && user.lecturerCenter?.name
                        ? `Lecturer at: ${user.lecturerCenter.name}`
                        : user.role === 'LECTURER' && !user.lecturerCenter?.name && user.lecturerCenterId
                          ? `(Center ID: ${user.lecturerCenterId})` // Fallback if name not populated but ID exists
                          : 'N/A'}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  {/* <TableCell>
                    <Button variant="outline" size="sm" disabled>Edit</Button> <Button variant="destructive" size="sm" disabled>Delete</Button>
                  </TableCell> */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {users.length === 0 && !fetchError && (
         <p className="text-center text-muted-foreground">Click "Add New User" to get started.</p>
      )}
    </div>
  );
}
