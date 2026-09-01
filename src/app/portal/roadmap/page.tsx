import React from 'react';
import { listRoadmapItems } from '@/services/roadmap.service';
import { RoadmapClient } from '@/components/roadmap/RoadmapClient';

export default async function PortalRoadmapPage() {
  const items = await listRoadmapItems();
  return <RoadmapClient items={items} />;
}
