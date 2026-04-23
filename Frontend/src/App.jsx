import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InteractionForm from './components/InteractionForm';
import AIChatAssistant from './components/AIChatAssistant';
import InteractionHistory from './components/InteractionHistory';
import { Stethoscope, Bell, Search, Menu } from 'lucide-react';

import {
  setSelectedInteraction,
  clearSelectedInteraction,
  selectSelectedInteraction,
} from './features/uiSlice';
import {
  fetchInteractions,
  setSearchQuery,
  selectSearchQuery,
} from './features/interactionsSlice';

function App() {
  const dispatch = useDispatch();
  const selectedInteraction = useSelector(selectSelectedInteraction);
  const searchQuery = useSelector(selectSearchQuery);

  const handleEditSelect = useCallback(
    (interaction) => {
      dispatch(setSelectedInteraction(interaction));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [dispatch]
  );

  const handleFormSuccess = useCallback(() => {
    dispatch(clearSelectedInteraction());
    dispatch(fetchInteractions(searchQuery));
  }, [dispatch, searchQuery]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchInteractions(searchQuery));
  }, [dispatch, searchQuery]);

  const handleSearchChange = useCallback(
    (e) => {
      const query = e.target.value;
      dispatch(setSearchQuery(query));
      dispatch(fetchInteractions(query));
    },
    [dispatch]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button className="p-2 mr-2 text-gray-400 hover:text-gray-500 lg:hidden focus:outline-none">
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center flex-shrink-0">
                <div className="bg-indigo-600 p-2 rounded-lg mr-3 shadow-sm">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">Healthcare CRM Dashboard</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 flex-1 justify-end">
              <div className="hidden md:flex max-w-md w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search doctors, hospitals..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-500 relative focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full">
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                <Bell className="h-6 w-6" />
              </button>
              <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center cursor-pointer ml-2 flex-shrink-0">
                <span className="text-sm font-medium text-indigo-700">JD</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Log Interaction Screen</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500">Record your meetings with healthcare professionals seamlessly.</p>
        </div>

        {/* Top Split Section */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column: Form */}
          <div className="w-full lg:w-3/5 xl:w-2/3">
            <InteractionForm
              onSuccess={handleFormSuccess}
              onCancel={() => dispatch(clearSelectedInteraction())}
            />
          </div>

          {/* Right Column: AI Chat */}
          <div className="w-full lg:w-2/5 xl:w-1/3">
            <div className="sticky top-24 h-[600px] lg:h-[calc(100vh-140px)] min-h-[500px]">
              <AIChatAssistant />
            </div>
          </div>

        </div>

        {/* Bottom Section: History List */}
        <div className="mt-8">
          <InteractionHistory
            onEdit={handleEditSelect}
            onRefresh={handleRefresh}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            &copy; 2026 MediCRM Pro by Healthcare Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
