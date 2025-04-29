'use client';

import React, { useState, useEffect } from 'react';
import {
  getJournalEntriesFromStorage,
  saveJournalEntryToStorage,
  clearJournalEntriesFromStorage,
  searchJournalEntries,
  JournalEntry
} from '@/lib/localStorageUtils';

const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('entries');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearButton, setShowClearButton] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: [] as string[]
  });

  // Load journal entries from local storage
  useEffect(() => {
    setLoading(true);
    try {
      const storedEntries = getJournalEntriesFromStorage();
      setEntries(storedEntries);
      setShowClearButton(storedEntries.length > 0);
    } catch (err) {
      console.error('Error loading journal entries:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load journal entries: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchJournalEntries(searchQuery);
      setEntries(results);
    } else {
      // If search query is empty, load all entries
      setEntries(getJournalEntriesFromStorage());
    }
  }, [searchQuery]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      alert('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Save to local storage
      const savedEntry = saveJournalEntryToStorage({
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood || undefined,
        tags: newEntry.tags.length > 0 ? newEntry.tags : undefined,
        user_id: localStorage.getItem('userId') || undefined
      });

      // Show success message
      alert('Journal entry saved successfully');

      // Reset form
      setNewEntry({
        title: '',
        content: '',
        mood: '',
        tags: []
      });

      // Update entries list
      setEntries([savedEntry, ...entries]);
      setShowClearButton(true);

      // Switch to entries tab
      setActiveTab('entries');
    } catch (err) {
      console.error('Error saving journal entry:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to save journal entry: ${errorMessage}`);
      alert(`Failed to save journal entry: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle clearing all journal entries
  const handleClearEntries = () => {
    if (window.confirm('Are you sure you want to delete all your journal entries? This cannot be undone.')) {
      clearJournalEntriesFromStorage();
      setEntries([]);
      setShowClearButton(false);
      alert('All journal entries have been deleted');
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-[#6BCB77] mb-6">My Journal</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">Loading...</span>
        </div>
      )}

      <div className="flex mb-6">
        <button
          className={`px-4 py-2 mr-2 rounded-t-lg ${
            activeTab === 'entries'
              ? 'bg-[#6BCB77] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('entries')}
        >
          My Entries
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'new'
              ? 'bg-[#6BCB77] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('new')}
        >
          New Entry
        </button>
      </div>

      {activeTab === 'entries' ? (
        <div>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <div className="flex flex-1">
              <input
                type="text"
                placeholder="Search journal entries..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#6BCB77]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-[#6BCB77] text-white rounded-r-lg hover:bg-[#5ab868]"
                onClick={(e) => e.preventDefault()}
              >
                Search
              </button>
            </div>
            
            {showClearButton && (
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={handleClearEntries}
              >
                Clear All Entries
              </button>
            )}
          </div>
          
          {entries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">
                {searchQuery.trim() 
                  ? 'No journal entries match your search' 
                  : 'You don\'t have any journal entries yet'}
              </p>
              {!searchQuery.trim() && (
                <button
                  className="px-4 py-2 bg-[#6BCB77] text-white rounded-lg hover:bg-[#5ab868]"
                  onClick={() => setActiveTab('new')}
                >
                  Create Your First Entry
                </button>
              )}
              {searchQuery.trim() && (
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-[#4D96FF]">{entry.title}</h2>
                    <span className="text-sm text-gray-500">{formatDate(entry.created_at)}</span>
                  </div>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{entry.content}</p>

                  {entry.mood && (
                    <div className="mb-2">
                      <span className="font-medium">Mood:</span> {entry.mood}
                    </div>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#F4F9F4] text-[#6BCB77] text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6BCB77]"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                Content
              </label>
              <textarea
                id="content"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6BCB77]"
                rows={8}
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="mood" className="block text-gray-700 font-medium mb-2">
                Mood (optional)
              </label>
              <input
                type="text"
                id="mood"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6BCB77]"
                value={newEntry.mood}
                onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                placeholder="How are you feeling?"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
                Tags (optional)
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="tags"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#6BCB77]"
                  placeholder="Add tags separated by commas"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const tagsInput = e.currentTarget.value;
                      if (tagsInput.trim()) {
                        const newTags = tagsInput.split(',').map(tag => tag.trim());
                        setNewEntry({
                          ...newEntry,
                          tags: [...newEntry.tags, ...newTags]
                        });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-lg hover:bg-gray-300"
                  onClick={() => {
                    const input = document.getElementById('tags') as HTMLInputElement;
                    if (input.value.trim()) {
                      const newTags = input.value.split(',').map(tag => tag.trim());
                      setNewEntry({
                        ...newEntry,
                        tags: [...newEntry.tags, ...newTags]
                      });
                      input.value = '';
                    }
                  }}
                >
                  Add
                </button>
              </div>

              {newEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newEntry.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-[#F4F9F4] text-[#6BCB77] text-sm rounded-full flex items-center"
                    >
                      #{tag}
                      <button
                        type="button"
                        className="ml-1 text-[#6BCB77] hover:text-[#5ab868]"
                        onClick={() => {
                          setNewEntry({
                            ...newEntry,
                            tags: newEntry.tags.filter((_, i) => i !== index)
                          });
                        }}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={() => setActiveTab('entries')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#6BCB77] text-white rounded-lg hover:bg-[#5ab868]"
              >
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
