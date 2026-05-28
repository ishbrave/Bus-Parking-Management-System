import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useUI } from '../hooks/useUI';
import { parkingSpaceAPI } from '../api/endpoints';

const schema = z.object({
  spaceNumber: z.string().min(1, 'Space number is required'),
  location: z.string().min(1, 'Location is required'),
  pricePerDay: z.coerce.number().positive('Must be positive'),
  status: z.enum(['Available', 'Occupied', 'Maintenance']),
});

export default function ParkingSpaces() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { modal, openModal, closeModal, openConfirm } = useUI();

  const form = useForm({ resolver: zodResolver(schema) });
  const editId = modal.data?._id;
  const isEdit = !!editId;

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data: res } = await parkingSpaceAPI.getAll({ page: p, limit: 10 });
      setData(res.data);
      setPagination(res.pagination);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await parkingSpaceAPI.update(editId, formData);
        toast.success('Parking space updated', { autoClose: 1000 });
      } else {
        await parkingSpaceAPI.create(formData);
        toast.success('Parking space created', { autoClose: 1000 });
      }
      closeModal();
      fetchData(page);
    } catch {
      // handled
    }
  };

  const handleDelete = (id) => {
    openConfirm('Are you sure you want to delete this parking space?', async () => {
      try {
        await parkingSpaceAPI.delete(id);
        toast.success('Parking space deleted', { autoClose: 1000 });
        fetchData(page);
      } catch {
        // handled
      }
    });
  };

  const openEdit = (row) => {
    form.reset(row);
    openModal('edit', row);
  };

  const openCreate = () => {
    form.reset({ spaceNumber: '', location: '', pricePerDay: '', status: 'Available' });
    openModal('create');
  };

  const statusBadge = (status) => {
    const colors = {
      Available: 'bg-green-50 text-green-600 border-green-200',
      Occupied: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      Maintenance: 'bg-red-50 text-red-600 border-red-200',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[status] || ''}`}>
        {status}
      </span>
    );
  };

  const columns = [
    { key: 'spaceNumber', label: 'Space #' },
    { key: 'location', label: 'Location' },
    { key: 'pricePerDay', label: 'Price/Day', render: (r) => `RWF ${r.pricePerDay?.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (r) => statusBadge(r.status) },
  ];

  return (
    <div>
      <PageHeader
        title="Parking Spaces"
        subtitle="Manage bus parking spaces"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200 transition-all">
            <Plus size={16} /> Add Space
          </button>
        }
      />

      <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-3 sm:p-5 shadow-lg shadow-blue-100/30">
        <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} loading={loading}
          actions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                <Edit2 size={15} />
              </button>
              <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          )}
        />
      </div>

      <Modal open={modal.open && ['create', 'edit'].includes(modal.type)} onClose={closeModal} title={isEdit ? 'Edit Parking Space' : 'Add Parking Space'}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Space Number</label>
            <input {...form.register('spaceNumber')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {form.formState.errors.spaceNumber && <p className="text-xs text-red-500 mt-1">{form.formState.errors.spaceNumber.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
            <input {...form.register('location')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {form.formState.errors.location && <p className="text-xs text-red-500 mt-1">{form.formState.errors.location.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Price Per Day (RWF)</label>
            <input type="number" {...form.register('pricePerDay')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {form.formState.errors.pricePerDay && <p className="text-xs text-red-500 mt-1">{form.formState.errors.pricePerDay.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
            <select {...form.register('status')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200 transition-all">
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal />
    </div>
  );
}
