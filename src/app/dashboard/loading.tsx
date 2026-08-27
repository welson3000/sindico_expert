import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded-md" />
      <div className="h-4 w-96 bg-slate-850 rounded-md" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 h-48 flex flex-col justify-between p-4">
            <div className="space-y-3">
              <div className="h-4 w-20 bg-slate-800 rounded" />
              <div className="h-6 w-3/4 bg-slate-800 rounded" />
              <div className="h-4 w-1/2 bg-slate-850 rounded" />
            </div>
            <div className="h-9 w-full bg-slate-800 rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}
