import React, { useState, useEffect, useRef } from 'react';
import { MdSend, MdAttachFile, MdClose, MdMinimize, MdOpenInFull } from 'react-icons/md';
import { BsChatDots } from 'react-icons/bs';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatRoom = ({ currentUser, embedded = false }) => {
  const [isOpen, setIsOpen] = useState(embedded);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Use provided user or fallback to default
  const currentUserData = currentUser || {
    id: '1',
    name: 'Seller',
    role: 'seller',
    avatar: 'https://via.placeholder.com/40',
  };

  useEffect(() => {
    if ((isOpen && !isMinimized) || embedded) {
      // Fetch chat messages from server
      fetchMessages();
      
      // Setup polling for new messages
      const interval = setInterval(fetchMessages, 15000); // Poll every 15 seconds
      
      return () => clearInterval(interval);
    }
  }, [isOpen, isMinimized, embedded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized]);

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
        sender: { id: '2', name: 'Admin', role: 'admin', avatar: 'https://via.placeholder.com/40' },
        text: 'Good morning! How are sales today?',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        attachments: []
      },
      {
        id: '2',
        sender: { id: '1', name: 'Seller', role: 'seller', avatar: 'https://via.placeholder.com/40' },
        text: 'Sales are good today. We have several large orders.',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        attachments: []
      },
      {
        id: '3',
        sender: { id: '2', name: 'Admin', role: 'admin', avatar: 'https://via.placeholder.com/40' },
        text: 'That\'s great! We need to restock the inventory soon.',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
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
      sender: currentUserData,
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // If embedded, render a simplified version without the popup controls
  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex mb-3 ${msg.sender.id === currentUserData.id ? 'justify-end' : 'justify-start'}`}>
              {msg.sender.id !== currentUserData.id && (
                <img src={msg.sender.avatar} alt={msg.sender.name} className="w-6 h-6 rounded-full mr-1" />
              )}
              <div className={`max-w-[80%] ${msg.sender.id === currentUserData.id ? 'bg-blue text-white' : 'bg-white border border-gray-200'} rounded-lg p-2 shadow-sm`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-medium ${msg.sender.id === currentUserData.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.sender.name}
                  </span>
                  <span className={`text-xs ${msg.sender.id === currentUserData.id ? 'text-blue-100' : 'text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {msg.attachments.map(att => (
                      <a 
                        key={att.id} 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center p-1 rounded text-xs ${
                          msg.sender.id === currentUserData.id ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <MdAttachFile className="mr-1 text-xs" /> 
                        <span className="truncate flex-1 text-xs">{att.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {msg.sender.id === currentUserData.id && (
                <img src={msg.sender.avatar} alt={msg.sender.name} className="w-6 h-6 rounded-full ml-1" />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-2 py-1 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-1">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center bg-white border border-gray-300 rounded px-1 py-0.5 text-xs">
                <span className="truncate max-w-[80px]">{att.name}</span>
                <button 
                  onClick={() => removeAttachment(att.id)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                  aria-label="Remove attachment"
                >
                  <MdClose size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Message input */}
        <form onSubmit={handleSubmit} className="p-2 border-t flex items-center">
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
            className={`text-gray-500 hover:text-blue p-1 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Attach file"
          >
            <MdAttachFile className="text-lg" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-1 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue"
            disabled={isUploading}
          />
          <button 
            type="submit"
            disabled={(!newMessage.trim() && attachments.length === 0) || isUploading}
            className={`bg-blue text-white rounded-r-lg p-1 ${
              (!newMessage.trim() && attachments.length === 0) || isUploading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-opacity-80'
            }`}
            aria-label="Send message"
          >
            <MdSend className="text-lg" />
          </button>
        </form>
      </div>
    );
  }

  // Original floating chat box UI for non-embedded usage
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue text-white rounded-full p-3 shadow-lg hover:bg-opacity-80 transition-all z-40"
        aria-label="Open chat"
      >
        <BsChatDots className="text-2xl" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 bg-blue text-white rounded-lg shadow-lg flex items-center justify-between p-3 cursor-pointer z-40"
        onClick={toggleMinimize}
      >
        <div className="flex items-center">
          <BsChatDots className="text-xl mr-2" />
          <span className="font-medium">Temiperi Chat</span>
        </div>
        <MdOpenInFull className="text-xl ml-4" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-40 border border-gray-200">
      {/* Chat header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <BsChatDots className="text-blue text-xl mr-2" />
          <h3 className="font-medium">Temiperi Chat</h3>
        </div>
        <div className="flex items-center">
          <button 
            onClick={toggleMinimize}
            className="text-gray-500 hover:text-gray-700 mr-2"
            aria-label="Minimize chat"
          >
            <MdMinimize className="text-xl" />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close chat"
          >
            <MdClose className="text-xl" />
          </button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-4 ${msg.sender.id === currentUserData.id ? 'justify-end' : 'justify-start'}`}>
            {msg.sender.id !== currentUserData.id && (
              <img src={msg.sender.avatar} alt={msg.sender.name} className="w-8 h-8 rounded-full mr-2" />
            )}
            <div className={`max-w-[75%] ${msg.sender.id === currentUserData.id ? 'bg-blue text-white' : 'bg-white border border-gray-200'} rounded-lg p-3 shadow-sm`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-medium ${msg.sender.id === currentUserData.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {msg.sender.name}
                </span>
                <span className={`text-xs ${msg.sender.id === currentUserData.id ? 'text-blue-100' : 'text-gray-400'}`}>
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
                        msg.sender.id === currentUserData.id ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-100 hover:bg-gray-200'
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
            {msg.sender.id === currentUserData.id && (
              <img src={msg.sender.avatar} alt={msg.sender.name} className="w-8 h-8 rounded-full ml-2" />
            )}
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
                aria-label="Remove attachment"
              >
                <MdClose />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex items-center">
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
          aria-label="Attach file"
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
          aria-label="Send message"
        >
          <MdSend className="text-xl" />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
