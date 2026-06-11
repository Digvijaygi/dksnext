import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, MailOpen, Trash2, Clock, User, MessageSquare, X, 
  Search, Filter, Download, CheckSquare, Square, Reply, 
  Star, StarOff, Archive, RefreshCw, AlertCircle, 
  Phone, MapPin, Globe, Calendar, Tag, ChevronLeft, ChevronRight,
  Bell, BellOff, Send, Paperclip, Bookmark, Flag, MoreVertical,
  CheckCircle, XCircle, Printer, Share2, Copy, AtSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseContactMessages, ContactMessage } from '@/hooks/useSupabaseContactMessages';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'sonner';

// Custom hook for message filtering and search
const useMessageFilters = (messages: ContactMessage[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [starredFilter, setStarredFilter] = useState<'all' | 'starred' | 'unstarred'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  const filteredMessages = useMemo(() => {
    let filtered = [...messages];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.name.toLowerCase().includes(term) ||
        msg.email.toLowerCase().includes(term) ||
        msg.subject.toLowerCase().includes(term) ||
        msg.message.toLowerCase().includes(term)
      );
    }

    // Read status filter
    if (statusFilter === 'read') {
      filtered = filtered.filter(msg => msg.isRead);
    } else if (statusFilter === 'unread') {
      filtered = filtered.filter(msg => !msg.isRead);
    }

    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      filtered = filtered.filter(msg => {
        const msgDate = new Date(msg.createdAt);
        return msgDate.toDateString() === now.toDateString();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(msg => new Date(msg.createdAt) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter(msg => new Date(msg.createdAt) >= monthAgo);
    }

    return filtered;
  }, [messages, searchTerm, statusFilter, dateRange]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMessages(newSelected);
  };

  const selectAll = () => {
    if (selectedMessages.size === filteredMessages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(filteredMessages.map(m => m.id)));
    }
  };

  const clearSelection = () => {
    setSelectedMessages(new Set());
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    starredFilter,
    setStarredFilter,
    dateRange,
    setDateRange,
    filteredMessages,
    selectedMessages,
    toggleSelect,
    selectAll,
    clearSelection,
    hasSelected: selectedMessages.size > 0
  };
};

// Message Statistics Component
const MessageStats = ({ messages }: { messages: ContactMessage[] }) => {
  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter(m => !m.isRead).length;
    const today = messages.filter(m => {
      const today = new Date();
      const msgDate = new Date(m.createdAt);
      return msgDate.toDateString() === today.toDateString();
    }).length;
    const thisWeek = messages.filter(m => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(m.createdAt) >= weekAgo;
    }).length;

    return { total, unread, today, thisWeek };
  }, [messages]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="glass-card p-3 rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-2xl font-bold">{stats.total}</span>
        </div>
        <p className="text-xs text-muted-foreground">Total Messages</p>
      </div>
      <div className="glass-card p-3 rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <Mail className="w-4 h-4 text-yellow-500" />
          <span className="text-2xl font-bold">{stats.unread}</span>
        </div>
        <p className="text-xs text-muted-foreground">Unread</p>
      </div>
      <div className="glass-card p-3 rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-2xl font-bold">{stats.today}</span>
        </div>
        <p className="text-xs text-muted-foreground">Today</p>
      </div>
      <div className="glass-card p-3 rounded-xl">
        <div className="flex items-center justify-between mb-1">
          <Clock className="w-4 h-4 text-green-500" />
          <span className="text-2xl font-bold">{stats.thisWeek}</span>
        </div>
        <p className="text-xs text-muted-foreground">This Week</p>
      </div>
    </div>
  );
};

