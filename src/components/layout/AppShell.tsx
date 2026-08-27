"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ClipboardList, User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { signOut } from 'next-auth/react';

interface AppShellProps {
  children: ReactNode;
  user?: {
    name?: string | null;
    role?: string | null;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();

  const isFornecedor = user?.role === 'FORNECEDOR';

  const navItems = isFornecedor ? [
    { href: '/portal/mural', label: 'Mural', icon: ClipboardList },
    { href: '/portal/proposals', label: 'Propostas', icon: Building2 },
    { href: '/portal/profile', label: 'Perfil', icon: User },
  ] : [
    { href: '/dashboard/condominiums', label: 'Condomínios', icon: Building2 },
    { href: '/dashboard/requests', label: 'Solicitações', icon: ClipboardList },
    { href: '/dashboard/profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white border-b">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger>
              <span className="inline-flex h-9 w-9 -ml-2 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <Menu className="h-5 w-5" />
              </span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col h-full">
                <div className="py-4 border-b">
                  <h2 className="font-bold text-lg">Síndico Expert</h2>
                  <p className="text-sm text-gray-500">{user?.name}</p>
                </div>
                <nav className="flex-1 py-4 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md ${pathname.startsWith(item.href) ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="py-4 border-t">
                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => signOut({ callbackUrl: '/login' })}>
                    <LogOut className="h-5 w-5 mr-3" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg text-primary">Síndico Expert</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
        <div className="p-4 border-b h-16 flex items-center">
          <span className="font-bold text-xl text-primary">Síndico Expert</span>
        </div>
        <div className="p-4">
          <div className="font-medium">{user?.name}</div>
          <div className="text-xs text-gray-500">{user?.role}</div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.startsWith(item.href) ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around p-2 pb-safe z-30">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] ${isActive ? 'text-primary' : 'text-gray-500'}`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
