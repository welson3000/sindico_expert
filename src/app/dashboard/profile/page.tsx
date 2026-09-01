import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/services/user.service';
import { ProfileClient } from '@/components/profile/ProfileClient';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const profile = await getUserProfile(session.user.id);

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-500">
        Não foi possível carregar os dados do perfil.
      </div>
    );
  }

  return <ProfileClient profile={profile} />;
}
