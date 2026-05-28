import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, CreditCard, LogOut, Info, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useUI } from '../hooks/useUI';
import { parkingRecordAPI, busAPI, parkingSpaceAPI, paymentAPI } from '../api/endpoints';

const createSchema = z.object({
  bus: z.string().min(1, 'Bus is required'),
  parkingSpace: z.string().min(1, 'Parking space is required'),
  entryTime: z.string().min(1, 'Entry time is required'),
  hourlyRate: z.coerce.number().positive('Must be positive'),
});

const partialSchema = z.object({
  amount: z.coerce.number().positive('Must be positive'),
  receivedBy: z.string().min(1, 'Receiver name is required'),
});

function elapsedDisplay(entryTime, exitTime) {
  const start = new Date(entryTime);
  const end = exitTime ? new Date(exitTime) : new Date();
  const diffMs = end - start;
  if (diffMs < 0) return '0m';
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${mins}m${exitTime ? '' : ' (active)'}`;
  return `${mins}m${exitTime ? '' : ' (active)'}`;
}

export default function ParkingRecords() {
  const [data, setData] = useState([]);
  const [buses, setBuses] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [checkoutPreview, setCheckoutPreview] = useState(null);
  const [partialRecord, setPartialRecord] = useState(null);
  const { modal, openModal, closeModal, openConfirm } = useUI();

  const createForm = useForm({ resolver: zodResolver(createSchema) });
  const partialForm = useForm({ resolver: zodResolver(partialSchema) });
  const editId = modal.data?._id;
  const isEdit = !!editId;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const [rRes, bRes, sRes] = await Promise.all([
        parkingRecordAPI.getAll({ page: p, limit: 10 }),
        busAPI.getAll({ page: 1, limit: 100 }),
        parkingSpaceAPI.getAll({ page: 1, limit: 100 }),
      ]);
      setData(rRes.data.data);
      setPagination(rRes.data.pagination);
      setBuses(bRes.data.data);
      setSpaces(sRes.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

  const handleCreate = async (formData) => {
    try {
      await parkingRecordAPI.create(formData);
      toast.success('Parking record created — timer started', { autoClose: 1500 });
      closeModal();
      fetchData(page);
    } catch {}
  };

  const handleUpdate = async (formData) => {
    try {
      await parkingRecordAPI.update(editId, formData);
      toast.success('Record updated', { autoClose: 1000 });
      closeModal();
      fetchData(page);
    } catch {}
  };

  const handleDelete = (id) => {
    openConfirm('Delete this parking record? The parking space will be freed.', async () => {
      try {
        await parkingRecordAPI.delete(id);
        toast.success('Record deleted — space freed', { autoClose: 1000 });
        fetchData(page);
      } catch {}
    });
  };

  const handlePartialPayment = async (formData) => {
    try {
      await paymentAPI.create({
        parkingRecord: partialRecord._id,
        paymentDate: new Date().toISOString(),
        receivedBy: formData.receivedBy,
        amount: formData.amount,
        paymentType: 'partial',
      });
      toast.success('Partial payment recorded', { autoClose: 1500 });
      setPartialRecord(null);
      fetchData(page);
    } catch {}
  };

  const handleCheckoutConfirm = async () => {
    try {
      await paymentAPI.create({
        parkingRecord: checkoutPreview._id,
        paymentDate: new Date().toISOString(),
        receivedBy: checkoutPreview.receivedBy || 'System',
        amount: checkoutPreview.balanceDue,
        paymentType: 'final',
      });
      toast.success('Checkout complete — space freed', { autoClose: 1500 });
      setCheckoutPreview(null);
      fetchData(page);
    } catch {}
  };

  const openEdit = (row) => {
    const formatDate = (d) => {
      if (!d) return '';
      const dt = new Date(d);
      return dt.toISOString().slice(0, 16);
    };
    createForm.reset({
      bus: row.bus?._id || '',
      parkingSpace: row.parkingSpace?._id || '',
      entryTime: formatDate(row.entryTime),
      hourlyRate: row.hourlyRate || 500,
    });
    openModal('edit', row);
  };

  const openCreate = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    createForm.reset({ bus: '', parkingSpace: '', entryTime: nowStr, hourlyRate: 500 });
    openModal('create');
  };

  const openPartial = (row) => {
    setPartialRecord(row);
    partialForm.reset({ amount: '', receivedBy: '' });
  };

  const openCheckout = async (row) => {
    try {
      const { data } = await parkingRecordAPI.checkout(row._id);
      if (data.success) {
        setCheckoutPreview({ ...data.data, receivedBy: '' });
      }
    } catch {}
  };

  const statusBadge = (s) => {
    const c = {
      Pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      'Partially Paid': 'bg-orange-50 text-orange-600 border-orange-200',
      Paid: 'bg-green-50 text-green-600 border-green-200',
      Cancelled: 'bg-red-50 text-red-600 border-red-200',
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${c[s] || ''}`}>{s}</span>;
  };

  const columns = [
    { key: 'bus', label: 'Bus Plate', render: (r) => r.bus?.plateNumber || 'N/A' },
    { key: 'owner', label: 'Owner', render: (r) => r.bus?.owner?.name || 'N/A' },
    { key: 'parkingSpace', label: 'Space', render: (r) => r.parkingSpace?.spaceNumber || 'N/A' },
    { key: 'entryTime', label: 'Entry', render: (r) => new Date(r.entryTime).toLocaleString() },
    { key: 'duration', label: 'Duration', render: (r) => elapsedDisplay(r.entryTime, r.exitTime) },
    { key: 'amount', label: 'Amount', render: (r) => {
      if (r.paymentStatus === 'Paid') return <span className="font-medium">RWF {r.totalAmount?.toLocaleString()}</span>;
      if (r.paymentStatus === 'Partially Paid') return <span className="text-orange-600">RWF {r.amountPaid?.toLocaleString()} paid</span>;
      return <span className="text-gray-400">—</span>;
    }},
    { key: 'balance', label: 'Balance', render: (r) => {
      if (r.paymentStatus === 'Paid') return <span className="text-green-600 font-medium">RWF {r.balanceDue?.toLocaleString()}</span>;
      if (r.paymentStatus === 'Partially Paid') return <span className="text-orange-600">RWF {(r.totalAmount - r.amountPaid) > 0 ? (r.totalAmount - r.amountPaid).toLocaleString() : '—'}</span>;
      return <span className="text-gray-400">—</span>;
    }},
    { key: 'paymentStatus', label: 'Status', render: (r) => statusBadge(r.paymentStatus) },
  ];

  return (
    <div>
      <PageHeader title="Parking Records" subtitle="Track bus parking sessions with hourly billing"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200 transition-all">
            <Plus size={16} /> New Record
          </button>
        }
      />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-6 text-xs sm:text-sm text-blue-700 flex items-start gap-2 sm:gap-3">
        <Info size={16} className="mt-0.5 shrink-0 sm:block hidden" />
        <Info size={14} className="mt-0.5 shrink-0 sm:hidden" />
        <div>
          <strong>Hourly billing:</strong> When a bus enters, create a record and the timer starts (500 RWF/hr).
          Customers can make <strong>partial payments</strong> anytime. When they leave, click <strong>Checkout</strong> —
          the system calculates the total based on elapsed hours and shows the remaining balance.
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-3 sm:p-5 shadow-lg shadow-blue-100/30">
        <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} loading={loading}
          actions={(row) => (
            <div className="flex items-center justify-end gap-2">
              {row.paymentStatus !== 'Paid' && row.paymentStatus !== 'Cancelled' && (
                <>
                  <button
                    onClick={() => openPartial(row)}
                    className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition-colors"
                    title="Record partial payment"
                  >
                    <DollarSign size={15} />
                  </button>
                  <button
                    onClick={() => openCheckout(row)}
                    className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                    title="Checkout (final payment)"
                  >
                    <LogOut size={15} />
                  </button>
                </>
              )}
              <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 size={15} /></button>
              <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
            </div>
          )}
        />
      </div>

      <Modal open={modal.open && ['create', 'edit'].includes(modal.type)} onClose={closeModal} title={isEdit ? 'Edit Parking Record' : 'New Parking Record'} size="max-w-xl">
        <form onSubmit={createForm.handleSubmit(isEdit ? handleUpdate : handleCreate)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Bus</label>
              <select {...createForm.register('bus')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">Select bus...</option>
                {buses.map((b) => <option key={b._id} value={b._id}>{b.plateNumber} - {b.busType}</option>)}
              </select>
              {createForm.formState.errors.bus && <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.bus.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Parking Space</label>
              <select {...createForm.register('parkingSpace')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">Select space...</option>
                {spaces.map((s) => <option key={s._id} value={s._id}>{s.spaceNumber} - {s.location} ({s.status})</option>)}
              </select>
              {createForm.formState.errors.parkingSpace && <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.parkingSpace.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Entry Time</label>
              <input type="datetime-local" {...createForm.register('entryTime')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              {createForm.formState.errors.entryTime && <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.entryTime.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Hourly Rate (RWF)</label>
              <input type="number" {...createForm.register('hourlyRate')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              {createForm.formState.errors.hourlyRate && <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.hourlyRate.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!partialRecord} onClose={() => setPartialRecord(null)} title="Record Partial Payment" size="max-w-md">
        <form onSubmit={partialForm.handleSubmit(handlePartialPayment)} className="space-y-4">
          {partialRecord && (
            <div className="bg-orange-50 rounded-lg px-4 py-3 text-xs text-orange-700 space-y-1">
              <p><strong>Bus:</strong> {partialRecord.bus?.plateNumber} — {partialRecord.bus?.owner?.name}</p>
              <p><strong>Space:</strong> {partialRecord.parkingSpace?.spaceNumber} | <strong>Entry:</strong> {new Date(partialRecord.entryTime).toLocaleString()}</p>
              <p><strong>Paid so far:</strong> RWF {partialRecord.amountPaid?.toLocaleString() || 0}</p>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Amount (RWF)</label>
            <input type="number" {...partialForm.register('amount')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {partialForm.formState.errors.amount && <p className="text-xs text-red-500 mt-1">{partialForm.formState.errors.amount.message}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Received By</label>
            <input {...partialForm.register('receivedBy')} placeholder="Name of person collecting payment" className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {partialForm.formState.errors.receivedBy && <p className="text-xs text-red-500 mt-1">{partialForm.formState.errors.receivedBy.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setPartialRecord(null)} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md shadow-orange-200">Record Partial Payment</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!checkoutPreview} onClose={() => setCheckoutPreview(null)} title="Checkout — Final Payment" size="max-w-md">
        {checkoutPreview && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg px-4 py-3 text-xs text-green-700 space-y-1.5">
              <p><strong>Bus:</strong> {checkoutPreview.bus?.plateNumber || '—'} — {checkoutPreview.bus?.owner?.name || '—'}</p>
              <p><strong>Space:</strong> {checkoutPreview.parkingSpace?.spaceNumber || '—'}</p>
              <p><strong>Entry:</strong> {new Date(checkoutPreview.entryTime).toLocaleString()} → <strong>Exit:</strong> {new Date(checkoutPreview.exitTime).toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 rounded-lg px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Elapsed Time:</span><span className="font-semibold">{checkoutPreview.elapsedHours} hour{checkoutPreview.elapsedHours > 1 ? 's' : ''}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Rate:</span><span className="font-semibold">RWF {checkoutPreview.hourlyRate?.toLocaleString()}/hr</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Due:</span><span className="font-semibold">RWF {checkoutPreview.totalAmount?.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Already Paid:</span><span className="font-semibold text-green-600">- RWF {checkoutPreview.amountPaid?.toLocaleString()}</span></div>
              <hr className="border-blue-200" />
              <div className="flex justify-between text-base"><span className="font-bold text-gray-700">Balance Due:</span><span className="font-bold text-green-700">RWF {checkoutPreview.balanceDue?.toLocaleString()}</span></div>
            </div>
            <p className="text-xs text-gray-400">Confirming will record the final payment and free the parking space.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setCheckoutPreview(null)} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCheckoutConfirm} className="flex-1 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md shadow-green-200">Confirm Checkout — RWF {checkoutPreview.balanceDue?.toLocaleString()}</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal />
    </div>
  );
}
