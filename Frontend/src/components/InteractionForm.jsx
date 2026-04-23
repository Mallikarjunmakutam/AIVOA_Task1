import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, User, Building2, Package, FileText, CheckCircle, Loader2, Brain, ChevronRight } from 'lucide-react';

import {
  createInteraction,
  updateInteraction,
  selectInteractionsLoading,
} from '../features/interactionsSlice';
import {
  selectSelectedInteraction,
} from '../features/uiSlice';

const API = 'http://127.0.0.1:8000';

const emptyForm = {
  doctorName: '',
  hospitalName: '',
  productDiscussed: '',
  notes: '',
  followUpDate: '',
  status: 'Planned',
};

const InteractionForm = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const selectedInteraction = useSelector(selectSelectedInteraction);
  const submitting = useSelector(selectInteractionsLoading);

  const [formData, setFormData] = useState(emptyForm);
  const [sentiment, setSentiment] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (selectedInteraction) {
      setFormData({
        doctorName: selectedInteraction.doctor_name || '',
        hospitalName: selectedInteraction.hospital_name || '',
        productDiscussed: selectedInteraction.product_discussed || '',
        notes: selectedInteraction.meeting_notes || '',
        followUpDate: selectedInteraction.followup_date || '',
        status: selectedInteraction.status || 'Planned',
      });
      setSentiment(null);
      setSuggestion(null);
    } else {
      setFormData(emptyForm);
    }
  }, [selectedInteraction]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      doctor_name: formData.doctorName,
      hospital_name: formData.hospitalName,
      product_discussed: formData.productDiscussed,
      meeting_notes: formData.notes,
      followup_date: formData.followUpDate,
      status: formData.status,
    };

    const isEdit = !!selectedInteraction;

    const resultAction = isEdit
      ? await dispatch(updateInteraction({ id: selectedInteraction.id, payload }))
      : await dispatch(createInteraction(payload));

    if (
      (isEdit ? updateInteraction.fulfilled : createInteraction.fulfilled).match(resultAction)
    ) {
      onSuccess();
    } else {
      alert(`Failed: ${resultAction.payload || 'Unknown error'}`);
    }
  };

  const handleSentimentAnalysis = async () => {
    if (!formData.notes.trim()) {
      alert('Please enter meeting notes first.');
      return;
    }
    setAnalysing(true);
    try {
      const response = await fetch(`${API}/api/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: formData.notes }),
      });
      const data = await response.json();
      setSentiment(data.sentiment);
    } catch {
      setSentiment('Error fetching sentiment');
    } finally {
      setAnalysing(false);
    }
  };

  const handleFollowupSuggestion = async () => {
    if (!formData.doctorName.trim() || !formData.productDiscussed.trim()) {
      alert('Please enter Doctor Name and Product Discussed first.');
      return;
    }
    setSuggesting(true);
    try {
      const response = await fetch(`${API}/api/followup-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_name: formData.doctorName,
          product_discussed: formData.productDiscussed,
        }),
      });
      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch {
      setSuggestion('Error fetching suggestion');
    } finally {
      setSuggesting(false);
    }
  };

  const getSentimentColor = (s) => {
    if (!s) return '';
    if (s.toLowerCase() === 'positive') return 'text-green-700 bg-green-50 border-green-200';
    if (s.toLowerCase() === 'negative') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  };

  const isEditing = !!selectedInteraction;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <User className="w-5 h-5 mr-2 text-indigo-600" />
          {isEditing ? 'Edit Interaction' : 'Interaction Details'}
        </h2>
        {isEditing && (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
            Editing #{selectedInteraction.id}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Doctor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input type="text" name="doctorName" value={formData.doctorName} onChange={handleChange}
                placeholder="Dr. John Doe"
                className="pl-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required />
            </div>
          </div>

          {/* Hospital Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange}
                placeholder="Central Hospital"
                className="pl-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required />
            </div>
          </div>

          {/* Product Discussed */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Discussed</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-4 w-4 text-gray-400" />
              </div>
              <input type="text" name="productDiscussed" value={formData.productDiscussed} onChange={handleChange}
                placeholder="CardioTech Pacemaker v2"
                className="pl-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required />
            </div>
          </div>

          {/* Meeting Notes */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Meeting Notes</label>
              <button type="button" onClick={handleSentimentAnalysis} disabled={analysing}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors">
                {analysing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                Analyse Sentiment
              </button>
            </div>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4"
                placeholder="Key takeaways from the discussion..."
                className="pl-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
                required></textarea>
            </div>
            {sentiment && (
              <div className={`mt-2 px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1 ${getSentimentColor(sentiment)}`}>
                <Brain className="w-3 h-3" /> Sentiment: <strong className="capitalize">{sentiment}</strong>
              </div>
            )}
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange}
                className="pl-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required />
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle className="h-4 w-4 text-gray-400" />
              </div>
              <select name="status" value={formData.status} onChange={handleChange}
                className="pl-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow appearance-none">
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
                <option value="Pending Follow-up">Pending Follow-up</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up Suggestion */}
        <div>
          <button type="button" onClick={handleFollowupSuggestion} disabled={suggesting}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors">
            {suggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            Get AI Follow-up Suggestion
          </button>
          {suggestion && (
            <div className="mt-2 px-3 py-2 text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg">
              {suggestion}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          {isEditing && (
            <button type="button" onClick={onCancel}
              className="border border-gray-300 text-gray-700 font-medium py-2 px-5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
              Cancel
            </button>
          )}
          <button type="submit" disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Update Interaction' : 'Log Interaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InteractionForm;
