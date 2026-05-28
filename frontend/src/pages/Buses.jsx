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
import { busAPI, ownerAPI } from '../api/endpoints';

const schema = z.object({
  plateNumber: z
    .string()
    .min(1, 'Plate number is required')
    .regex(/^[A-Za-z]{3}\d{3}[A-Za-z]$/, 'Must be Rwandan format (e.g. RAB123A)')
    .transform((v) => v.toUpperCase()),
  busType: z.string().min(1, 'Bus type is required'),
  owner: z.string().min(1, 'Owner is required'),
});

export default function Buses() {
  const [data, setData] = useState([]);
  const [owners, setOwners] = useState([]);
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
      const [bRes, oRes] = await Promise.all([busAPI.getAll({ page: p, limit: 10 }), ownerAPI.getAll({ page: 1, limit: 100 })]);
      setData(bRes.data.data);
      setPagination(bRes.data.pagination);
      setOwners(oRes.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await busAPI.update(editId, formData);
        toast.success('Bus updated', { autoClose: 1000 });
      } else {
        await busAPI.create(formData);
        toast.success('Bus created', { autoClose: 1000 });
      }
      closeModal();
      fetchData(page);
    } catch {}
  };

  const handleDelete = (id) => {
    openConfirm('Delete this bus?', async () => {
      try {
        await busAPI.delete(id);
        toast.success('Bus deleted', { autoClose: 1000 });
        fetchData(page);
      } catch {}
    });
  };

  const openEdit = (row) => { form.reset({ plateNumber: row.plateNumber, busType: row.busType, owner: row.owner?._id }); openModal('edit', row); };
  const openCreate = () => { form.reset({ plateNumber: '', busType: '', owner: '' }); openModal('create'); };

  const columns = [
    { key: 'plateNumber', label: 'Plate #' },
    { key: 'busType', label: 'Bus Type' },
    { key: 'owner', label: 'Owner', render: (r) => r.owner?.name || 'N/A' },
    { key: 'ownerPhone', label: 'Owner Phone', render: (r) => r.owner?.phone || 'N/A' },
  ];

  return (
    <div>
      <PageHeader title="Buses" subtitle="Manage registered buses"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200 transition-all">
            <Plus size={16} /> Add Bus
          </button>
        }
      />
      <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-3 sm:p-5 shadow-lg shadow-blue-100/30">
        <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} loading={loading}
          actions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 size={15} /></button>
              <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
            </div>
          )}
        />
      </div>

      <Modal open={modal.open && ['create', 'edit'].includes(modal.type)} onClose={closeModal} title={isEdit ? 'Edit Bus' : 'Add Bus'}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Plate Number</label>
            <input {...form.register('plateNumber')} placeholder="RAB123A" className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {form.formState.errors.plateNumber && <p className="text-xs text-red-500 mt-1">{form.formState.errors.plateNumber.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Bus Type</label>
            <input {...form.register('busType')} placeholder="e.g. Coaster, Hiace, Scania" className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {form.formState.errors.busType && <p className="text-xs text-red-500 mt-1">{form.formState.errors.busType.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Owner</label>
            <select {...form.register('owner')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">Select owner...</option>
              {owners.map((o) => <option key={o._id} value={o._id}>{o.name} ({o.phone})</option>)}
            </select>
            {form.formState.errors.owner && <p className="text-xs text-red-500 mt-1">{form.formState.errors.owner.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal />
    </div>
  );
}
