'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  User,
  BookOpen,
  FileText,
  Heart,
  Search,
  CalendarPlus,
  MessageSquarePlus,
  Trophy,
  Gift,
  ArrowRight,
  Clock,
  X,
  Loader2,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch, useQuickActions, QuickAction, SearchResult, getRecentSearches, addRecentSearch, clearRecentSearches } from '@/hooks/use-search';

// Icon mapping for result types
const typeIcons: Record<string, React.ReactNode> = {
  event: <Calendar className="h-4 w-4 text-purple-500" />,
  user: <User className="h-4 w-4 text-blue-500" />,
  devotional: <BookOpen className="h-4 w-4 text-green-500" />,
  forum_topic: <FileText className="h-4 w-4 text-orange-500" />,
  document: <FileText className="h-4 w-4 text-cyan-500" />,
  prayer_request: <Heart className="h-4 w-4 text-red-500" />,
};

// Icon mapping for quick actions
const actionIcons: Record<string, React.ReactNode> = {
  'calendar-plus': <CalendarPlus className="h-4 w-4" />,
  'message-square-plus': <MessageSquarePlus className="h-4 w-4" />,
  'heart': <Heart className="h-4 w-4" />,
  'calendar': <Calendar className="h-4 w-4" />,
  'trophy': <Trophy className="h-4 w-4" />,
  'book-open': <BookOpen className="h-4 w-4" />,
  'gift': <Gift className="h-4 w-4" />,
};

// Type badge colors
const typeBadgeColors: Record<string, string> = {
  event: 'bg-purple-100 text-purple-700',
  user: 'bg-blue-100 text-blue-700',
  devotional: 'bg-green-100 text-green-700',
  forum_topic: 'bg-orange-100 text-orange-700',
  document: 'bg-cyan-100 text-cyan-700',
  prayer_request: 'bg-red-100 text-red-700',
};

interface GlobalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalSearch({ open: controlledOpen, onOpenChange }: GlobalSearchProps = {}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Use controlled or internal state
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const {
    query,
    setQuery,
    results,
    loading,
    total,
    clearSearch,
  } = useSearch({ debounceMs: 200 });

  const quickActions = useQuickActions();

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [open]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  // Handle search result selection
  const handleSelect = useCallback((result: SearchResult) => {
    addRecentSearch(query);
    setOpen(false);
    clearSearch();
    
    // Navigate to the result URL
    if (result.url.startsWith('/')) {
      router.push(result.url);
    } else {
      window.location.href = result.url;
    }
  }, [query, router, setOpen, clearSearch]);

  // Handle quick action selection
  const handleActionSelect = useCallback((action: QuickAction) => {
    setOpen(false);
    clearSearch();
    action.action();
  }, [setOpen, clearSearch]);

  // Handle recent search selection
  const handleRecentSearchSelect = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, [setQuery]);

  // Handle clear recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Escape HTML from highlighted text
  const renderHighlighted = (text: string | undefined) => {
    if (!text) return null;
    return (
      <span
        dangerouslySetInnerHTML={{ __html: text }}
        className="block truncate"
      />
    );
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Global Search"
      description="Search events, users, devotionals, and more..."
    >
      <CommandInput
        placeholder="Search events, users, devotionals..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
        )}

        {!loading && query.length >= 2 && results.length > 0 && (
          <>
            <CommandGroup heading={`Results (${total})`}>
              <ScrollArea className="max-h-[300px]">
                {results.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-start gap-3 py-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {typeIcons[result.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {renderHighlighted(result.highlightedTitle) || (
                          <span className="font-medium truncate">{result.title}</span>
                        )}
                        <Badge className={typeBadgeColors[result.type]} variant="secondary">
                          {result.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {result.subtitle}
                        </p>
                      )}
                      {result.highlightedDescription && (
                        <p
                          className="text-xs text-muted-foreground line-clamp-2 mt-1"
                          dangerouslySetInnerHTML={{ __html: result.highlightedDescription }}
                        />
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
            {total > results.length && (
              <>
                <CommandSeparator />
                <CommandItem
                  onSelect={() => {
                    addRecentSearch(query);
                    setOpen(false);
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                  }}
                  className="justify-center text-purple-600"
                >
                  View all {total} results
                  <ArrowRight className="h-4 w-4 ml-2" />
                </CommandItem>
              </>
            )}
          </>
        )}

        {!loading && query.length < 2 && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <>
                <CommandGroup heading="Recent Searches">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex-1 overflow-x-auto">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => handleRecentSearchSelect(search)}
                          className="inline-flex items-center gap-2 mr-2"
                        >
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{search}</span>
                        </CommandItem>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearRecent}
                      className="text-xs text-muted-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Quick Actions */}
            <CommandGroup heading="Quick Actions">
              {quickActions.slice(0, 6).map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => handleActionSelect(action)}
                  className="flex items-center gap-3"
                >
                  {actionIcons[action.icon] || <Search className="h-4 w-4" />}
                  <span>{action.title}</span>
                  {action.shortcut && (
                    <CommandShortcut>{action.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />

            {/* Navigation */}
            <CommandGroup heading="Navigate">
              {quickActions.filter(a => a.category === 'Navigate').slice(0, 4).map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => handleActionSelect(action)}
                  className="flex items-center gap-3"
                >
                  {actionIcons[action.icon] || <Search className="h-4 w-4" />}
                  <span>{action.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* Footer */}
      <div className="border-t px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd> to select
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> to navigate
          </span>
        </div>
        <span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> to close
        </span>
      </div>
    </CommandDialog>
  );
}

// Search Button Component for Header
export function SearchButton({ onClick }: { onClick?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          onClick?.();
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-muted/50 hover:bg-muted rounded-md border border-border transition-colors"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <GlobalSearch open={open} onOpenChange={setOpen} />
    </>
  );
}

export default GlobalSearch;
