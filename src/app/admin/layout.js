import './admin.css';
import AdminSidebarClient from '@/components/admin/AdminSidebarClient';

export const metadata = {
  title: {
    default: 'Admin Dashboard | SlideEase',
    template: '%s | SlideEase Admin'
  },
  robots: 'noindex, nofollow'
};

export default function AdminLayout({ children }) {
  return (
    <AdminSidebarClient>
      {children}
    </AdminSidebarClient>
  );
}
