import React from 'react';
import type { WasteContainer } from '../../services/wasteContainerService';
import WasteCollectionTab, { WasteCollectionTabProps } from './wasteCollection';

interface WasteContainerTabProps {
  containers: WasteContainer[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const WasteContainerTab: React.FC<WasteContainerTabProps> = ({ containers, loading, error, searchTerm }) => {
  return (
    <WasteCollectionTab
      containers={containers}
      loading={loading}
      error={error}
      parentSearchTerm={searchTerm}
    />
  );
};

export default WasteContainerTab;