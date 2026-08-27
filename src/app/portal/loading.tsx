import React from 'react';
import { Card } from '@/components/ui/card';

export default function PortalLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-72 bg-slate-800 rounded-md" />
      <div className="h-4 w-96 bg-slate-850 rounded-md" />

      <Card className="bg-slate-900 border-slate-800 h-64 p-6 space-y-4">
        <div className="h-6 w-1/3 bg-slate-800 rounded" />
        <div className="h-4 w-1/4 bg-slate-850 rounded" />
        <div className="h-32 w-full bg-slate-950 rounded-xl" />
      </Card>
    </div>
  );
}
