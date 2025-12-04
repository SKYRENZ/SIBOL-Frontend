import React from 'react';
import WasteCollectionTab from './wasteCollection';

interface WasteContainerTabProps {
  parentSearchTerm?: string;
}

const WasteContainerTab: React.FC<WasteContainerTabProps> = ({ parentSearchTerm }) => {
  return <WasteCollectionTab parentSearchTerm={parentSearchTerm} />;
};

export default WasteContainerTab;