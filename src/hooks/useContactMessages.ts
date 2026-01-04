import { useState, useEffect } from 'react';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const STORAGE_KEY = 'contact_messages';

export const useContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMessages(JSON.parse(stored));
    }

    const handleStorageChange = (e: CustomEvent<ContactMessage[]>) => {
      setMessages(e.detail);
    };

    window.addEventListener('contact-messages-updated' as any, handleStorageChange);
    return () => window.removeEventListener('contact-messages-updated' as any, handleStorageChange);
  }, []);

  const addMessage = (messageData: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>) => {
    const newMessage: ContactMessage = {
      ...messageData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const updated = [newMessage, ...messages];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setMessages(updated);
    window.dispatchEvent(new CustomEvent('contact-messages-updated', { detail: updated }));
    return newMessage;
  };

  const markAsRead = (id: string) => {
    const updated = messages.map(msg => 
      msg.id === id ? { ...msg, isRead: true } : msg
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setMessages(updated);
    window.dispatchEvent(new CustomEvent('contact-messages-updated', { detail: updated }));
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(msg => msg.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setMessages(updated);
    window.dispatchEvent(new CustomEvent('contact-messages-updated', { detail: updated }));
  };

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  return { messages, addMessage, markAsRead, deleteMessage, unreadCount };
};
