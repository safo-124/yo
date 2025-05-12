// app/(dashboard)/registry/_components/ManageCentersTab.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { PlusCircle, Building2, UserRound, Mail, CalendarDays, FileWarning, AlertTriangle, Loader2 } from "lucide-react"; // Added Loader2
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// New Palette: Red-800, Blue-800, Violet-800, White

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
      setCenters(prev => [result.center, ...prev]); // Add to start of list for immediate visibility
      setIsDialogOpen(false);
      setNewCenterName('');
      setSelectedCoordinatorId('');
    } else {
      const errorMessage = result.error || "Failed to create center.";
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
    setIsLoading(false);
  };

  // Helper for focus ring classes
  const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";


  if (fetchError) {
    return (
      <div className="flex flex-col flex-1 h-full items-center justify-center p-4 bg-white dark:bg-slate-900">
        <Card className="w-full max-w-md bg-red-50 dark:bg-red-800/20 border-red-300 dark:border-red-700/50 shadow-lg rounded-lg">
          <CardHeader className="flex flex-row items-center space-x-3">
            <FileWarning className="h-6 w-6 text-red-700 dark:text-red-400" />
            <CardTitle className="text-red-800 dark:text-red-200 text-lg">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300">{fetchError}</p>
            <Button variant="outline" className="mt-6 border-red-600 text-red-700 hover:bg-red-100 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-700/30" asChild>
              <Link href="/registry">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // This component assumes its parent page provides the overall white background.
    // Adding padding here to create space from the parent header.
    <div className="space-y-6 sm:space-y-8 p-0 md:p-0"> {/* Removed component-level padding, parent page handles it */}
      
      {/* Header section for this tab content */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1 pt-1"> {/* Minimal padding for alignment */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3 text-blue-800 dark:text-blue-300">
            <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-violet-700 dark:text-violet-500" />
            Academic Centers
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Manage all academic centers and their coordinators.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) { // Reset form on close if not loading
            setFormError('');
            if (!isLoading) {
                setNewCenterName('');
                setSelectedCoordinatorId('');
            }
          }
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className={`gap-2 shadow-md hover:shadow-lg transition-shadow bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm ${focusRingClass}`}>
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>New Center</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[580px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-xl rounded-lg">
            <DialogHeader className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl text-blue-800 dark:text-blue-300">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-violet-700 dark:text-violet-500" />
                Create New Center
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                Register a new academic center and assign its coordinator.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCenter}>
              <div className="grid gap-5 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="centerName" className="font-medium text-slate-700 dark:text-slate-300">Center Name <span className="text-red-700">*</span></Label>
                  <Input
                    id="centerName"
                    value={newCenterName}
                    onChange={(e) => setNewCenterName(e.target.value)}
                    placeholder="e.g., Faculty of Computing Education"
                    disabled={isLoading}
                    className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${focusRingClass}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="coordinator" className="font-medium text-slate-700 dark:text-slate-300">Center Coordinator <span className="text-red-700">*</span></Label>
                  <Select
                    value={selectedCoordinatorId}
                    onValueChange={setSelectedCoordinatorId}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-blue-600 text-slate-900 dark:text-slate-50 data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500 ${focusRingClass}`}>
                      <SelectValue placeholder="Select a coordinator" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50">
                      {potentialCoordinators.length > 0 ? (
                        potentialCoordinators.map((user) => (
                          <SelectItem key={user.id} value={user.id} className="focus:bg-slate-100 dark:focus:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 cursor-pointer">
                            <div className="flex items-center gap-3 py-1">
                              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-xs sm:text-sm">
                                  {user.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm text-slate-800 dark:text-slate-100">{user.name}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled className="text-slate-400 dark:text-slate-500">
                          No available coordinators
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {formError && (
                  <div className="p-2.5 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-700/50 rounded-md">
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0"/> {formError}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isLoading}
                    className={`border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRingClass}`}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={`bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium ${focusRingClass}`}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? "Creating..." : "Create Center"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {centers.length === 0 && !isLoading ? (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 mt-6 sm:mt-8 shadow-none">
          <CardContent className="py-12 sm:py-16 flex flex-col items-center justify-center text-center">
            <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 dark:text-slate-500 mb-5 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-blue-800 dark:text-blue-300">No centers created yet</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-xs">
              Start by adding your first academic center to manage its details and coordinator.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className={`gap-2 bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-medium ${focusRingClass}`}>
              <PlusCircle className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" />
              Create First Center
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block pt-4">
            <Card className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg">
              <ScrollArea className="h-auto max-h-[calc(100vh-350px)]"> {/* Adjusted max-height calculation */}
                <Table className="min-w-[700px]">
                  <TableHeader className="bg-slate-100/80 dark:bg-slate-700/50 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="w-[30%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3 px-4">Center</TableHead>
                      <TableHead className="w-[30%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3 px-4">Coordinator</TableHead>
                      <TableHead className="w-[25%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3 px-4">Contact</TableHead>
                      <TableHead className="w-[15%] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3 px-4">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {centers.map((center) => (
                      <TableRow key={center.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
                        <TableCell className="font-medium text-slate-800 dark:text-slate-100 px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-violet-100 dark:bg-violet-800/30">
                              <Building2 className="h-5 w-5 text-violet-700 dark:text-violet-500" />
                            </div>
                            <span>{center.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-200 px-4 py-3.5">
                          {center.coordinator ? (
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={center.coordinator.image || undefined} />
                                <AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-xs">
                                  {center.coordinator.name ? center.coordinator.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{center.coordinator.name}</p>
                                <Badge variant="outline" className="mt-0.5 text-[10px] px-1.5 py-0 border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400 font-normal tracking-normal">
                                  {center.coordinator.role}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300 px-4 py-3.5 text-sm">
                          {center.coordinator?.email || <span className="text-slate-400 dark:text-slate-500 italic">N/A</span>}
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {new Date(center.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
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
          <div className="md:hidden space-y-3 pt-4">
            {centers.map((center) => (
              <Card key={center.id} className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-violet-100 dark:bg-violet-800/30">
                      <Building2 className="h-5 w-5 text-violet-700 dark:text-violet-500" />
                    </div>
                    <CardTitle className="text-base font-semibold text-blue-800 dark:text-blue-300">{center.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-0 pb-4 px-4 text-xs">
                  <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                    <UserRound className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Coordinator</p>
                      <p>{center.coordinator?.name || <span className="italic text-slate-400 dark:text-slate-500">Unassigned</span>}</p>
                    </div>
                  </div>
                  {center.coordinator?.email && (
                    <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                      <Mail className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Email</p>
                        <p>{center.coordinator.email}</p>
                      </div>
                    </div>
                  )}
                   {center.coordinator?.role && (
                     <div className="pt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400 font-normal tracking-normal">
                            {center.coordinator.role}
                        </Badge>
                     </div>
                  )}
                  <div className="flex items-start gap-2.5 text-slate-500 dark:text-slate-400 pt-1">
                    <CalendarDays className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Created</p>
                      <p>
                        {new Date(center.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}