import React, { useState, useEffect } from 'react';
import { Download, Loader2, Edit3, X } from 'lucide-react';
import { getAttendanceHistory, exportAttendanceExcel, updateAttendanceDescription } from '../services/api';
import toast from 'react-hot-toast';

const getTypeStyles = (type) => {
  switch (type?.toLowerCase()) {
    case 'office':
      return 'bg-green-100 text-green-700';
    case 'wfh':
      return 'bg-orange-100 text-orange-700';
    case 'leave':
      return 'bg-pink-100 text-pink-700';
    case 'absent':
      return 'bg-red-100 text-red-700';
    case 'holiday':
    case 'weekoff':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function History() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState({
    daysWorked: 0,
    avgPerDay: '0h 0m',
    absent: 0
  });

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [savingDescription, setSavingDescription] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [month, year]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getAttendanceHistory(month, year);
      setHistoryData(data.recentDays || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportAttendanceExcel(month, year);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${month}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful");
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditDescription(item.description || "");
    setIsModalOpen(true);
  };

  const handleSaveDescription = async () => {
    if (!editingItem?.id) return;
    try {
      setSavingDescription(true);
      await updateAttendanceDescription(editingItem.id, editDescription);
      
      // Update local state to reflect change without re-fetching everything
      setHistoryData(prev => 
        prev.map(item => 
          item.id === editingItem.id ? { ...item, description: editDescription } : item
        )
      );

      toast.success("Description updated");
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to update description");
    } finally {
      setSavingDescription(false);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="animate-in fade-in duration-300 relative">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">{monthNames[month - 1]} {year}</h2>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export Excel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="flex justify-between text-center mb-8 px-2">
            <div>
              <h2 className="text-3xl font-normal text-gray-800">{summary.daysWorked}</h2>
              <p className="text-xs text-gray-400 mt-1">Days worked</p>
            </div>
            <div>
              <h2 className="text-3xl font-normal text-gray-800">{summary.avgPerDay}</h2>
              <p className="text-xs text-gray-400 mt-1">Avg/day</p>
            </div>
            <div>
              <h2 className="text-3xl font-normal text-gray-800">{summary.absent}</h2>
              <p className="text-xs text-gray-400 mt-1">Absent</p>
            </div>
          </div>

          {/* Recent Days List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                  <tr>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {historyData.length > 0 ? historyData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{item.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">{item.checkIn}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">{item.checkOut}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800 whitespace-nowrap">{item.duration}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize inline-block ${getTypeStyles(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        <div 
                          className={`flex items-center justify-between gap-2 group min-w-[150px] ${item.id ? 'cursor-pointer hover:bg-gray-100 p-1.5 -ml-1.5 rounded-md transition-colors' : ''}`}
                          onClick={() => {
                            if (item.id) openEditModal(item);
                          }}
                          title={item.id ? "Click to edit description" : ""}
                        >
                          <span className="truncate max-w-[150px] inline-block select-none">
                            {item.description || <span className="text-gray-300 italic">No description</span>}
                          </span>
                          {item.id && (
                            <span 
                              className="p-1 text-gray-400 group-hover:text-blue-600 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Edit3 size={14} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-sm text-gray-500">No records found for this month.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3 overflow-x-auto no-scrollbar">
            {['Office', 'WFH', 'Leave', 'Absent', 'Holiday', 'Weekoff'].map(type => (
              <div key={type} className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${getTypeStyles(type)}`}>
                {type}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Description Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">Edit Description</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-sm text-gray-500 mb-2">
                Description for {editingItem?.date}
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 h-28 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                placeholder="Enter a brief description of your day..."
                autoFocus
              ></textarea>
              <div className="flex justify-end gap-3 mt-5">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveDescription}
                  disabled={savingDescription}
                  className="px-4 py-2 text-sm font-medium bg-[#1b5b9c] hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  {savingDescription && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
