// app/(dashboard)/coordinator/[centerId]/_components/CoordinatorTabsWrapper.jsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, Users, Building, LayoutDashboard } from "lucide-react"; // Icons
import Link from 'next/link'; // Keep for other links if any, not for tab switching here
import { Button } from '@/components/ui/button'; // For styling if needed

// Import your actual tab content components
import ManageCoordinatorDepartmentsTab from './ManageCoordinatorDepartmentsTab';
import ManageCoordinatorLecturersTab from './ManageCoordinatorLecturersTab';
import ManageCoordinatorClaimsTab from './ManageCoordinatorClaimsTab';

export default function CoordinatorTabsWrapper({
  centerId,
  centerName,
  initialOverviewData, // Contains lecturers, departments, pendingClaims for overview
  initialDepartments,
  initialLecturers,
  initialClaims, // These are the pending claims for the claims tab
  allClaimsForFiltering, // All claims for the claims tab filter
  coordinatorUserId
}) {
  const [activeTab, setActiveTab] = useState("overview"); // Default active tab

  const {
    lecturers: overviewLecturers,
    departments: overviewDepartments,
    claims: overviewPendingClaims
  } = initialOverviewData;

  const summaryCards = [
    { title: "Total Lecturers", value: overviewLecturers.length, icon: Users, tabValue: "lecturers" },
    { title: "Total Departments", value: overviewDepartments.length, icon: Building, tabValue: "departments" },
    { title: "Pending Claims", value: overviewPendingClaims.length, icon: ListChecks, tabValue: "claims" },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:w-auto md:inline-grid">
        <TabsTrigger value="overview"> <LayoutDashboard className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Overview</TabsTrigger>
        <TabsTrigger value="departments"><Building className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Departments</TabsTrigger>
        <TabsTrigger value="lecturers"><Users className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Lecturers</TabsTrigger>
        <TabsTrigger value="claims"><ListChecks className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Claims</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Center Overview</CardTitle>
            <CardDescription>Summary of activities and statistics for {centerName}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {summaryCards.map((card) => (
                <Card key={card.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <card.icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                      <button
                        onClick={() => setActiveTab(card.tabValue)}
                        className="p-0 h-auto font-normal hover:underline focus:outline-none focus:ring-0 text-blue-600 dark:text-blue-400"
                      >
                         View &rarr;
                      </button>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {overviewPendingClaims.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Recent Pending Claims:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {overviewPendingClaims.slice(0, 5).map(claim => (
                    <li key={claim.id}>
                      Claim ID: <span className="font-mono text-xs">{claim.id.substring(0,8)}...</span> by {claim.submittedBy?.name || 'N/A'} - Type: {claim.claimType}
                    </li>
                  ))}
                </ul>
                {overviewPendingClaims.length > 5 && <p className="text-xs text-muted-foreground mt-2">And {overviewPendingClaims.length - 5} more...</p>}
              </div>
            )}
            {overviewPendingClaims.length === 0 && (
              <p className="text-muted-foreground mt-4">No pending claims at the moment.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="departments" className="mt-4">
        <ManageCoordinatorDepartmentsTab
          centerId={centerId}
          initialDepartments={initialDepartments}
          coordinatorUserId={coordinatorUserId}
        />
      </TabsContent>

      <TabsContent value="lecturers" className="mt-4">
        <ManageCoordinatorLecturersTab
          centerId={centerId}
          initialLecturers={initialLecturers}
          departmentsForAssignment={initialDepartments} // Pass all departments for assignment
          coordinatorUserId={coordinatorUserId}
        />
      </TabsContent>

      <TabsContent value="claims" className="mt-4">
        <ManageCoordinatorClaimsTab
          centerId={centerId}
          initialClaims={initialClaims} // These are the pending claims
          allClaimsFromCenter={allClaimsForFiltering}
          coordinatorUserId={coordinatorUserId}
        />
      </TabsContent>
    </Tabs>
  );
}
