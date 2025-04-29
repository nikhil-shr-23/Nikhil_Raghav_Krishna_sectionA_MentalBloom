import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, PlusIcon, SearchIcon, TagIcon } from 'lucide-react';
import { toast } from 'sonner';

const JournalPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('entries');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [date, setDate] = useState(new Date());

  // Fetch journal entries
  const fetchEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/journal?page=${pagination.page}&pageSize=${pagination.pageSize}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch journal entries');
      
      const data = await response.json();
      setEntries(data.entries);
      setPagination({
        ...pagination,
        total: data.total
      });
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  // Search journal entries
  const searchEntries = async () => {
    if (!searchQuery.trim() || !user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/journal/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to search journal entries');
      
      const data = await response.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching journal entries:', error);
      toast.error('Failed to search journal entries');
    } finally {
      setLoading(false);
    }
  };

  // Create a new journal entry
  const createEntry = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newEntry)
      });
      
      if (!response.ok) throw new Error('Failed to create journal entry');
      
      const data = await response.json();
      toast.success('Journal entry created successfully');
      
      // Reset form
      setNewEntry({
        title: '',
        content: '',
        mood: '',
        tags: []
      });
      setTagInput('');
      
      // Refresh entries
      fetchEntries();
      
      // Switch to entries tab
      setActiveTab('entries');
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast.error('Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  // Add tag to new entry
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    if (!newEntry.tags.includes(tagInput.trim())) {
      setNewEntry({
        ...newEntry,
        tags: [...newEntry.tags, tagInput.trim()]
      });
    }
    
    setTagInput('');
  };

  // Remove tag from new entry
  const removeTag = (tag) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags.filter(t => t !== tag)
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  // Load entries when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, pagination.page]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Journal</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entries">My Entries</TabsTrigger>
          <TabsTrigger value="new">New Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries" className="mt-6">
          <div className="flex items-center mb-4">
            <Input
              placeholder="Search journal entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mr-2"
            />
            <Button onClick={searchEntries} disabled={loading}>
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          {showSearchResults ? (
            <>
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Search Results</h2>
                <Button variant="outline" onClick={() => setShowSearchResults(false)}>
                  Back to All Entries
                </Button>
              </div>
              
              {searchResults.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No results found</p>
              ) : (
                <div className="grid gap-4">
                  {searchResults.map((entry) => (
                    <Card key={entry.id}>
                      <CardHeader>
                        <CardTitle>{entry.title}</CardTitle>
                        <CardDescription>{formatDate(entry.created_at)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{entry.content}</p>
                        
                        {entry.mood && (
                          <div className="mt-4">
                            <span className="font-semibold">Mood:</span> {entry.mood}
                          </div>
                        )}
                        
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You don't have any journal entries yet</p>
                  <Button onClick={() => setActiveTab('new')}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Your First Entry
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {entries.map((entry) => (
                    <Card key={entry.id}>
                      <CardHeader>
                        <CardTitle>{entry.title}</CardTitle>
                        <CardDescription>{formatDate(entry.created_at)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{entry.content}</p>
                        
                        {entry.mood && (
                          <div className="mt-4">
                            <span className="font-semibold">Mood:</span> {entry.mood}
                          </div>
                        )}
                        
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {entries.length > 0 && pagination.total > pagination.pageSize && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1 || loading}
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    className="mr-2"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center mx-2">
                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize) || loading}
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    className="ml-2"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          <Card>
            <form onSubmit={createEntry}>
              <CardHeader>
                <CardTitle>Create New Journal Entry</CardTitle>
                <CardDescription>Record your thoughts, feelings, and experiences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="font-medium">Title</label>
                  <Input
                    id="title"
                    placeholder="Entry title"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="content" className="font-medium">Content</label>
                  <Textarea
                    id="content"
                    placeholder="Write your journal entry here..."
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    rows={8}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="mood" className="font-medium">Mood (optional)</label>
                  <Input
                    id="mood"
                    placeholder="How are you feeling?"
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-medium">Tags (optional)</label>
                  <div className="flex">
                    <Input
                      placeholder="Add tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="mr-2"
                    />
                    <Button type="button" onClick={addTag} variant="outline">Add</Button>
                  </div>
                  
                  {newEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newEntry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} &times;
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save Journal Entry'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JournalPage;
