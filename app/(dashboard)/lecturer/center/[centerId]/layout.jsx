// app/(dashboard)/lecturer/center/[centerId]/layout.jsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth.actions';
import prisma from '@/lib/prisma';
import LecturerLayoutClient from './LecturerLayoutClient';

export default async function LecturerCenterLayout({ children, params }) {
  const session = await getSession();
  const { centerId } = await params;

  if (!session?.userId) redirect('/login');
  if (session.role !== 'LECTURER' && session.role !== 'COORDINATOR') redirect('/unauthorized');

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      lecturerCenterId: true,
      lecturerCourseAssignments: {
        include: {
          course: {
            include: {
              program: {
                include: {
                  departmentAssignments: {
                    include: {
                      department: {
                        include: {
                          centerAssignments: {
                            include: {
                              center: { select: { id: true } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // For lecturers, verify they're accessing their assigned center
  if (session.role === 'LECTURER') {
    let assignedCenterId = currentUser?.lecturerCenterId;

    if (!assignedCenterId && currentUser?.lecturerCourseAssignments?.length > 0) {
      const firstAssignment = currentUser.lecturerCourseAssignments[0];
      const departmentAssignments = firstAssignment.course.program.departmentAssignments;
      if (departmentAssignments?.length > 0) {
        const centerAssignments = departmentAssignments[0].department.centerAssignments;
        if (centerAssignments?.length > 0) {
          assignedCenterId = centerAssignments[0].center.id;
        }
      }
    }

    if (assignedCenterId && assignedCenterId !== centerId) {
      redirect(`/lecturer/center/${assignedCenterId}/dashboard`);
    } else if (!assignedCenterId) {
      redirect('/lecturer/assignment-pending');
    }
  }

  // For coordinators, verify this is their center
  if (session.role === 'COORDINATOR') {
    const coordinatorCenter = await prisma.center.findUnique({
      where: { id: centerId, coordinatorId: session.userId },
      select: { id: true },
    });
    if (!coordinatorCenter) {
      redirect('/unauthorized?error=coordinator_center_mismatch');
    }
  }

  let centerName = 'Your Center';
  try {
    const center = await prisma.center.findUnique({
      where: { id: centerId },
      select: { name: true },
    });
    if (center) centerName = center.name;
  } catch (error) {
    console.error('Error fetching center name:', error);
  }

  return (
    <LecturerLayoutClient session={session} centerName={centerName} centerId={centerId}>
      {children}
    </LecturerLayoutClient>
  );
}
