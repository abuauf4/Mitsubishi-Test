import AdminSidebar from '@/components/admin/Sidebar';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Admin Panel | Mitsubishi Motor Indonesia',
  description: 'Admin panel for managing Mitsubishi Motor Indonesia website content',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
