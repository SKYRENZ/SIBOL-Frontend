import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../../Components/common/Table';
import { fetchAdditives } from '../../store/slices/additivesSlice';

type Props = {
  searchTerm: string;
  onSearchChange: (s: string) => void;
};

const AdditivesTab: React.FC<Props> = ({ searchTerm, onSearchChange }) => {
  const dispatch = useDispatch<any>();
  const { items, loading, error } = useSelector((s: any) => s.additives || { items: [], loading: false, error: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchAdditives());
  }, [dispatch]);

  // Use parent searchTerm (shared SearchBar) instead of local input
  const filtered = items.filter((row: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
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
      />
    </div>
  );
};

export default AdditivesTab;