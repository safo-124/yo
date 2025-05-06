// app/(dashboard)/registry/_components/ManageCentersTab.jsx
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
  DialogClose, // Import DialogClose
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
import { createCenter } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner"; // For displaying notifications
import { PlusCircle } from "lucide-react"; // Icon for "Add New" button

export default function ManageCentersTab({ initialCenters = [], potentialCoordinators = [], fetchError }) {
  const [centers, setCenters] = useState(initialCenters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update centers if initialCenters prop changes (e.g., after revalidation)
  useEffect(() => {
    setCenters(initialCenters);
  }, [initialCenters]);

  const handleCreateCenter = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsLoading(true);

    if (!newCenterName.trim() || !selectedCoordinatorId) {
      setFormError("Center name and coordinator are required.");
      setIsLoading(false);
      return;
    }

    const result = await createCenter({ name: newCenterName.trim(), coordinatorId: selectedCoordinatorId });

    if (result.success) {
      toast.success(`Center "${result.center.name}" created successfully!`);
      // The parent page (RegistryPage) should re-fetch or revalidate,
      // and the updated initialCenters prop will update the state via useEffect.
      // For immediate UI update, you could also add to local state:
      // setCenters(prevCenters => [...prevCenters, { ...result.center, coordinator: potentialCoordinators.find(c => c.id === selectedCoordinatorId) }]);
      setIsDialogOpen(false); // Close dialog on success
      setNewCenterName(''); // Reset form
      setSelectedCoordinatorId(''); // Reset form
    } else {
      setFormError(result.error || "Failed to create center.");
      toast.error(result.error || "Failed to create center.");
    }
    setIsLoading(false);
  };

  if (fetchError) {
    return <p className="text-red-600">Error loading data: {fetchError}</p>;
  }

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Center
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Center</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new academic center and assign a coordinator.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCenter}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="centerName" className="text-right col-span-1">
                  Center Name
                </Label>
                <Input
                  id="centerName"
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Faculty of Science"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coordinator" className="text-right col-span-1">
                  Coordinator
                </Label>
                <Select
                  value={selectedCoordinatorId}
                  onValueChange={setSelectedCoordinatorId}
                  disabled={isLoading}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    {potentialCoordinators.length > 0 ? (
                      potentialCoordinators.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email}) - Role: {user.role}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        No users available to assign. Create users first.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {formError && (
                <p className="col-span-4 text-sm text-red-600 text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">
                  {formError}
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Center"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Center Name</TableHead>
              <TableHead>Coordinator</TableHead>
              <TableHead>Coordinator Email</TableHead>
              <TableHead>Created At</TableHead>
              {/* <TableHead>Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {centers.length > 0 ? (
              centers.map((center) => (
                <TableRow key={center.id}>
                  <TableCell className="font-medium">{center.name}</TableCell>
                  <TableCell>{center.coordinator?.name || 'N/A'}</TableCell>
                  <TableCell>{center.coordinator?.email || 'N/A'}</TableCell>
                  <TableCell>{new Date(center.createdAt).toLocaleDateString()}</TableCell>
                  {/* <TableCell>
                    <Button variant="outline" size="sm">Edit</Button>
                  </TableCell> */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No centers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {centers.length === 0 && !fetchError && (
         <p className="text-center text-muted-foreground">Click "Add New Center" to get started.</p>
      )}
    </div>
  );
}
