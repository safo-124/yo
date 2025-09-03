// app/api/settings/route.js
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/actions/auth.actions';
import { updateSetting } from '@/lib/settings';

export async function POST(request) {
  try {
    // Check authentication and authorization
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.role !== 'REGISTRY') {
      return NextResponse.json(
        { success: false, error: 'Not authorized to modify settings' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Array to store all update operations
    const updates = [];
    
    // Process MAX_COURSES_PER_LECTURER setting
    if (body.MAX_COURSES_PER_LECTURER) {
      const maxCourses = parseInt(body.MAX_COURSES_PER_LECTURER, 10);
      if (isNaN(maxCourses) || maxCourses <= 0) {
        return NextResponse.json(
          { success: false, error: 'Maximum courses per lecturer must be a positive number' },
          { status: 400 }
        );
      }
      
      updates.push(updateSetting('MAX_COURSES_PER_LECTURER', String(maxCourses)));
    }
    
    // Process other settings here...
    
    // Wait for all updates to complete
    const results = await Promise.all(updates);
    
    // Check for any errors
    const errors = results.filter(result => !result.success);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update one or more settings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
