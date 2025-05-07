"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { createCenter } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { PlusCircle, Building2, UserRound, Mail, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ManageCentersTab({ initialCenters = [], potentialCoordinators = [], fetchError }) {
  const [centers, setCenters] = useState(initialCenters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setIsDialogOpen(false);
      setNewCenterName('');
      setSelectedCoordinatorId('');
    } else {
      setFormError(result.error || "Failed to create center.");
      toast.error(result.error || "Failed to create center.");
    }
    setIsLoading(false);
  };

  if (fetchError) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <FileWarning className="h-5 w-5" />
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{fetchError}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/registry">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            Academic Centers
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage all academic centers and their coordinators
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm hover:shadow-md transition-shadow">
              <PlusCircle className="h-4 w-4" />
              <span>New Center</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Create New Center
              </DialogTitle>
              <DialogDescription>
                Register a new academic center and assign its coordinator
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCenter}>
              <div className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="centerName">Center Name</Label>
                  <Input
                    id="centerName"
                    value={newCenterName}
                    onChange={(e) => setNewCenterName(e.target.value)}
                    placeholder="e.g., Faculty of Computer Science"
                    disabled={isLoading}
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinator">Center Coordinator</Label>
                  <Select
                    value={selectedCoordinatorId}
                    onValueChange={setSelectedCoordinatorId}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="focus:ring-primary">
                      <SelectValue placeholder="Select a coordinator" />
                    </SelectTrigger>
                    <SelectContent>
                      {potentialCoordinators.length > 0 ? (
                        potentialCoordinators.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image} />
                                <AvatarFallback>
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          No available coordinators
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {formError && (
                  <div className="p-3 bg-destructive/5 border border-destructive/30 rounded-md">
                    <p className="text-sm text-destructive">{formError}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isLoading}
                    className="border-muted-foreground/30"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Creating..." : "Create Center"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {centers.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No centers created yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start by adding your first academic center
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Center
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[30%]">Center</TableHead>
                      <TableHead className="w-[25%]">Coordinator</TableHead>
                      <TableHead className="w-[25%]">Contact</TableHead>
                      <TableHead className="w-[20%]">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centers.map((center) => (
                      <TableRow key={center.id} className="hover:bg-muted/10">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <span>{center.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {center.coordinator ? (
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={center.coordinator.image} />
                                <AvatarFallback>
                                  {center.coordinator.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{center.coordinator.name}</p>
                                <Badge variant="outline" className="mt-1">
                                  {center.coordinator.role}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {center.coordinator?.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(center.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {centers.map((center) => (
              <Card key={center.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{center.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Coordinator</p>
                      <p>{center.coordinator?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                  {center.coordinator?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{center.coordinator.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p>
                        {new Date(center.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {center.coordinator?.role && (
                    <div className="pt-2">
                      <Badge variant="secondary">{center.coordinator.role}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}