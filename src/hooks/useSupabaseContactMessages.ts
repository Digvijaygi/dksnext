import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const useSupabaseContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    const formattedMessages: ContactMessage[] = (data || []).map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      isRead: m.is_read,
      createdAt: m.created_at,
    }));

    setMessages(formattedMessages);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  const addMessage = useCallback(async (messageData: Omit<ContactMessage, 'id' | 'isRead' | 'createdAt'>) => {
    const { error } = await supabase.from('contact_messages').insert({
      name: messageData.name,
      email: messageData.email,
      subject: messageData.subject,
      message: messageData.message,
    });

    if (error) {
      console.error('Error adding message:', error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting message:', error);
    }
  }, []);

  const unreadCount = messages.filter(m => !m.isRead).length;

  return {
    messages,
    isLoading,
    addMessage,
    markAsRead,
    deleteMessage,
    unreadCount,
  };
};
