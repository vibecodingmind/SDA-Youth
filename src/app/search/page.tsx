'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Calendar,
  User,
  BookOpen,
  FileText,
  Heart,
  Search,
  ArrowRight,
  Filter,
  SortAsc,
  X,
  Loader2,
  CalendarDays,
  Users,
  MessageSquare,
  FileDown,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSearch, SearchResult, SearchType } from '@/hooks/use-search';
import { GlobalSearch } from '@/components/search/global-search';

// Icon mapping for result types
const typeIcons: Record<string, React.ReactNode> = {
  event: <Calendar className="h-5 w-5 text-purple-500" />,
  user: <User className="h-5 w-5 text-blue-500" />,
  devotional: <BookOpen className="h-5 w-5 text-green-500" />,
  forum_topic: <MessageSquare className="h-5 w-5 text-orange-500" />,
  document: <FileDown className="h-5 w-5 text-cyan-500" />,
  prayer_request: <Heart className="h-5 w-5 text-red-500" />,
};

// Type badge colors
const typeBadgeColors: Record<string, string> = {
  event: 'bg-purple-100 text-purple-700 border-purple-200',
  user: 'bg-blue-100 text-blue-700 border-blue-200',
  devotional: 'bg-green-100 text-green-700 border-green-200',
  forum_topic: 'bg-orange-100 text-orange-700 border-orange-200',
  document: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  prayer_request: 'bg-red-100 text-red-700 border-red-200',
};

// Type display names
const typeDisplayNames: Record<string, string> = {
  event: 'Events',
  user: 'Users',
  devotional: 'Devotionals',
  forum_topic: 'Forum Topics',
  document: 'Documents',
  prayer_request: 'Prayer Requests',
};

// Filter types
const filterTypes: { value: SearchType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Search className="h-4 w-4" /> },
  { value: 'events', label: 'Events', icon: <CalendarDays className="h-4 w-4" /> },
  { value: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { value: 'devotionals', label: 'Devotionals', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'forum', label: 'Forum', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'documents', label: 'Documents', icon: <FileDown className="h-4 w-4" /> },
  { value: 'prayer_requests', label: 'Prayer Requests', icon: <Heart className="h-4 w-4" /> },
];

// Sort options
const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
];

// Escape HTML from highlighted text
const renderHighlighted = (text: string | undefined) => {
  if (!text) return null;
  return (
    <span
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') as SearchType) || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<SearchType>(initialType);
  const [sortBy, setSortBy] = useState('relevance');
  const [displayedResults, setDisplayedResults] = useState<SearchResult[]>([]);

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results,
    total,
    loading,
    error,
    hasMore,
    loadMore,
    saveToRecent,
  } = useSearch({ type: selectedType, limit: 20 });

  // Set initial query
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery, setSearchQuery]);

  // Sort results when they change
  useEffect(() => {
    let sorted = [...results];
    
    switch (sortBy) {
      case 'date_desc':
        sorted.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'date_asc':
        sorted.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aDate - bDate;
        });
        break;
      case 'title_asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Keep original order (relevance)
        break;
    }
    
    setDisplayedResults(sorted);
  }, [results, sortBy]);

  // Handle search form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
      saveToRecent(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${selectedType}`);
    }
  }, [query, selectedType, router, setSearchQuery, saveToRecent]);

  // Handle type filter change
  const handleTypeChange = useCallback((type: SearchType) => {
    setSelectedType(type);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${type}`);
  }, [searchQuery, router]);

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    saveToRecent(searchQuery);
    if (result.url.startsWith('/')) {
      router.push(result.url);
    } else {
      window.location.href = result.url;
    }
  }, [searchQuery, router, saveToRecent]);

  // Group results by type for display
  const groupedResults = displayedResults.reduce((acc, result) => {
    const type = result.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Get result counts by type
  const resultCounts = displayedResults.reduce((acc, result) => {
    acc[result.type] = (acc[result.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Search</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events, users, devotionals, forum topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-white/60 hover:text-white" />
                </button>
              )}
            </div>
            <Button type="submit" size="lg" className="h-12 bg-white text-purple-700 hover:bg-white/90">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-64 shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {filterTypes.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleTypeChange(filter.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedType === filter.value
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {filter.icon}
                    <span className="flex-1 text-left">{filter.label}</span>
                    {selectedType === 'all' && resultCounts[filter.value === 'all' ? '' : filter.value.replace('s', '')] && (
                      <Badge variant="secondary" className="text-xs">
                        {resultCounts[filter.value === 'all' ? '' : filter.value.replace('s', '')]}
                      </Badge>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Sort Options */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  Sort By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Mobile Filters */}
            <div className="md:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
              {filterTypes.map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedType === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange(filter.value)}
                  className={selectedType === filter.value ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {filter.icon}
                  <span className="ml-2">{filter.label}</span>
                </Button>
              ))}
            </div>

            {/* Results Header */}
            {searchQuery && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    'Searching...'
                  ) : (
                    <>
                      Found <span className="font-medium text-foreground">{total}</span> results for &quot;{searchQuery}&quot;
                    </>
                  )}
                </p>
                <div className="md:hidden">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-6 text-center">
                  <p className="text-red-600">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery(searchQuery)}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !error && searchQuery && displayedResults.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn&apos;t find anything matching &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try searching for something else, or check the spelling of your query.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Initial State */}
            {!loading && !searchQuery && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Start searching</h3>
                  <p className="text-muted-foreground">
                    Enter a search term to find events, users, devotionals, and more.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Results List */}
            {!loading && !error && displayedResults.length > 0 && (
              <div className="space-y-6">
                {/* Group by type if showing all */}
                {selectedType === 'all' ? (
                  Object.entries(groupedResults).map(([type, typeResults]) => (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-3">
                        {typeIcons[type]}
                        <h2 className="text-lg font-semibold">{typeDisplayNames[type]}</h2>
                        <Badge variant="secondary">{typeResults.length}</Badge>
                      </div>
                      <div className="space-y-3">
                        {typeResults.map((result) => (
                          <Card
                            key={`${result.type}-${result.id}`}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleResultClick(result)}
                          >
                            <CardContent className="py-4">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                  {typeIcons[result.type]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h3 className="font-medium text-lg">
                                        {renderHighlighted(result.highlightedTitle) || result.title}
                                      </h3>
                                      {result.subtitle && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {result.subtitle}
                                        </p>
                                      )}
                                      {result.highlightedDescription && (
                                        <p
                                          className="text-sm text-muted-foreground mt-2 line-clamp-2"
                                          dangerouslySetInnerHTML={{ __html: result.highlightedDescription }}
                                        />
                                      )}
                                    </div>
                                    <Badge className={typeBadgeColors[result.type]} variant="outline">
                                      {result.type.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Separator className="my-6" />
                    </div>
                  ))
                ) : (
                  // Flat list when filtering by type
                  <div className="space-y-3">
                    {displayedResults.map((result) => (
                      <Card
                        key={`${result.type}-${result.id}`}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleResultClick(result)}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {typeIcons[result.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-medium text-lg">
                                    {renderHighlighted(result.highlightedTitle) || result.title}
                                  </h3>
                                  {result.subtitle && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {result.subtitle}
                                    </p>
                                  )}
                                  {result.highlightedDescription && (
                                    <p
                                      className="text-sm text-muted-foreground mt-2 line-clamp-2"
                                      dangerouslySetInnerHTML={{ __html: result.highlightedDescription }}
                                    />
                                  )}
                                  {result.createdAt && (
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(result.createdAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <Badge className={typeBadgeColors[result.type]} variant="outline">
                                  {result.type.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center py-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Results'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
