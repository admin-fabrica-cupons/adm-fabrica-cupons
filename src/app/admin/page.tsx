'use client';
import Admin from '@/page-views/Admin';
import ProtectedRoute from '@/components/Common/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <Admin />
    </ProtectedRoute>
  );
}
