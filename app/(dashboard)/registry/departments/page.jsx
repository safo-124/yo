// app/(dashboard)/registry/departments/page.jsx
import { redirect } from 'next/navigation';

export default function DepartmentsPage() {
  // Redirect to courses page where departments are now managed
  redirect('/registry/courses');
}