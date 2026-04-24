import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InteractionForm from './components/InteractionForm';
import AIChatAssistant from './components/AIChatAssistant';
import InteractionHistory from './components/InteractionHistory';
import { Stethoscope, Bell, Search, Menu, Loader2 } from 'lucide-react';


import {
  setSelectedInteraction,
  clearSelectedInteraction,
  selectSelectedInteraction,
} from './features/uiSlice';
import {
  fetchInteractions,
  searchInteractions,
  setSearchQuery,
  clearSearchResults,
  selectSearchQuery,
  selectSearchResults,
  selectSearchLoading,
} from './features/interactionsSlice';


function App() {
  const dispatch = useDispatch();
  const selectedInteraction = useSelector(selectSelectedInteraction);
  const searchQuery = useSelector(selectSearchQuery);
  const searchResults = useSelector(selectSearchResults);
  const searchLoading = useSelector(selectSearchLoading);
  const [showResults, setShowResults] = React.useState(false);
  const searchRef = React.useRef(null);


  const handleEditSelect = useCallback(
    (interaction) => {
      dispatch(setSelectedInteraction(interaction));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [dispatch]
  );

  const handleFormSuccess = useCallback(() => {
    dispatch(clearSelectedInteraction());
    dispatch(fetchInteractions());
    if (searchQuery.trim()) {
      dispatch(searchInteractions(searchQuery));
    }
  }, [dispatch, searchQuery]);


  const handleRefresh = useCallback(() => {
    dispatch(fetchInteractions());
    if (searchQuery.trim()) {
      dispatch(searchInteractions(searchQuery));
    }
  }, [dispatch, searchQuery]);


  const handleSearchChange = useCallback(
    (e) => {
      const query = e.target.value;
      dispatch(setSearchQuery(query));
      if (query.trim()) {
        dispatch(searchInteractions(query));
        setShowResults(true);
      } else {
        dispatch(clearSearchResults());
        setShowResults(false);
      }
    },
    [dispatch]
  );

  const handleResultClick = useCallback((interaction) => {
    dispatch(setSelectedInteraction(interaction));
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch]);

  // Handle click outside to close search results
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


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
              <div className="hidden md:flex max-w-md w-full relative" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.trim() && setShowResults(true)}
                  placeholder="Search doctors, hospitals..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                />
                
                {/* Search Results Dropdown */}
                {showResults && (searchQuery.trim() || searchLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((result) => (
                          <div 
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{result.doctor_name}</p>
                                <p className="text-xs text-gray-500">{result.hospital_name}</p>
                              </div>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                {result.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 truncate">{result.product_discussed}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
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
