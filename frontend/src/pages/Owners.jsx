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
import { ownerAPI } from '../api/endpoints';

const schema = z.object({
  name: z.string().min(3, 'Name must be 3+ characters').regex(/^[A-Za-z\s]+$/, 'Name: alphabetic only'),
  phone: z.string().regex(/^(079|078|072|073)\d{7}$/, 'Must be a valid Rwandan number'),
});

export default function Owners() {
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
      const { data: res } = await ownerAPI.getAll({ page: p, limit: 10 });
      setData(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await ownerAPI.update(editId, formData);
        toast.success('Owner updated', { autoClose: 1000 });
      } else {
        await ownerAPI.create(formData);
        toast.success('Owner created', { autoClose: 1000 });
      }
      closeModal();
      fetchData(page);
    } catch {}
  };

  const handleDelete = (id) => {
    openConfirm('Delete this owner? All related data will be affected.', async () => {
      try {
        await ownerAPI.delete(id);
        toast.success('Owner deleted', { autoClose: 1000 });
        fetchData(page);
      } catch {}
    });
  };

  const openEdit = (row) => { form.reset(row); openModal('edit', row); };
  const openCreate = () => { form.reset({ name: '', phone: '' }); openModal('create'); };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'createdAt', label: 'Registered', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Owners" subtitle="Manage bus owners"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200 transition-all">
            <Plus size={16} /> Add Owner
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

      <Modal open={modal.open && ['create', 'edit'].includes(modal.type)} onClose={closeModal} title={isEdit ? 'Edit Owner' : 'Add Owner'}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
            <input {...form.register('name')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {form.formState.errors.name && <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Phone (Rwandan)</label>
            <input {...form.register('phone')} placeholder="079XXXXXXX" className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {form.formState.errors.phone && <p className="text-xs text-red-500 mt-1">{form.formState.errors.phone.message}</p>}
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
