import React from 'react';
import type { WasteContainer } from '../../services/wasteContainerService';
import WasteCollectionTab from './wasteCollection';

interface WasteContainerTabProps {
  containers: WasteContainer[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const WasteContainerTab: React.FC<WasteContainerTabProps> = (props) => {
  // currently the inner WasteCollectionTab manages its own state;
  // keep props for future use or forward them later
  return <WasteCollectionTab />;
};

export default WasteContainerTab;