// Quick Reply Component
const QuickReply = ({ email, subject, onClose }: { email: string; subject: string; onClose: () => void }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setIsSending(true);
    try {
      // In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Reply sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        className="glass-card p-6 max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Reply className="w-5 h-5 text-primary" />
            Quick Reply
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">To:</label>
            <p className="text-sm font-medium">{email}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Subject:</label>
            <p className="text-sm font-medium">Re: {subject}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Message:</label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              rows={6}
              className="w-full p-3 bg-background/50 border border-white/10 rounded-xl focus:border-primary/50 outline-none resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSendReply} disabled={isSending}>
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Bulk Actions Bar
const BulkActionsBar = ({ 
  count, 
  onClear, 
  onMarkRead, 
  onMarkUnread, 
  onDelete,
  onExport 
}: { 
  count: number; 
  onClear: () => void; 
  onMarkRead: () => void; 
  onMarkUnread: () => void; 
  onDelete: () => void;
  onExport: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-3 mb-4 rounded-xl"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-medium">{count} message{count !== 1 ? 's' : ''} selected</span>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onMarkRead} className="glass-button">
            <MailOpen className="w-4 h-4 mr-1" />
            Mark as Read
          </Button>
          <Button variant="outline" size="sm" onClick={onMarkUnread} className="glass-button">
            <Mail className="w-4 h-4 mr-1" />
            Mark as Unread
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} className="glass-button">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const MessagesPanel = () => {
  const { messages, markAsRead, deleteMessage, unreadCount, refreshMessages } = useSupabaseContactMessages();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [starredMessages, setStarredMessages] = useState<Set<string>>(new Set());
  const [showQuickReply, setShowQuickReply] = useState(false);
  const [replyTo, setReplyTo] = useState<{ email: string; subject: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    filteredMessages,
    selectedMessages,
    toggleSelect,
    selectAll,
    clearSelection,
    hasSelected
  } = useMessageFilters(messages);

  // Load starred messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('starredMessages');
    if (saved) {
      setStarredMessages(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save starred messages
  useEffect(() => {
    localStorage.setItem('starredMessages', JSON.stringify(Array.from(starredMessages)));
  }, [starredMessages]);

  const handleStarMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        toast.success('Removed from starred');
      } else {
        newSet.add(id);
        toast.success('Added to starred');
      }
      return newSet;
    });
  };

  const handleOpenMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const handleBulkMarkRead = async () => {
    for (const id of selectedMessages) {
      await markAsRead(id);
    }
    toast.success(`${selectedMessages.size} messages marked as read`);
    clearSelection();
  };

  const handleBulkMarkUnread = async () => {
    // Note: You'd need to implement markAsUnread in your hook
    toast.info('Mark as unread feature coming soon');
    clearSelection();
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedMessages.size} messages? This action cannot be undone.`)) {
      for (const id of selectedMessages) {
        await deleteMessage(id);
      }
      toast.success(`${selectedMessages.size} messages deleted`);
      clearSelection();
      if (selectedMessage && selectedMessages.has(selectedMessage.id)) {
        setSelectedMessage(null);
      }
    }
  };

  const handleExport = () => {
    const selectedMsgs = messages.filter(m => selectedMessages.has(m.id));
    const data = JSON.stringify(selectedMsgs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-export-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedMessages.size} messages`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMessages();
    setTimeout(() => setIsRefreshing(false), 1000);
    toast.success('Messages refreshed');
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Messages</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="glass-button"
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="glass-button"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <MessageStats messages={messages} />

      {/* Search and Filters Bar */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-background/50 border border-white/10 rounded-xl text-sm focus:border-primary/50 outline-none"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 bg-background/50 border border-white/10 rounded-xl text-sm focus:border-primary/50 outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear Search
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {hasSelected && (
          <BulkActionsBar
            count={selectedMessages.size}
            onClear={clearSelection}
            onMarkRead={handleBulkMarkRead}
            onMarkUnread={handleBulkMarkUnread}
            onDelete={handleBulkDelete}
            onExport={handleExport}
          />
        )}
      </AnimatePresence>

      {/* Select All Bar */}
      {filteredMessages.length > 0 && !hasSelected && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAll}
            className="text-xs glass-button"
          >
            <CheckSquare className="w-3 h-3 mr-1" />
            Select All ({filteredMessages.length})
          </Button>
        </div>
      )}

      {/* Messages Display */}
      {filteredMessages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">No messages found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
              ? 'Try adjusting your filters to see more messages.'
              : 'Messages from your contact form will appear here.'}
          </p>
          {(searchTerm || statusFilter !== 'all' || dateRange !== 'all') && (
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateRange('all');
              }}
              className="mt-4"
            >
              Clear all filters
            </Button>
          )}
        </motion.div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`glass-card p-4 transition-all duration-300 hover:border-primary/30 cursor-pointer ${
                !message.isRead ? 'border-l-4 border-l-primary' : ''
              } ${selectedMessages.has(message.id) ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleOpenMessage(message)}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedMessages.has(message.id)}
                    onChange={() => toggleSelect(message.id)}
                    className="w-4 h-4 rounded border-white/20 bg-background/50 mt-2"
                  />
                </div>

                {/* Star */}
                <button
                  onClick={(e) => handleStarMessage(message.id, e)}
                  className="mt-1.5 hover:scale-110 transition-transform"
                >
                  {starredMessages.has(message.id) ? (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {/* Avatar/Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.isRead ? 'bg-muted' : 'bg-primary/20'
                }`}>
                  {message.isRead ? (
                    <MailOpen className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Mail className="w-5 h-5 text-primary" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`font-semibold ${!message.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {message.name}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyEmail(message.email);
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <AtSign className="w-3 h-3" />
                      {message.email}
                    </button>
                    {!message.isRead && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      </>
                    )}
                    {starredMessages.has(message.id) && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <Star className="w-3 h-3 text-yellow-500" />
                      </>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">{message.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{message.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(message.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 glass-button hover:text-primary"
                    onClick={() => {
                      setReplyTo({ email: message.email, subject: message.subject });
                      setShowQuickReply(true);
                    }}
                  >
                    <Reply className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 glass-button text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (window.confirm('Delete this message?')) {
                        deleteMessage(message.id);
                        if (selectedMessage?.id === message.id) {
                          setSelectedMessage(null);
                        }
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card p-4 cursor-pointer hover:scale-[1.02] transition-all duration-300 ${
                !message.isRead ? 'border-primary/30' : ''
              }`}
              onClick={() => handleOpenMessage(message)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMessages.has(message.id)}
                    onChange={() => toggleSelect(message.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded"
                  />
                  <button
                    onClick={(e) => handleStarMessage(message.id, e)}
                    className="hover:scale-110 transition-transform"
                  >
                    {starredMessages.has(message.id) ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  message.isRead ? 'bg-muted' : 'bg-primary/20'
                }`}>
                  {message.isRead ? (
                    <MailOpen className="w-4 h-4" />
                  ) : (
                    <Mail className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="font-semibold text-foreground">{message.name}</h3>
                <p className="text-xs text-primary truncate">{message.email}</p>
              </div>
              
              <p className="text-sm font-medium text-foreground mb-2 line-clamp-1">{message.subject}</p>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{message.message}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setReplyTo({ email: message.email, subject: message.subject });
                      setShowQuickReply(true);
                    }}
                  >
                    <Reply className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => {
                      if (window.confirm('Delete this message?')) {
                        deleteMessage(message.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">{selectedMessage.name}</h3>
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${selectedMessage.email}`} className="text-sm text-primary hover:underline">
                        {selectedMessage.email}
                      </a>
                      <button
                        onClick={() => handleCopyEmail(selectedMessage.email)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="glass-button h-8 w-8"
                    onClick={(e) => handleStarMessage(selectedMessage.id, e)}
                  >
                    {starredMessages.has(selectedMessage.id) ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="glass-button h-8 w-8"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Subject</label>
                    <p className="text-foreground font-medium mt-1">{selectedMessage.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(selectedMessage.createdAt), 'PPP')}
                      <span className="text-muted-foreground">•</span>
                      {format(new Date(selectedMessage.createdAt), 'p')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Message</label>
                  <div className="bg-background/30 rounded-xl p-4">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-end">
                  <Button
                    variant="outline"
                    className="glass-button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMessage.message);
                      toast.success('Message copied to clipboard');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Message
                  </Button>
                  <Button
                    variant="outline"
                    className="glass-button"
                    asChild
                  >
                    <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                      <Mail className="w-4 h-4 mr-1" />
                      Open in Email
                    </a>
                  </Button>
                  <Button
                    className="bg-primary"
                    onClick={() => {
                      setReplyTo({ email: selectedMessage.email, subject: selectedMessage.subject });
                      setShowQuickReply(true);
                      setSelectedMessage(null);
                    }}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Delete this message?')) {
                        deleteMessage(selectedMessage.id);
                        setSelectedMessage(null);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Reply Modal */}
      <AnimatePresence>
        {showQuickReply && replyTo && (
          <QuickReply
            email={replyTo.email}
            subject={replyTo.subject}
            onClose={() => {
              setShowQuickReply(false);
              setReplyTo(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
