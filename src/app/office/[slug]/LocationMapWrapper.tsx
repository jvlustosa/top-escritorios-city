'use client';

import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false });

interface LocationMapWrapperProps {
  latitude: number;
  longitude: number;
  name: string;
}

export default function LocationMapWrapper({ latitude, longitude, name }: LocationMapWrapperProps) {
  return (
    <LocationMap
      latitude={latitude}
      longitude={longitude}
      name={name}
    />
  );
}
