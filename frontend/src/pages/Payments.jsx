import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, CreditCard, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useUI } from '../hooks/useUI';
import { paymentAPI, parkingRecordAPI } from '../api/endpoints';

const schema = z.object({
  parkingRecord: z.string().min(1, 'Parking record is required'),
  paymentDate: z.string().min(1, 'Date is required'),
  receivedBy: z.string().min(1, 'Receiver name is required'),
  amount: z.coerce.number().positive('Must be positive'),
  paymentType: z.enum(['partial', 'final']),
});

export default function Payments() {
  const [data, setData] = useState([]);
  const [openRecords, setOpenRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const { modal, openModal, closeModal, openConfirm } = useUI();

  const form = useForm({ resolver: zodResolver(schema) });

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        paymentAPI.getAll({ page: p, limit: 10 }),
        parkingRecordAPI.getAll({ page: 1, limit: 100 }),
      ]);
      setData(pRes.data.data);
      setPagination(pRes.data.pagination);
      setOpenRecords(rRes.data.data.filter((r) => r.paymentStatus !== 'Paid' && r.paymentStatus !== 'Cancelled'));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

  const handleSubmit = async (formData) => {
    try {
      await paymentAPI.create(formData);
      const msg = formData.paymentType === 'final' ? 'Checkout complete — space freed' : 'Partial payment recorded';
      toast.success(msg, { autoClose: 1500 });
      closeModal();
      setCheckoutInfo(null);
      setSelectedRecord(null);
      fetchData(page);
    } catch {}
  };

  const handleDelete = (id) => {
    openConfirm('Delete this payment? The parking record state will be recalculated.', async () => {
      await paymentAPI.delete(id);
      toast.success('Payment deleted', { autoClose: 1500 });
      fetchData(page);
    });
  };

  const openCreate = () => {
    setSelectedRecord(null);
    setCheckoutInfo(null);
    form.reset({
      parkingRecord: '',
      paymentDate: new Date().toISOString().split('T')[0],
      receivedBy: '',
      amount: '',
      paymentType: 'partial',
    });
    openModal('create');
  };

  const onRecordSelect = async (recordId) => {
    const record = openRecords.find((r) => r._id === recordId);
    setSelectedRecord(record);
    const pType = form.getValues('paymentType');

    if (record && pType === 'final') {
      setCalculating(true);
      try {
        const { data } = await parkingRecordAPI.checkout(recordId);
        if (data.success) {
          setCheckoutInfo(data.data);
          form.setValue('amount', data.data.balanceDue);
        }
      } catch {} finally { setCalculating(false); }
    } else {
      setCheckoutInfo(null);
      if (record) {
        form.setValue('amount', '');
      }
    }
  };

  const onPaymentTypeChange = (type) => {
    if (selectedRecord && type === 'final') {
      onRecordSelect(selectedRecord._id);
    } else {
      setCheckoutInfo(null);
      form.setValue('amount', '');
    }
  };

  const columns = [
    { key: 'record', label: 'Bus Plate', render: (r) => r.parkingRecord?.bus?.plateNumber || 'N/A' },
    { key: 'owner', label: 'Owner', render: (r) => r.parkingRecord?.bus?.owner?.name || 'N/A' },
    { key: 'space', label: 'Space', render: (r) => r.parkingRecord?.parkingSpace?.spaceNumber || 'N/A' },
    { key: 'paymentDate', label: 'Date', render: (r) => new Date(r.paymentDate).toLocaleDateString() },
    { key: 'amount', label: 'Amount', render: (r) => `RWF ${r.amount?.toLocaleString()}` },
    { key: 'paymentType', label: 'Type', render: (r) => (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
        r.paymentType === 'final' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'
      }`}>
        {r.paymentType === 'final' ? 'Final' : 'Partial'}
      </span>
    )},
    { key: 'receivedBy', label: 'Received By' },
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle="Record partial or final (checkout) payments"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200 transition-all">
            <CreditCard size={16} /> Record Payment
          </button>
        }
      />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-6 text-xs sm:text-sm text-blue-700 flex items-start gap-2 sm:gap-3">
        <Info size={16} className="mt-0.5 shrink-0 hidden sm:block" />
        <Info size={14} className="mt-0.5 shrink-0 sm:hidden" />
        <div>
          <strong>Two payment types:</strong>
          {' '}<strong className="text-orange-600">Partial</strong> — record a deposit while the bus is still parked.
          {' '}<strong className="text-green-600">Final (Checkout)</strong> — complete the payment, free the space,
          and the system calculates the total based on elapsed hours at 500 RWF/hr.
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-3 sm:p-5 shadow-lg shadow-blue-100/30">
        <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} loading={loading}
          actions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
            </div>
          )}
        />
      </div>

      <Modal open={modal.open && modal.type === 'create'} onClose={closeModal} title="Record Payment">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Parking Record <span className="text-yellow-600">(Pending or Partially Paid)</span>
            </label>
            <select
              {...form.register('parkingRecord')}
              onChange={(e) => { form.register('parkingRecord').onChange(e); onRecordSelect(e.target.value); }}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select a record...</option>
              {openRecords.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.bus?.plateNumber} - {r.bus?.owner?.name} ({r.paymentStatus})
                </option>
              ))}
            </select>
            {form.formState.errors.parkingRecord && <p className="text-xs text-red-500 mt-1">{form.formState.errors.parkingRecord.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Payment Type</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 cursor-pointer has-[:checked]:bg-orange-50 has-[:checked]:border-orange-200 has-[:checked]:text-orange-700">
                <input type="radio" value="partial" {...form.register('paymentType')} onChange={(e) => { form.register('paymentType').onChange(e); onPaymentTypeChange('partial'); }} className="accent-orange-500" />
                Partial
              </label>
              <label className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:border-green-200 has-[:checked]:text-green-700">
                <input type="radio" value="final" {...form.register('paymentType')} onChange={(e) => { form.register('paymentType').onChange(e); onPaymentTypeChange('final'); }} className="accent-green-500" />
                Final (Checkout)
              </label>
            </div>
          </div>

          {selectedRecord && (
            <div className="bg-blue-50 rounded-lg px-4 py-3 text-xs text-blue-700 space-y-1">
              <p><strong>Bus:</strong> {selectedRecord.bus?.plateNumber} ({selectedRecord.bus?.busType})</p>
              <p><strong>Owner:</strong> {selectedRecord.bus?.owner?.name} — {selectedRecord.bus?.owner?.phone}</p>
              <p><strong>Space:</strong> {selectedRecord.parkingSpace?.spaceNumber} | <strong>Paid so far:</strong> RWF {selectedRecord.amountPaid?.toLocaleString() || 0}</p>
            </div>
          )}

          {checkoutInfo && (
            <div className="bg-green-50 rounded-lg px-4 py-3 text-xs text-green-700 space-y-1">
              <p><strong>Entry:</strong> {new Date(checkoutInfo.entryTime).toLocaleString()}</p>
              <p><strong>Elapsed:</strong> {checkoutInfo.elapsedHours} hour{checkoutInfo.elapsedHours > 1 ? 's' : ''} @ RWF {checkoutInfo.hourlyRate}/hr</p>
              <p><strong>Total:</strong> RWF {checkoutInfo.totalAmount?.toLocaleString()} | <strong>Paid:</strong> RWF {checkoutInfo.amountPaid?.toLocaleString()} | <strong>Balance Due:</strong> RWF {checkoutInfo.balanceDue?.toLocaleString()}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Payment Date</label>
              <input type="date" {...form.register('paymentDate')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              {form.formState.errors.paymentDate && <p className="text-xs text-red-500 mt-1">{form.formState.errors.paymentDate.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Amount (RWF)</label>
              <input type="number" {...form.register('amount')} disabled={calculating} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50" />
              {form.formState.errors.amount && <p className="text-xs text-red-500 mt-1">{form.formState.errors.amount.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Received By</label>
            <input {...form.register('receivedBy')} placeholder="Name of person collecting payment" className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {form.formState.errors.receivedBy && <p className="text-xs text-red-500 mt-1">{form.formState.errors.receivedBy.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={calculating} className="flex-1 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200 disabled:opacity-50">
              {calculating ? 'Calculating...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal />
    </div>
  );
}
