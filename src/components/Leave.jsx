import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createLeave, getLeaveBalance, getMyLeaves } from '../services/api';
import toast from 'react-hot-toast';

export default function Leave() {
  const [selectedType, setSelectedType] = useState('Sick leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const [leaveBalances, setLeaveBalances] = useState([]);
  
  const [myLeaves, setMyLeaves] = useState([]);
  const [fetchingLeaves, setFetchingLeaves] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetchingBalance(true);
    setFetchingLeaves(true);
    try {
      const [balanceData, leavesData] = await Promise.all([
        getLeaveBalance(),
        getMyLeaves()
      ]);
      
      const typeColors = {
        sick_leave: "bg-blue-600",
        casual_leave: "bg-blue-600",
        annual_leave: "bg-slate-800",
        unpaid: "bg-slate-800"
      };

      const typeNames = {
        sick_leave: "Sick leave",
        casual_leave: "Casual leave",
        annual_leave: "Annual leave",
        unpaid: "Unpaid leave"
      };

      const mappedData = balanceData.map(item => ({
        type: typeNames[item.type] || item.type,
        used: item.used,
        total: item.total,
        color: typeColors[item.type] || "bg-gray-500"
      }));

      setLeaveBalances(mappedData);
      setMyLeaves(leavesData || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch data');
    } finally {
      setFetchingBalance(false);
      setFetchingLeaves(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      return toast.error("Please select from and to dates");
    }

    if (new Date(fromDate) > new Date(toDate)) {
      return toast.error("From date cannot be after To date");
    }

    try {
      setLoading(true);
      await createLeave({
        type: selectedType,
        fromDate,
        toDate,
        reason
      });
      toast.success("Leave request submitted successfully");
      setFromDate('');
      setToDate('');
      setReason('');
      fetchData(); // refresh balance and leaves history
    } catch (err) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Request leave</h2>
      
      {/* Request Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <label className="block text-sm text-gray-500 mb-3">Leave type</label>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['Sick leave', 'Casual leave', 'Annual leave', 'Unpaid leave'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`py-2.5 text-sm rounded-lg border transition-colors ${
                selectedType === type 
                  ? 'border-blue-500 text-blue-700 bg-blue-50 font-medium' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">From date</label>
            <div className="relative">
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">To date</label>
            <div className="relative">
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">Reason (optional)</label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Brief reason..." 
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          ></textarea>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-[#1b5b9c] hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      {/* Leave Balance */}
      <h2 className="text-lg font-medium text-gray-800 mb-4">Leave balance</h2>
      {fetchingBalance ? (
        <div className="flex justify-center items-center py-6 text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 px-1">
            {leaveBalances.map((item, index) => (
              <div key={index}>
                <div className="text-xs text-gray-500 mb-1">{item.type}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-normal text-gray-800">{item.used}</span>
                  <span className="text-xs text-gray-400">/ {item.total} days</span>
                </div>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full`} 
                    style={{ width: `${item.total > 0 ? (item.used / item.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Leave Requests */}
      <h2 className="text-lg font-medium text-gray-800 mb-4">Leave History</h2>
      {fetchingLeaves ? (
        <div className="flex justify-center items-center py-6 text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : myLeaves.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 text-sm">
          You haven't requested any leaves yet.
        </div>
      ) : (
        <div className="space-y-4">
          {myLeaves.map((leave) => (
            <div key={leave._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-gray-200 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-800">{leave.type}</h3>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {new Date(leave.fromDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} 
                    {' - '} 
                    {new Date(leave.toDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className={`text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${getStatusColor(leave.status)}`}>
                  {leave.status}
                </div>
              </div>
              {leave.reason && (
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-3 border border-gray-100">
                  <span className="font-medium text-gray-700 text-xs uppercase tracking-wider block mb-1">Reason</span>
                  {leave.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
