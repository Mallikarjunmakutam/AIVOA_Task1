import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bot, Send, User as UserIcon, Loader2 } from 'lucide-react';

import {
  sendChatMessage,
  addUserMessage,
  selectChatMessages,
  selectChatLoading,
  selectChatStatus,
} from '../features/chatSlice';

const AIChatAssistant = () => {
  const dispatch = useDispatch();
  const messages = useSelector(selectChatMessages);
  const loading = useSelector(selectChatLoading);
  const status = useSelector(selectChatStatus);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const currentInput = inputValue;
    setInputValue('');

    // Add user message to store immediately
    dispatch(addUserMessage(currentInput));

    // Dispatch the async thunk to send to backend
    dispatch(sendChatMessage(currentInput));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-indigo-600 p-2 rounded-full mr-3">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900">AI Assistant</h3>
            <p className="text-xs text-indigo-600">Powered by Groq LLaMA</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
          status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {status === 'online' ? 'Online' : 'Error'}
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                msg.sender === 'user' ? 'bg-gray-200 ml-2' : 'bg-indigo-100 mr-2'
              }`}>
                {msg.sender === 'user'
                  ? <UserIcon className="w-4 h-4 text-gray-600" />
                  : <Bot className="w-4 h-4 text-indigo-600" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                  : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex flex-row max-w-[85%]">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 mr-2 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-none bg-white border border-gray-100 shadow-sm flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask for insights on a doctor or product..."
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatAssistant;
