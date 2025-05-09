// app/(dashboard)/registry/_components/ManageCentersTab.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Added for the "Back to Dashboard" button
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
import { PlusCircle, Building2, UserRound, Mail, CalendarDays, FileWarning, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Enhanced UEW-inspired colors with deeper contrast
const uewDeepRed = '#6D0F15'; // Darker red
const uewDeepBlue = '#061A38'; // Darker blue
const uewAccentGold = '#D18A00'; // Darker gold for better contrast
const veryDarkIntermediate = 'slate-950'; // Even darker for gradient

// Enhanced text colors for dark backgrounds
const textOnDarkPrimary = 'text-white'; 
const textOnDarkSecondary = 'text-slate-100'; // Brighter secondary
const textOnDarkMuted = 'text-slate-300'; // Less muted for better visibility

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
      <div className={`min-h-full space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#6D0F15] via-slate-950 to-[#061A38] ${textOnDarkPrimary}`}>
        <Card className="border-red-600 bg-[#6D0F15]/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-100 flex items-center gap-2 text-xl">
              <FileWarning className="h-6 w-6" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-50">{fetchError}</p>
            <Button variant="outline" className="mt-4 bg-white/10 hover:bg-white/20 border-slate-300 text-white hover:text-white" asChild>
              <Link href="/registry">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-8 min-h-full bg-gradient-to-br from-[#6D0F15] via-slate-950 to-[#061A38] p-4 sm:p-6 lg:p-8 ${textOnDarkPrimary}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8 text-[#D18A00]" />
            Academic Centers
          </h1>
          <p className="text-slate-100 mt-1 text-lg">
            Manage all academic centers and their coordinators.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md hover:shadow-lg transition-shadow bg-[#D18A00] hover:bg-[#D18A00]/90 text-black font-semibold">
              <PlusCircle className="h-5 w-5" />
              <span>New Center</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-[#061A38] dark:bg-slate-950 border-slate-600 text-white backdrop-blur-sm shadow-2xl">
            <DialogHeader className="mb-2">
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="h-6 w-6 text-[#D18A00]" />
                Create New Center
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Register a new academic center and assign its coordinator.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCenter}>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="centerName" className="text-slate-100">Center Name</Label>
                  <Input
                    id="centerName"
                    value={newCenterName}
                    onChange={(e) => setNewCenterName(e.target.value)}
                    placeholder="e.g., Faculty of Computing Education"
                    disabled={isLoading}
                    className="bg-slate-900 border-slate-600 focus-visible:ring-[#D18A00] text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinator" className="text-slate-100">Center Coordinator</Label>
                  <Select
                    value={selectedCoordinatorId}
                    onValueChange={setSelectedCoordinatorId}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 focus:ring-[#D18A00] text-white placeholder:text-slate-400">
                      <SelectValue placeholder="Select a coordinator" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-600 text-white">
                      {potentialCoordinators.length > 0 ? (
                        potentialCoordinators.map((user) => (
                          <SelectItem key={user.id} value={user.id} className="focus:bg-slate-800 hover:bg-slate-800">
                            <div className="flex items-center gap-3 py-1.5">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.image} />
                                <AvatarFallback className="bg-slate-800 text-slate-100">
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-50">{user.name}</span>
                                <span className="text-xs text-slate-300">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled className="text-slate-400">
                          No available coordinators
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {formError && (
                  <div className="p-3 bg-red-900/70 border border-red-700 rounded-md">
                    <p className="text-sm text-red-100 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4"/> {formError}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700">
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isLoading}
                    className="border-slate-500 hover:bg-slate-800 text-slate-100 hover:text-white"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#D18A00] hover:bg-[#D18A00]/90 text-black font-semibold"
                >
                  {isLoading ? "Creating..." : "Create Center"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {centers.length === 0 && !isLoading ? (
        <Card className="bg-[#061A38]/90 dark:bg-slate-950 backdrop-blur-sm border-dashed border-slate-600/70 mt-8 shadow-lg">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <Building2 className="h-16 w-16 text-slate-300 mb-6" />
            <h3 className="text-xl font-semibold mb-2 text-white">No centers created yet</h3>
            <p className="text-sm text-slate-200 mb-8 max-w-xs">
              Start by adding your first academic center to manage its details and coordinator.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-[#D18A00] hover:bg-[#D18A00]/90 text-black font-semibold">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create First Center
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="bg-[#061A38]/95 dark:bg-slate-950 backdrop-blur-sm border-slate-700 shadow-xl">
              <ScrollArea className="h-auto max-h-[calc(100vh-320px)]">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-slate-950/90 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow className="border-slate-700">
                      <TableHead className="w-[30%] text-slate-200">Center</TableHead>
                      <TableHead className="w-[25%] text-slate-200">Coordinator</TableHead>
                      <TableHead className="w-[25%] text-slate-200">Contact</TableHead>
                      <TableHead className="w-[20%] text-slate-200">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centers.map((center) => (
                      <TableRow key={center.id} className="border-slate-700 hover:bg-slate-900/50">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-[#D18A00]/20">
                              <Building2 className="h-5 w-5 text-[#D18A00]" />
                            </div>
                            <span>{center.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          {center.coordinator ? (
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={center.coordinator.image} />
                                <AvatarFallback className="bg-slate-800 text-white">
                                  {center.coordinator.name ? center.coordinator.name.charAt(0).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{center.coordinator.name}</p>
                                <Badge variant="outline" className="mt-1 text-xs border-slate-600 text-slate-300">
                                  {center.coordinator.role}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-200">
                          {center.coordinator?.email || <span className="text-slate-400">N/A</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-300">
                            <CalendarDays className="h-4 w-4" />
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
          <div className="md:hidden space-y-4">
            {centers.map((center) => (
              <Card key={center.id} className="bg-[#061A38]/95 dark:bg-slate-950 backdrop-blur-sm border-slate-700 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#D18A00]/20">
                      <Building2 className="h-6 w-6 text-[#D18A00]" />
                    </div>
                    <CardTitle className="text-lg text-white">{center.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-start gap-3">
                    <UserRound className="h-4 w-4 mt-1 text-slate-300" />
                    <div>
                      <p className="text-xs text-slate-300">Coordinator</p>
                      <p className="text-white">{center.coordinator?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                  {center.coordinator?.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 mt-1 text-slate-300" />
                      <div>
                        <p className="text-xs text-slate-300">Email</p>
                        <p className="text-slate-200">{center.coordinator.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <CalendarDays className="h-4 w-4 mt-1 text-slate-300" />
                    <div>
                      <p className="text-xs text-slate-300">Created</p>
                      <p className="text-slate-200">
                        {new Date(center.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {center.coordinator?.role && (
                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">{center.coordinator.role}</Badge>
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