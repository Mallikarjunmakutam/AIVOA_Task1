import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { History, Edit2, Trash2, RefreshCw } from 'lucide-react';

import {
  fetchInteractions,
  deleteInteraction,
  selectInteractions,
  selectInteractionsLoading,
  selectSearchQuery,
} from '../features/interactionsSlice';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed':
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>;
    case 'Pending Follow-up':
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending Follow-up</span>;
    case 'Planned':
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Planned</span>;
    case 'Cancelled':
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelled</span>;
    default:
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
  }
};

const InteractionHistory = ({ onEdit, onRefresh }) => {
  const dispatch = useDispatch();
  const data = useSelector(selectInteractions);
  const loading = useSelector(selectInteractionsLoading);
  const searchQuery = useSelector(selectSearchQuery);

  // Fetch on mount and whenever searchQuery changes
  useEffect(() => {
    dispatch(fetchInteractions(searchQuery));
  }, [dispatch, searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interaction?')) return;
    const resultAction = await dispatch(deleteInteraction(id));
    if (deleteInteraction.rejected.match(resultAction)) {
      alert('Failed to delete interaction.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <History className="w-5 h-5 mr-2 text-indigo-600" />
          Interaction History
          {searchQuery && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              — results for "<span className="text-indigo-600 font-medium">{searchQuery}</span>"
            </span>
          )}
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading interactions...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Doctor &amp; Hospital</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Follow-up Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{row.doctor_name}</span>
                      <span className="text-sm text-gray-500">{row.hospital_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{row.product_discussed}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{row.followup_date || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(row.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(row)}
                        title="Edit"
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && data.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            {searchQuery ? `No interactions found matching "${searchQuery}"` : 'No interactions logged yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionHistory;
