import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../../Components/common/Table';
import { fetchAdditives } from '../../store/slices/additivesSlice';

interface AdditivesTabProps {
  filterTypes?: string[];
  searchTerm?: string; // ✅ Added
  onSearchChange?: (value: string) => void; // ✅ Added
}

const AdditivesTab: React.FC<AdditivesTabProps> = ({ 
  filterTypes = ['additive-stage', 'machine'],
  searchTerm = '',
  onSearchChange
}) => {
  const dispatch = useDispatch<any>();
  const { items, loading, error } = useSelector((s: any) => s.additives || { items: [], loading: false, error: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Local search state if parent doesn't provide it
  const [localSearch, setLocalSearch] = useState('');
  
  const currentSearch = searchTerm || localSearch;
  const handleSearchChange = onSearchChange || setLocalSearch;

  useEffect(() => {
    dispatch(fetchAdditives());
  }, [dispatch]);

  // Use parent searchTerm (shared SearchBar) instead of local input
  const filtered = items.filter((row: any) => {
    if (!currentSearch) return true;
    const q = currentSearch.toLowerCase();
    return (
      String(row.additive_input ?? '').toLowerCase().includes(q) ||
      String(row.stage ?? '').toLowerCase().includes(q) ||
      String(row.value ?? '').toLowerCase().includes(q) ||
      String(row.units ?? '').toLowerCase().includes(q) ||
      (row.person_in_charge && String(row.person_in_charge).toLowerCase().includes(q))
    );
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const columns = [
    { key: 'additive_input', label: 'Additive Input' },
    { key: 'stage', label: 'Stage' },
    { key: 'value', label: 'Value' },
    { key: 'units', label: 'Units' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'person_in_charge', label: 'Person in Charge' },
  ];

  return (
    <div>
      {/* SearchBar is shared in parent; keep empty header if you need spacing */}
      <div className="mb-4" aria-hidden />
      <Table
        columns={columns}
        data={paginated}
        loading={loading}
        emptyMessage={error ? `Error: ${error}` : 'No chemical additives data available'}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filtered.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (sz: number) => { setPageSize(sz); setCurrentPage(1); }
        }}
        filterTypes={filterTypes} // Pass filterTypes to Table
      />
      <div className="text-center py-10 text-gray-500">
        <p>Additives Tab - Coming Soon</p>
        <p className="text-xs mt-2">Filter Types: {filterTypes.join(', ')}</p>
        {currentSearch && <p className="text-xs">Search: {currentSearch}</p>}
      </div>
    </div>
  );
};

export default AdditivesTab;