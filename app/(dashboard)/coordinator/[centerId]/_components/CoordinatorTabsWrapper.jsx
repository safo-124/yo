// app/(dashboard)/coordinator/[centerId]/_components/CoordinatorTabsWrapper.jsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, Users, Building, LayoutDashboard } from "lucide-react"; // Icons
// Link from 'next/link' is not used for tab switching here, but kept if other links exist
// Button from '@/components/ui/button' might be used for general button styling if needed elsewhere

// Import your actual tab content components
import ManageCoordinatorDepartmentsTab from './ManageCoordinatorDepartmentsTab';
import ManageCoordinatorLecturersTab from './ManageCoordinatorLecturersTab';
import ManageCoordinatorClaimsTab from './ManageCoordinatorClaimsTab';

export default function CoordinatorTabsWrapper({
  centerId,
  centerName,
  initialOverviewData,
  initialDepartments,
  initialLecturers,
  initialClaims,
  allClaimsForFiltering,
  coordinatorUserId
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    lecturers: overviewLecturers,
    departments: overviewDepartments,
    claims: overviewPendingClaims
  } = initialOverviewData;

  const summaryCards = [
    { title: "Total Lecturers", value: overviewLecturers.length, icon: Users, tabValue: "lecturers", iconColor: "text-blue-600 dark:text-blue-400", valueColor: "text-blue-700 dark:text-blue-500" },
    { title: "Total Departments", value: overviewDepartments.length, icon: Building, tabValue: "departments", iconColor: "text-blue-600 dark:text-blue-400", valueColor: "text-blue-700 dark:text-blue-500" },
    { title: "Pending Claims", value: overviewPendingClaims.length, icon: ListChecks, tabValue: "claims", iconColor: "text-red-600 dark:text-red-400", valueColor: "text-red-700 dark:text-red-500" },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 rounded-lg p-1 sm:grid-cols-4 md:w-auto md:inline-grid bg-slate-100 dark:bg-slate-800">
        <TabsTrigger
          value="overview"
          className="px-3 py-1.5 sm:px-4 sm:py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 data-[state=active]:bg-violet-700 data-[state=active]:text-slate-50 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-slate-50 rounded-md transition-all"
        >
          <LayoutDashboard className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Overview
        </TabsTrigger>
        <TabsTrigger
          value="departments"
          className="px-3 py-1.5 sm:px-4 sm:py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 data-[state=active]:bg-violet-700 data-[state=active]:text-slate-50 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-slate-50 rounded-md transition-all"
        >
          <Building className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Departments
        </TabsTrigger>
        <TabsTrigger
          value="lecturers"
          className="px-3 py-1.5 sm:px-4 sm:py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 data-[state=active]:bg-violet-700 data-[state=active]:text-slate-50 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-slate-50 rounded-md transition-all"
        >
          <Users className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Lecturers
        </TabsTrigger>
        <TabsTrigger
          value="claims"
          className="px-3 py-1.5 sm:px-4 sm:py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 data-[state=active]:bg-violet-700 data-[state=active]:text-slate-50 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-slate-50 rounded-md transition-all"
        >
          <ListChecks className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Claims
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-violet-700 dark:text-violet-500">Center Overview</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Summary of activities and statistics for {centerName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {summaryCards.map((card) => (
                <Card key={card.title} className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">{card.title}</CardTitle>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                      <button
                        onClick={() => setActiveTab(card.tabValue)}
                        className="p-0 h-auto font-medium hover:underline focus:outline-none focus:ring-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        View Details &rarr;
                      </button>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-violet-700 dark:text-violet-500">
                {overviewPendingClaims.length > 0 ? "Recent Pending Claims" : "No Pending Claims"}
              </h3>
              {overviewPendingClaims.length > 0 ? (
                <>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {overviewPendingClaims.slice(0, 5).map(claim => (
                      <li key={claim.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                        Claim ID: <span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">{claim.id.substring(0,8)}...</span> 
                        <span className="mx-1">by</span> 
                        <span className="font-medium text-slate-800 dark:text-slate-200">{claim.submittedBy?.name || 'N/A'}</span>
                        <span className="mx-1">- Type:</span> 
                        <span className="font-medium text-slate-800 dark:text-slate-200">{claim.claimType}</span>
                      </li>
                    ))}
                  </ul>
                  {overviewPendingClaims.length > 5 && (
                    <button
                      onClick={() => setActiveTab("claims")}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      View all {overviewPendingClaims.length} pending claims &rarr;
                    </button>
                  )}
                </>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 mt-2">There are currently no claims awaiting your review.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="departments" className="mt-6">
        <ManageCoordinatorDepartmentsTab
          centerId={centerId}
          initialDepartments={initialDepartments}
          coordinatorUserId={coordinatorUserId}
        />
      </TabsContent>

      <TabsContent value="lecturers" className="mt-6">
        <ManageCoordinatorLecturersTab
          centerId={centerId}
          initialLecturers={initialLecturers}
          departmentsForAssignment={initialDepartments}
          coordinatorUserId={coordinatorUserId}
        />
      </TabsContent>

      <TabsContent value="claims" className="mt-6">
        <ManageCoordinatorClaimsTab
          centerId={centerId}
          initialClaims={initialClaims}
          allClaimsFromCenter={allClaimsForFiltering}
          coordinatorUserId={coordinatorUserId}
        />
      </TabsContent>
    </Tabs>
  );
}