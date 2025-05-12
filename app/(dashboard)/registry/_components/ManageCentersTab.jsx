// app/(dashboard)/registry/_components/ManageCentersTab.jsx
'use client';

import { useState, useEffect } from 'react';
// Link might not be needed if error display is fully handled by parent
// import Link from 'next/link';
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
import { createCenter, deleteCenterByRegistry } from '@/lib/actions/registry.actions.js';
import { toast } from "sonner";
import { PlusCircle, Building2, UserRound, Mail, CalendarDays, AlertTriangle, Loader2, Trash2, MoreHorizontal, Edit3 } from "lucide-react"; // Removed FileWarning if not used
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ManageCentersTab({ initialCenters = [], potentialCoordinators = [], currentUserId }) {
  const [centers, setCenters] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  useEffect(() => {
    // Ensure initialCenters is an array before sorting
    const validInitialCenters = Array.isArray(initialCenters) ? initialCenters : [];
    const sortedInitialCenters = [...validInitialCenters].sort((a, b) => a.name.localeCompare(b.name));
    setCenters(sortedInitialCenters);
  }, [initialCenters]);

  const handleCreateCenter = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsLoadingCreate(true);
    if (!newCenterName.trim() || !selectedCoordinatorId) {
      setFormError("Center name and coordinator are required.");
      setIsLoadingCreate(false); return;
    }
    const result = await createCenter({ name: newCenterName.trim(), coordinatorId: selectedCoordinatorId });
    if (result.success && result.center) {
      toast.success(`Center "${result.center.name}" created successfully!`);
      setCenters(prev => [...prev, result.center].sort((a, b) => a.name.localeCompare(b.name)));
      setIsCreateDialogOpen(false); setNewCenterName(''); setSelectedCoordinatorId(''); setFormError('');
    } else {
      const errorMsg = result.error || "Failed to create center.";
      setFormError(errorMsg); toast.error(errorMsg);
    }
    setIsLoadingCreate(false);
  };

  const openDeleteDialog = (center) => { setCenterToDelete(center); setIsDeleteDialogOpen(true); };

  const handleDeleteCenter = async () => {
    if (!centerToDelete || !currentUserId) {
      toast.error("Cannot delete center. User ID or Center missing."); setIsLoadingDelete(false); setIsDeleteDialogOpen(false); return;
    }
    setIsLoadingDelete(true);
    const result = await deleteCenterByRegistry({ centerId: centerToDelete.id, registryUserId: currentUserId });
    if (result.success) {
      toast.success(result.message || `Center "${centerToDelete.name}" deleted.`);
      setCenters(prev => prev.filter(c => c.id !== centerToDelete.id));
      setIsDeleteDialogOpen(false); setCenterToDelete(null);
    } else {
      toast.error(result.error || "Failed to delete center.");
    }
    setIsLoadingDelete(false);
  };

  const focusRingClass = "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

  return (
    <div className="flex flex-col h-full"> {/* Tab root is flex-col and takes full height from parent (<main>) */}
      {/* Section 1: Tab Header and "New Center" Button (fixed height) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 pb-4 sm:pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3 text-blue-800 dark:text-blue-300">
            <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-violet-700 dark:text-violet-500" />
            Academic Centers
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Manage all academic centers and their coordinators.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open && !isLoadingCreate) { setNewCenterName(''); setSelectedCoordinatorId(''); setFormError(''); } }}>
          <DialogTrigger asChild>
            <Button className={`gap-2 shadow-md hover:shadow-lg transition-shadow bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-semibold h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm ${focusRingClass}`}>
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" /><span>New Center</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-2xl rounded-xl">
            <DialogHeader className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center gap-2.5 text-xl font-semibold text-blue-800 dark:text-blue-300">
                <Building2 className="h-6 w-6 text-violet-700 dark:text-violet-500" />Create New Academic Center
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm pt-1">Register a new center and assign an available user as its coordinator.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCenter} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="centerName" className="font-medium text-slate-700 dark:text-slate-300">Center Name <span className="text-red-600 dark:text-red-500">*</span></Label>
                  <Input id="centerName" value={newCenterName} onChange={(e) => setNewCenterName(e.target.value)} placeholder="e.g., Faculty of Engineering" disabled={isLoadingCreate} className={`bg-slate-50 dark:bg-slate-700/60 border-slate-300 dark:border-slate-600/80 focus-visible:ring-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${focusRingClass}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinator" className="font-medium text-slate-700 dark:text-slate-300">Center Coordinator <span className="text-red-600 dark:text-red-500">*</span></Label>
                  <Select value={selectedCoordinatorId} onValueChange={setSelectedCoordinatorId} disabled={isLoadingCreate}>
                    <SelectTrigger className={`w-full bg-slate-50 dark:bg-slate-700/60 border-slate-300 dark:border-slate-600/80 focus:ring-blue-600 text-slate-900 dark:text-slate-50 data-[placeholder]:text-slate-400 dark:data-[placeholder]:text-slate-500 ${focusRingClass}`}><SelectValue placeholder="Select a coordinator" /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-lg">
                      {potentialCoordinators.length > 0 ? ( potentialCoordinators.map((user) => ( <SelectItem key={user.id} value={user.id} className={`focus:bg-violet-100 dark:focus:bg-violet-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/70 cursor-pointer ${focusRingClass}`}> <div className="flex items-center gap-3 py-1.5 px-1"><Avatar className="h-9 w-9"><AvatarImage src={user.image || undefined} /><AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium">{user.name ? user.name.match(/\b(\w)/g)?.join('').toUpperCase() : 'P'}</AvatarFallback></Avatar><div><span className="font-medium text-sm text-slate-800 dark:text-slate-100">{user.name}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{user.email} - <span className="capitalize">{user.role.toLowerCase()}</span></span></div></div></SelectItem> ))) : ( <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No available users to assign as coordinators.</div> )}
                    </SelectContent>
                  </Select>
                </div>
                {formError && ( <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 rounded-md"><p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2"><AlertTriangle className="h-4 w-4 flex-shrink-0"/> {formError}</p></div> )}
              <DialogFooter className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 gap-2 sm:gap-3"><DialogClose asChild><Button type="button" variant="outline" disabled={isLoadingCreate} className={`border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRingClass}`}>Cancel</Button></DialogClose><Button type="submit" disabled={isLoadingCreate} className={`bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-semibold ${focusRingClass}`}>{isLoadingCreate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isLoadingCreate ? "Creating..." : "Create Center"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Section 2: Content Area (Empty State or Table). flex-1 allows this to take remaining height. */}
      <div className="flex-1 overflow-hidden">
        {centers.length === 0 && !isLoadingCreate && !isLoadingDelete ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Card className="bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700/80 shadow-none rounded-xl w-full max-w-lg text-center">
              <CardContent className="py-12 sm:py-16 flex flex-col items-center justify-center">
                <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 dark:text-slate-500 mb-5 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-blue-800 dark:text-blue-300">No Academic Centers Yet</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-xs">Create the first center to get started with managing academic units.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className={`gap-2 bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-5 ${focusRingClass}`}><PlusCircle className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" />Create First Center</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex flex-col"> {/* This wrapper ensures Card can use h-full */}
            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 overflow-hidden"> {/* flex-1 and overflow-hidden for the direct parent of Card */}
              <Card className="h-full flex flex-col bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-lg rounded-xl">
                <ScrollArea className="flex-1 min-h-0"> {/* ScrollArea takes remaining space in Card. min-h-0 is crucial. */}
                  <Table className="min-w-full">
                    <TableHeader className="bg-slate-50 dark:bg-slate-700/50 sticky top-0 z-10 backdrop-blur-sm">
                      <TableRow className="border-b-slate-200 dark:border-b-slate-700">
                        <TableHead className="w-[50px] px-3 py-3.5 text-center"><Building2 className="h-4 w-4 inline-block text-slate-500 dark:text-slate-400"/></TableHead><TableHead className="min-w-[200px] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3.5 px-4">Center Name</TableHead><TableHead className="min-w-[220px] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3.5 px-4">Coordinator</TableHead><TableHead className="min-w-[180px] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3.5 px-4">Contact Email</TableHead><TableHead className="w-[130px] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3.5 px-4 text-center">Created On</TableHead><TableHead className="w-[100px] text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold tracking-wider py-3.5 px-4 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {centers.map((center) => (
                        <TableRow key={center.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors duration-150">
                          <TableCell className="px-3 py-3.5 text-center"><div className="p-2.5 rounded-lg bg-violet-100 dark:bg-violet-800/30 inline-flex"><Building2 className="h-5 w-5 text-violet-700 dark:text-violet-400" /></div></TableCell><TableCell className="font-medium text-slate-800 dark:text-slate-100 px-4 py-3.5 text-sm">{center.name}</TableCell><TableCell className="text-slate-700 dark:text-slate-200 px-4 py-3.5 text-sm">{center.coordinator ? (<div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarImage src={center.coordinator.image || undefined} /><AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium">{center.coordinator.name ? center.coordinator.name.match(/\b(\w)/g)?.join('').toUpperCase() : 'C'}</AvatarFallback></Avatar><div><p className="font-medium text-sm text-slate-800 dark:text-slate-100">{center.coordinator.name}</p><Badge variant="outline" className="mt-0.5 text-[10px] px-1.5 py-0.5 border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400 font-normal tracking-normal capitalize">{center.coordinator.role.toLowerCase()}</Badge></div></div>) : (<span className="text-slate-400 dark:text-slate-500 italic text-xs">Not Assigned</span>)}</TableCell><TableCell className="text-slate-600 dark:text-slate-300 px-4 py-3.5 text-sm">{center.coordinator?.email || <span className="text-slate-400 dark:text-slate-500 italic text-xs">N/A</span>}</TableCell><TableCell className="px-4 py-3.5 text-center"><div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-xs"><span>{new Date(center.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div></TableCell><TableCell className="px-4 py-3.5 text-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className={`h-8 w-8 p-0 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-700 ${focusRingClass}`}><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg"><DropdownMenuLabel className="text-xs px-2 py-1.5 text-slate-500 dark:text-slate-400">Actions</DropdownMenuLabel><DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700/50"/><DropdownMenuItem className={`text-slate-700 dark:text-slate-200 hover:!bg-slate-100 dark:hover:!bg-slate-700/50 text-sm flex items-center gap-2 cursor-pointer ${focusRingClass}`} onSelect={() => { toast.info("Edit functionality coming soon!")}}><Edit3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Edit</DropdownMenuItem><DropdownMenuItem className={`text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-700/20 text-sm flex items-center gap-2 cursor-pointer ${focusRingClass}`} onSelect={() => openDeleteDialog(center)} disabled={isLoadingDelete && centerToDelete?.id === center.id}>{isLoadingDelete && centerToDelete?.id === center.id ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-3.5 w-3.5" />} Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {centers.length === 0 && (isLoadingCreate || isLoadingDelete) && (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading centers...
                      </div>
                  )}
                </ScrollArea>
              </Card>
            </div>

            {/* Mobile Card View - ensure this also scrolls if needed */}
            <div className="md:hidden flex-1 space-y-4 overflow-y-auto pb-4"> {/* Added flex-1 and overflow-y-auto */}
              {centers.map((center) => (
                <Card key={center.id} className="bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-lg rounded-xl overflow-hidden">
                   <CardHeader className="p-4 flex flex-row justify-between items-start bg-slate-50/50 dark:bg-slate-700/30 border-b dark:border-slate-700/50">
                     <div className="flex items-center gap-3"><div className="p-2.5 rounded-lg bg-violet-100 dark:bg-violet-800/40"><Building2 className="h-5 w-5 text-violet-700 dark:text-violet-400"/></div><CardTitle className="text-md font-semibold text-blue-800 dark:text-blue-300 leading-tight">{center.name}</CardTitle></div>
                     <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className={`h-8 w-8 p-0 data-[state=open]:bg-slate-200 dark:data-[state=open]:bg-slate-600 ${focusRingClass}`}><MoreHorizontal className="h-4.5 w-4.5"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg"><DropdownMenuItem className={`text-slate-700 dark:text-slate-200 hover:!bg-slate-100 dark:hover:!bg-slate-700/50 text-sm flex items-center gap-2 cursor-pointer ${focusRingClass}`} onSelect={() => {toast.info("Edit functionality coming soon!")}}><Edit3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Edit</DropdownMenuItem><DropdownMenuItem className={`text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-700/20 text-sm flex items-center gap-2 cursor-pointer ${focusRingClass}`} onSelect={() => openDeleteDialog(center)} disabled={isLoadingDelete && centerToDelete?.id === center.id}>{isLoadingDelete && centerToDelete?.id === center.id ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-3.5 w-3.5" />} Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                   </CardHeader>
                   <CardContent className="p-4 space-y-3 text-xs">
                    <div className="flex items-start gap-2.5"><UserRound className="h-4 w-4 mt-0.5 text-violet-600 dark:text-violet-400 flex-shrink-0" /><div><p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider">Coordinator</p>{center.coordinator ? ( <> <p className="font-medium text-slate-700 dark:text-slate-200">{center.coordinator.name}</p> <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0.5 border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400 font-normal tracking-normal capitalize">{center.coordinator.role.toLowerCase()}</Badge> </> ) : <p className="italic text-slate-400 dark:text-slate-500">Not Assigned</p>}</div></div>
                    {center.coordinator?.email && (<div className="flex items-start gap-2.5"><Mail className="h-4 w-4 mt-0.5 text-violet-600 dark:text-violet-400 flex-shrink-0" /><div><p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider">Email</p><p className="text-slate-700 dark:text-slate-200">{center.coordinator.email}</p></div></div>)}
                    <div className="flex items-start gap-2.5"><CalendarDays className="h-4 w-4 mt-0.5 text-violet-600 dark:text-violet-400 flex-shrink-0" /><div><p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase tracking-wider">Created On</p><p className="text-slate-700 dark:text-slate-200">{new Date(center.createdAt).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</p></div></div>
                   </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 shadow-2xl rounded-xl">
            <DialogHeader className="pb-3"><DialogTitle className="flex items-center gap-2.5 text-lg font-semibold text-red-700 dark:text-red-400"><AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />Confirm Center Deletion</DialogTitle></DialogHeader>
            <DialogDescription className="text-slate-600 dark:text-slate-400 pt-1 pb-2 text-sm">Are you sure you want to delete the center <strong className="mx-1 text-slate-800 dark:text-slate-100">{centerToDelete?.name}</strong>?<br/>This action cannot be undone.</DialogDescription>
            <DialogFooter className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 gap-2 sm:gap-3"><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoadingDelete} className={`border-slate-300 hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${focusRingClass}`}>Cancel</Button><Button onClick={handleDeleteCenter} disabled={isLoadingDelete} className={`bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold ${focusRingClass}`}>{isLoadingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}{isLoadingDelete ? "Deleting..." : "Yes, Delete Center"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}