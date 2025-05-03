import React, { useState, useEffect, useRef } from 'react';
import { MdSend, MdAttachFile } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Mock current user data - would come from auth context in a real app
  const currentUser = {
    id: '1',
    name: 'Seller',
    role: 'seller',
    avatar: 'https://via.placeholder.com/40',
  };

  // Mock admin data
  const adminUser = {
    id: '2',
    name: 'Admin',
    role: 'admin',
    avatar: 'https://via.placeholder.com/40',
  };

  useEffect(() => {
    // Fetch chat messages from server
    fetchMessages();
    
    // Setup polling for new messages
    const interval = setInterval(fetchMessages, 15000); // Poll every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      // This would be replaced with your actual API endpoint
      const response = await axios.get('https://temiperi-eaze.onrender.com/temiperi/chat-messages');
      
      // For demo purposes, if API not available, show mock data
      if (!response.data) {
        setMessages(getMockMessages());
        return;
      }
      
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use mock data if API fails
      setMessages(getMockMessages());
    }
  };

  const getMockMessages = () => {
    return [
      {
        id: '1',
        sender: adminUser,
        text: 'Good morning! How are sales today?',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        attachments: []
      },
      {
        id: '2',
        sender: currentUser,
        text: 'Sales are good today. We have several large orders.',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        attachments: []
      },
      {
        id: '3',
        sender: adminUser,
        text: 'That\'s great! We need to restock the inventory soon.',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        attachments: []
      },
      {
        id: '4',
        sender: currentUser,
        text: 'I\'ll prepare a list of items we need to restock.',
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        attachments: []
      },
      {
        id: '5',
        sender: adminUser,
        text: 'Perfect. Also, how is the new POS system working?',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        attachments: []
      }
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) return;
    
    const messageData = {
      sender: currentUser,
      text: newMessage,
      timestamp: new Date().toISOString(),
      attachments: attachments,
    };
    
    // Optimistically add message to UI
    setMessages([...messages, { ...messageData, id: `temp-${Date.now()}` }]);
    setNewMessage('');
    setAttachments([]);
    
    try {
      // This would be replaced with your actual API endpoint
      await axios.post('https://temiperi-eaze.onrender.com/temiperi/chat-messages', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleFileSelect = async (e) => {
    if (!e.target.files.length) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      // In a real app, you would upload these files to your server
      // For this example, we'll simulate uploads with a timeout
      setTimeout(() => {
        const newAttachments = files.map(file => ({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file) // In a real app, this would be the URL from your storage service
        }));
        
        setAttachments([...attachments, ...newAttachments]);
        setIsUploading(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
      setIsUploading(false);
    }
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timeString) => {
    const date = new Date(timeString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-medium mb-6">Chat with Admin</h1>
      
      <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-md overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {Object.entries(messagesByDate).map(([date, msgs]) => (
            <div key={date} className="mb-6">
              <div className="flex justify-center mb-4">
                <span className="px-4 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                  {date}
                </span>
              </div>
              
              {msgs.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex mb-4 ${msg.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender.id !== currentUser.id && (
                    <img src={msg.sender.avatar} alt={msg.sender.name} className="w-8 h-8 rounded-full mr-2" />
                  )}
                  
                  <div 
                    className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                      msg.sender.id === currentUser.id 
                        ? 'bg-blue text-white' 
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-medium ${
                        msg.sender.id === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.sender.name}
                      </span>
                      <span className={`text-xs ${
                        msg.sender.id === currentUser.id ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map(att => (
                          <a 
                            key={att.id} 
                            href={att.url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center p-2 rounded text-xs ${
                              msg.sender.id === currentUser.id 
                                ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                          >
                            <MdAttachFile className="mr-1" /> 
                            <span className="truncate flex-1">{att.name}</span>
                            <span className="ml-1">({formatFileSize(att.size)})</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {msg.sender.id === currentUser.id && (
                    <img src={msg.sender.avatar} alt={msg.sender.name} className="w-8 h-8 rounded-full ml-2" />
                  )}
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 text-xs">
                <span className="truncate max-w-[120px]">{att.name}</span>
                <button 
                  onClick={() => removeAttachment(att.id)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Message input */}
        <form onSubmit={handleSubmit} className="p-4 border-t flex items-center">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden" 
            multiple
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`text-gray-500 hover:text-blue p-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <MdAttachFile className="text-xl" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue"
            disabled={isUploading}
          />
          <button 
            type="submit"
            disabled={(!newMessage.trim() && attachments.length === 0) || isUploading}
            className={`bg-blue text-white rounded-r-lg p-2 ${
              (!newMessage.trim() && attachments.length === 0) || isUploading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-opacity-80'
            }`}
          >
            <MdSend className="text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
