import { useState, useEffect, useMemo } from 'react';
import { Download, FileText, Calendar, DollarSign, TrendingUp, Activity, Search, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { reportAPI } from '../api/endpoints';

function preciseDuration(entryTime, exitTime) {
  const start = new Date(entryTime);
  const end = exitTime ? new Date(exitTime) : new Date();
  const diffMs = end - start;
  if (diffMs < 0) return '0m';
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function calcBreakdown(entryTime, exitTime, totalAmount, hourlyRate, amountPaid) {
  if (totalAmount > 0 && hourlyRate > 0) {
    const hours = totalAmount / hourlyRate;
    return `${hours}h × RWF ${hourlyRate}/hr = RWF ${totalAmount.toLocaleString()}`;
  }
  if (amountPaid > 0) {
    return `RWF ${amountPaid.toLocaleString()} collected`;
  }
  return '—';
}

export default function Reports() {
  const [incomeData, setIncomeData] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async (sd, ed) => {
    setLoading(true);
    try {
      const params = {};
      if (sd) params.startDate = sd;
      if (ed) params.endDate = ed;
      const [incRes, allRes] = await Promise.all([
        reportAPI.getDailyIncome(params),
        reportAPI.getAll(),
      ]);
      if (incRes.data.success) setIncomeData(incRes.data.data);
      if (allRes.data.success) setAllRecords(allRes.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, []);

  const handleFilter = () => {
    fetchData(startDate, endDate);
  };

  const totals = useMemo(() => {
    const totalRevenue = incomeData.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    const totalTransactions = incomeData.reduce((sum, r) => sum + (r.count || 0), 0);
    const avgPerTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const paidRecords = allRecords.filter((r) => r.paymentStatus === 'Paid').length;
    const pendingRecords = allRecords.filter((r) => r.paymentStatus === 'Pending' || r.paymentStatus === 'Partially Paid').length;

    const totalHours = allRecords.reduce((sum, r) => {
      if (!r.exitTime) return sum;
      const ms = new Date(r.exitTime) - new Date(r.entryTime);
      return sum + (ms > 0 ? ms / (1000 * 60 * 60) : 0);
    }, 0);

    return { totalRevenue, totalTransactions, avgPerTransaction, paidRecords, pendingRecords, totalRecords: allRecords.length, totalHours };
  }, [incomeData, allRecords]);

  const filteredRecords = allRecords.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.bus?.plateNumber?.toLowerCase().includes(term) ||
      r.bus?.owner?.name?.toLowerCase().includes(term) ||
      r.parkingSpace?.spaceNumber?.toLowerCase().includes(term) ||
      r.bus?.owner?.phone?.toLowerCase().includes(term)
    );
  });

  const exportCSV = () => {
    let csv = 'Date,Total Amount (RWF),Transactions,Average per Transaction\n';
    incomeData.forEach((r) => {
      const avg = r.count > 0 ? (r.totalAmount / r.count).toFixed(0) : 0;
      csv += `${r._id},${r.totalAmount},${r.count},${avg}\n`;
    });
    csv += `\nSummary\n`;
    csv += `Total Revenue,${totals.totalRevenue}\n`;
    csv += `Total Transactions,${totals.totalTransactions}\n`;
    csv += `Average per Transaction,${totals.avgPerTransaction.toFixed(0)}\n`;
    csv += `Paid Records,${totals.paidRecords}\n`;
    csv += `Pending Records,${totals.pendingRecords}\n`;
    csv += `Total Hours Billed,${totals.totalHours.toFixed(1)}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_income_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported', { autoClose: 1000 });
  };

  const exportPDF = () => {
    const rows = incomeData.map((r) => {
      const avg = r.count > 0 ? (r.totalAmount / r.count).toFixed(0) : 0;
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151">${r._id}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;text-align:right">RWF ${r.totalAmount?.toLocaleString()}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;text-align:center">${r.count}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;text-align:right">RWF ${Number(avg).toLocaleString()}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Daily Income Report - TransitPro</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1f2937; }
    h1 { color: #2563eb; font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
    .summary { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
    .summary-item { background: #f0f5ff; padding: 16px 24px; border-radius: 12px; border: 1px solid #dbeafe; flex: 1; min-width: 150px; }
    .summary-item .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-item .value { font-size: 22px; font-weight: 700; color: #1f2937; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #2563eb; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
    th:not(:first-child) { text-align: right; }
    th:nth-child(3) { text-align: center; }
    tr:nth-child(even) { background: #f9fafb; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <h1>Daily Income Report</h1>
  <p class="subtitle">TransitPro Bus Parking Management System</p>
  <div class="summary">
    <div class="summary-item"><div class="label">Total Revenue</div><div class="value">RWF ${totals.totalRevenue.toLocaleString()}</div></div>
    <div class="summary-item"><div class="label">Transactions</div><div class="value">${totals.totalTransactions}</div></div>
    <div class="summary-item"><div class="label">Avg per Transaction</div><div class="value">RWF ${totals.avgPerTransaction.toFixed(0).toLocaleString()}</div></div>
    <div class="summary-item"><div class="label">Total Hours Billed</div><div class="value">${totals.totalHours.toFixed(1)}</div></div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Revenue</th><th style="text-align:center">Transactions</th><th>Avg Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    <p>Ishimwe Brave | ishimwebrave8@gmail.com | 0738091744 | Powered by Brave</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_income_report.html';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded (open in browser to print as PDF)', { autoClose: 2000 });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-400">Daily income overview and transaction activity</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
          >
            <Download size={16} /> CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
          >
            <FileText size={16} /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 shadow-lg shadow-blue-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-100 text-xs font-medium uppercase tracking-wider">Total Revenue</span>
            <DollarSign size={20} className="text-blue-200" />
          </div>
          <p className="text-2xl font-bold text-white">RWF {totals.totalRevenue.toLocaleString()}</p>
          <p className="text-blue-200 text-xs mt-1">Across {totals.totalTransactions} transactions</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-5 shadow-lg shadow-blue-100/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Transactions</span>
            <Activity size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totals.totalTransactions}</p>
          <p className="text-gray-400 text-xs mt-1">{totals.paidRecords} paid · {totals.pendingRecords} pending</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-5 shadow-lg shadow-blue-100/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Avg per Day</span>
            <TrendingUp size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-800">RWF {totals.avgPerTransaction.toFixed(0).toLocaleString()}</p>
          <p className="text-gray-400 text-xs mt-1">{incomeData.length} active days</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-5 shadow-lg shadow-blue-100/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Hours</span>
            <Clock size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totals.totalHours.toFixed(1)}</p>
          <p className="text-gray-400 text-xs mt-1">Billed across all records</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 shadow-lg shadow-blue-100/30 overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-blue-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Daily Transactions</h2>
              <p className="text-xs text-gray-400 mt-0.5">Detailed breakdown of daily parking income</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              <span className="text-gray-400 text-sm">to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              <button onClick={handleFilter}
                className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600">Filter</button>
            </div>
          </div>
        </div>

        {incomeData.length > 0 ? (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50/50">
                    <th className="text-left px-5 py-3.5 font-semibold text-blue-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> Date
                      </div>
                    </th>
                    <th className="text-right px-5 py-3.5 font-semibold text-blue-700">Revenue</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-blue-700">Transactions</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-blue-700">Avg Amount</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-blue-700">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.map((r) => {
                    const avg = r.count > 0 ? (r.totalAmount / r.count).toFixed(0) : 0;
                    const pct = totals.totalRevenue > 0 ? ((r.totalAmount / totals.totalRevenue) * 100).toFixed(1) : 0;
                    return (
                      <tr key={r._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-800">{r._id}</td>
                        <td className="px-5 py-4 text-right font-semibold text-gray-800">RWF {r.totalAmount?.toLocaleString()}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                            {r.count}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-gray-600">RWF {Number(avg).toLocaleString()}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50/30 font-semibold">
                    <td className="px-5 py-4 text-gray-800">Total</td>
                    <td className="px-5 py-4 text-right text-gray-800">RWF {totals.totalRevenue.toLocaleString()}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-semibold">
                        {totals.totalTransactions}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-800">RWF {totals.avgPerTransaction.toFixed(0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-right text-blue-600">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-blue-50">
              {incomeData.map((r) => {
                const avg = r.count > 0 ? (r.totalAmount / r.count).toFixed(0) : 0;
                const pct = totals.totalRevenue > 0 ? ((r.totalAmount / totals.totalRevenue) * 100).toFixed(1) : 0;
                return (
                  <div key={r._id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        <span className="font-semibold text-gray-800">{r._id}</span>
                      </div>
                      <span className="text-xs text-gray-400">{pct}% of total</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[10px] text-gray-400">Revenue</p>
                        <p className="text-sm font-semibold text-gray-800">RWF {r.totalAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Transactions</p>
                        <p className="text-sm font-semibold text-blue-600">{r.count}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Avg</p>
                        <p className="text-sm text-gray-600">RWF {Number(avg).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="px-4 py-3 bg-blue-50/50">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-gray-400">Total Revenue</p>
                    <p className="text-sm font-bold text-gray-800">RWF {totals.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Transactions</p>
                    <p className="text-sm font-bold text-blue-600">{totals.totalTransactions}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Avg</p>
                    <p className="text-sm font-bold text-gray-800">RWF {totals.avgPerTransaction.toFixed(0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText size={48} className="mb-4 text-gray-200" />
            <p className="text-sm font-medium">No transaction data yet</p>
            <p className="text-xs mt-1">Payments will appear here once recorded</p>
          </div>
        )}
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-3 sm:p-5 shadow-lg shadow-blue-100/30">
        <h2 className="text-base font-semibold text-gray-800 mb-4">All Parking Records</h2>
        <div className="mb-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by plate, owner, space..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-blue-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-100">
                <th className="text-left px-4 py-3 font-semibold text-blue-600">Bus Plate</th>
                <th className="text-left px-4 py-3 font-semibold text-blue-600">Owner</th>
                <th className="text-left px-4 py-3 font-semibold text-blue-600">Space</th>
                <th className="text-left px-4 py-3 font-semibold text-blue-600">Entry</th>
                <th className="text-left px-4 py-3 font-semibold text-blue-600">Exit</th>
                <th className="text-center px-4 py-3 font-semibold text-blue-600">Duration</th>
                <th className="text-center px-4 py-3 font-semibold text-blue-600">Rate</th>
                <th className="text-right px-4 py-3 font-semibold text-blue-600">Amount</th>
                <th className="text-center px-4 py-3 font-semibold text-blue-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No records found</td></tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.bus?.plateNumber || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.bus?.owner?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.parkingSpace?.spaceNumber || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(r.entryTime).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.exitTime ? new Date(r.exitTime).toLocaleString() : <span className="text-blue-400">Active</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {r.exitTime ? preciseDuration(r.entryTime, r.exitTime) : 'Active'}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-700">RWF {r.hourlyRate?.toLocaleString()}/hr</td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-xs text-gray-400">{calcBreakdown(r.entryTime, r.exitTime, r.totalAmount, r.hourlyRate, r.amountPaid)}</div>
                      {r.paymentStatus === 'Partially Paid' && (
                        <div className="text-xs text-orange-500">RWF {r.amountPaid?.toLocaleString()} paid · RWF {r.balanceDue?.toLocaleString()} due</div>
                      )}
                      {r.paymentStatus === 'Paid' && (
                        <div className="text-xs text-green-600">Collected: RWF {r.amountPaid?.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                        r.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600 border-green-200' :
                        r.paymentStatus === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        r.paymentStatus === 'Partially Paid' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        'bg-red-50 text-red-600 border-red-200'
                      }`}>{r.paymentStatus}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden space-y-2">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No records found</div>
          ) : (
            filteredRecords.map((r) => (
              <div key={r._id} className="bg-blue-50/30 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800 text-sm">{r.bus?.plateNumber || 'N/A'}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                    r.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600 border-green-200' :
                    r.paymentStatus === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                    r.paymentStatus === 'Partially Paid' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                    'bg-red-50 text-red-600 border-red-200'
                  }`}>{r.paymentStatus}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                  <span>Owner: <strong>{r.bus?.owner?.name || 'N/A'}</strong></span>
                  <span>Space: <strong>{r.parkingSpace?.spaceNumber || 'N/A'}</strong></span>
                  <span>Entry: <strong>{new Date(r.entryTime).toLocaleString()}</strong></span>
                  <span>Exit: <strong>{r.exitTime ? new Date(r.exitTime).toLocaleString() : 'Active'}</strong></span>
                  <span>Duration: <strong>{r.exitTime ? preciseDuration(r.entryTime, r.exitTime) : 'Active'}</strong></span>
                  <span>Rate: <strong>RWF {r.hourlyRate?.toLocaleString()}/hr</strong></span>
                </div>
                <div className="text-right mt-1">
                  <span className="text-sm font-semibold text-gray-800">{calcBreakdown(r.entryTime, r.exitTime, r.totalAmount, r.hourlyRate, r.amountPaid)}</span>
                  {r.paymentStatus === 'Partially Paid' && (
                    <div className="text-[10px] text-orange-500">RWF {r.amountPaid?.toLocaleString()} paid · RWF {r.balanceDue?.toLocaleString()} due</div>
                  )}
                  {r.paymentStatus === 'Paid' && (
                    <div className="text-[10px] text-green-600">Collected: RWF {r.amountPaid?.toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
