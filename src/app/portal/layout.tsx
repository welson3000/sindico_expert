import { auth } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';
import { redirect } from 'next/navigation';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <AppShell user={{ name: session.user.name, role: session.user.role }}>
      {children}
    </AppShell>
  );
}
