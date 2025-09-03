// app/(dashboard)/registry/settings/_components/RegistrySettingsClient.jsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/**
 * Client component for the Registry Settings page
 */
export default function RegistrySettingsClient({ initialSettings = {} }) {
  const [settings, setSettings] = useState({
    MAX_COURSES_PER_LECTURER: initialSettings.MAX_COURSES_PER_LECTURER || '3',
    // Add any other settings here
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateSettings = () => {
    const maxCourses = parseInt(settings.MAX_COURSES_PER_LECTURER, 10);
    if (isNaN(maxCourses) || maxCourses <= 0) {
      toast.error("Maximum courses per lecturer must be a positive number");
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSettings()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Settings saved successfully");
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("An error occurred while saving settings");
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure general system settings
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="MAX_COURSES_PER_LECTURER" className="text-base font-semibold">
                  Maximum Courses Per Lecturer
                </Label>
                <p className="text-sm text-muted-foreground mt-1 mb-2">
                  Set the maximum number of courses that can be assigned to a lecturer by coordinators
                </p>
                <Input
                  id="MAX_COURSES_PER_LECTURER"
                  name="MAX_COURSES_PER_LECTURER"
                  type="number"
                  min="1"
                  className="max-w-xs"
                  value={settings.MAX_COURSES_PER_LECTURER}
                  onChange={handleInputChange}
                />
              </div>
              
              <Separator className="my-4" />
              
              {/* Add additional settings here as needed */}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading} 
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
