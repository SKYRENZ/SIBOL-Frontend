import React from 'react';
import WasteCollectionTab from './wasteCollection';

interface WasteContainerTabProps {
  filterTypes?: string[]; // ✅ Added
}

const WasteContainerTab: React.FC<WasteContainerTabProps> = ({ 
  filterTypes = ['container-status', 'waste-type'] // ✅ Default values
}) => {
  return <WasteCollectionTab filterTypes={filterTypes} />;
};

export default WasteContainerTab;