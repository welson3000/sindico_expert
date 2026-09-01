"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ClipboardList, User, LogOut, Menu, ShieldCheck } from 'lucide-react';
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

  const navItems = isFornecedor
    ? [
        { href: '/portal/mural', label: 'Mural de Cotações', icon: ClipboardList },
        { href: '/portal/profile', label: 'Perfil', icon: User },
      ]
    : [
        { href: '/dashboard/condominiums', label: 'Condomínios', icon: Building2 },
        { href: '/dashboard/requests', label: 'Solicitações', icon: ClipboardList },
        { href: '/dashboard/profile', label: 'Perfil', icon: User },
      ];

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 flex flex-col md:flex-row antialiased">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-[#0E4B78] text-white backdrop-blur shadow-md">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger>
              <span className="inline-flex h-9 w-9 -ml-2 items-center justify-center rounded-lg hover:bg-sky-800/60 text-white cursor-pointer">
                <Menu className="h-5 w-5" />
              </span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-[#0E4B78] border-r border-sky-800 text-white">
              <div className="flex flex-col h-full">
                <div className="py-4 border-b border-sky-800/80">
                  <h2 className="font-bold text-lg text-white">
                    Síndico <span className="text-orange-400 font-extrabold">Expert</span>
                  </h2>
                  <p className="text-sm font-semibold text-sky-100 truncate mt-1">{user?.name}</p>
                  <p className="text-xs text-sky-300/80 font-mono">{user?.role}</p>
                </div>
                <nav className="flex-1 py-4 space-y-1.5">
                  {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md font-semibold'
                            : 'text-sky-100/90 hover:bg-sky-800/60 hover:text-white'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="py-4 border-t border-sky-800/80">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-rose-300 hover:text-white hover:bg-rose-600/30"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sair da Conta
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg text-white">
            Síndico <span className="text-orange-400 font-extrabold">Expert</span>
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs shadow-inner">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0E4B78] border-r border-sky-900/60 h-screen sticky top-0 text-white shadow-xl">
        <div className="p-4 border-b border-sky-800/80 h-16 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-orange-400" />
          <span className="font-bold text-xl text-white">
            Síndico <span className="text-orange-400 font-extrabold">Expert</span>
          </span>
        </div>

        <div className="p-4 border-b border-sky-800/60 bg-sky-900/40">
          <div className="font-semibold text-sm text-white truncate">{user?.name}</div>
          <div className="text-xs font-mono text-orange-300 mt-0.5">{user?.role}</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-sky-100/90 hover:bg-sky-800/60 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sky-800/80">
          <Button
            variant="ghost"
            className="w-full justify-start text-rose-300 hover:text-white hover:bg-rose-600/30 rounded-xl"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair da Conta
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto bg-[#F4F7FA] text-slate-800">
        <div className="p-4 md:p-8">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#0E4B78] border-t border-sky-800 flex justify-around p-2 pb-safe z-30 shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] ${
                isActive ? 'text-orange-400 font-semibold' : 'text-sky-200/70'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
