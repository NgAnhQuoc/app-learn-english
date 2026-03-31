"use client";

import { useChat } from "ai/react";
import { Button, Input, Typography, App } from "antd";
import { ArrowUpOutlined, MenuOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type { TextAreaRef } from "antd/es/input/TextArea";
import Image from "next/image";
import MessageItem from "./MessageItem";
import { createChatSession, fetchChatMessages, saveMessage, updateChatTitle, ChatNamespace } from "../utils/supabase/chat";
import { Message } from "ai";

export default function ChatWindow({ 
  level, 
  weakness, 
  externalChatId, 
  onChatCreated, 
  onChatTitleUpdated,
  onOpenMobileSidebar,
  onMessagesLoaded,
  apiEndpoint,
  subtitle,
  welcomeTitle,
  welcomeMessage,
  inputPlaceholder,
  namespace = "cominh",
  headerName,
  avatarSrc,
}: { 
  level?: string; 
  weakness?: string; 
  externalChatId: string | null; 
  onChatCreated: (id: string) => void; 
  onChatTitleUpdated: () => void;
  onOpenMobileSidebar: () => void;
  onMessagesLoaded?: () => void;
  apiEndpoint?: string;
  subtitle?: string;
  welcomeTitle?: React.ReactNode;
  welcomeMessage?: React.ReactNode;
  inputPlaceholder?: string;
  namespace?: ChatNamespace;
  headerName?: string;
  avatarSrc?: string;
}) {
  const { notification } = App.useApp();
  const { Text } = Typography;

  const renderAvatar = (className?: string, size = 36) =>
    avatarSrc ? (
      <Image src={avatarSrc} alt="AI Avatar" width={size} height={size} className={className} style={{ borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
      <span className={className}>👩‍🏫</span>
    );

  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  // Increments each time historical messages are freshly loaded — used to
  // show a fade-in on the whole batch instead of per-message bounce.
  const [historyRevealKey, setHistoryRevealKey] = useState(0);
  const savedMessageIds = useRef<Set<string>>(new Set());
  const onMessagesLoadedRef = useRef(onMessagesLoaded);
  useEffect(() => { onMessagesLoadedRef.current = onMessagesLoaded; }, [onMessagesLoaded]);

  // Watch externalChatId changes to load history
  useEffect(() => {
    async function loadHistory() {
      if (!externalChatId) {
        setInitialMessages([]);
        savedMessageIds.current.clear();
        onMessagesLoadedRef.current?.();
        return;
      }
      setIsLoadingMessages(true);
      // Silently fetch UI without spinner flash
      const history = await fetchChatMessages(externalChatId, namespace);
      setInitialMessages(history);
      savedMessageIds.current.clear();
      history.forEach(m => savedMessageIds.current.add(m.id));
      setIsLoadingMessages(false);
      setHistoryRevealKey(k => k + 1);
      // Scroll to bottom after history is revealed
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 50);
      onMessagesLoadedRef.current?.();
    }
    loadHistory();
  }, [externalChatId]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: apiEndpoint || "/api/chat",
      id: externalChatId || "default",
      initialMessages,
      body: {
        ...(level ? { level } : {}),
        ...(weakness ? { weakness } : {}),
      },
      onFinish: async (message) => {
        if (externalChatId) {
          await saveMessage(externalChatId, message, namespace);
          savedMessageIds.current.add(message.id);
        }
      },
      onError: (error) => {
        notification.error({
          message: "Lỗi kết nối",
          description: "Có lỗi xảy ra khi trò chuyện với Cô Minh. Trò thử kiểm tra lại mạng xem sao nhé! 😅",
          placement: "topRight",
          duration: 4,
        });
        console.error("Chat error:", error);
      }
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<TextAreaRef>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "auto"
      });
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Focus input when a new chat is selected or created
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [externalChatId]);

  // Sync user messages to Supabase
  useEffect(() => {
    async function syncUserMessage() {
      if (!externalChatId) return;
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.role === "user" && !savedMessageIds.current.has(latestMessage.id)) {
        savedMessageIds.current.add(latestMessage.id);
        await saveMessage(externalChatId, latestMessage, namespace);
      }
    }
    syncUserMessage();
  }, [messages, externalChatId]);

  const onCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading && input.trim()) {
      const isFirstMessage = messages.length === 0 && initialMessages.length === 0;
      const currentInput = input;

      if (!externalChatId) {
        createChatSession(namespace).then(newId => {
          if (newId) {
            onChatCreated(newId);
            updateChatTitle(newId, currentInput.slice(0, 40), namespace).then(() => onChatTitleUpdated());
          }
        });
      } else if (isFirstMessage) {
        // If the chat was created instantly but has no messages, update its title in background
        updateChatTitle(externalChatId, currentInput.slice(0, 40), namespace).then(() => onChatTitleUpdated());
      }
      
      // Call handleSubmit synchronously to eliminate UI lag/double submit
      handleSubmit(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onCustomSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="chat-window" style={{ height: "100%" }}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <Button 
            type="text" 
            icon={<MenuOutlined />} 
            className="chat-mobile-menu-btn"
            onClick={onOpenMobileSidebar}
            style={{ marginRight: 12, color: "var(--text-secondary)" }}
          />
          {renderAvatar("chat-header-avatar", 40)}
          <div>
            <Text className="chat-header-name">{headerName || "Cô Minh"}</Text>
            <div className="chat-header-status">
              <span className="status-dot" />
              <Text className="chat-header-sub">{subtitle || "AI English Teacher"} • Online</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={scrollContainerRef}>
        {isLoadingMessages ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className={`message-row ${i % 2 === 0 ? 'message-row--user' : 'message-row--ai'}`}>
                <div className={`message-avatar ${i % 2 === 0 ? 'message-avatar--user' : 'message-avatar--ai'}`}>
                  {i % 2 === 0 ? '🧑' : renderAvatar('message-avatar--ai')}
                </div>
                <div 
                  className={`message-bubble ${i % 2 === 0 ? 'message-bubble--user' : 'message-bubble--ai'}`}
                  style={{ opacity: 0.4, minWidth: `${60 + i * 20}px`, minHeight: 36, animation: 'pulse 1.5s ease-in-out infinite' }}
                />
              </div>
            ))}
        </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="chat-empty">
                <div className="chat-empty-emoji">{renderAvatar(undefined, 80)}</div>
                <Text className="chat-empty-title">{welcomeTitle || "Chào mừng đến lớp học của Cô Minh!"}</Text>
                <Text className="chat-empty-desc">
                  {welcomeMessage || "Hãy bắt đầu bằng cách nhập một câu tiếng Anh — cô sẽ sửa và giúp bạn luyện tập ngay! 😄"}
                </Text>
              </div>
            )}

            {/* Historical messages: fade the whole batch in at once (no per-row bounce) */}
            {initialMessages.length > 0 && (
              <div key={historyRevealKey} className="chat-history-batch">
                {messages.filter(m => initialMessages.some(im => im.id === m.id)).map((message) => (
                  <MessageItem key={message.id} message={message} avatarSrc={avatarSrc} />
                ))}
              </div>
            )}

            {/* New messages: use the per-row bounce animation */}
            {messages.filter(m => !initialMessages.some(im => im.id === m.id)).map((message) => (
              <MessageItem key={message.id} message={message} avatarSrc={avatarSrc} />
            ))}

            {isLoading && (
              <div className="message-row message-row--ai">
                <div className="message-avatar message-avatar--ai">{renderAvatar(undefined)}</div>
                <div className="message-bubble message-bubble--ai typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onCustomSubmit} className="chat-input-area">
        <div className="chat-input-wrapper">
          <Input.TextArea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder || "Nhập câu tiếng Anh... (Enter gửi, Shift+Enter xuống dòng)"}
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="chat-input"
            disabled={isLoading}
          />
          <Button
            type="primary"
            htmlType="submit"
            icon={<ArrowUpOutlined />}
            disabled={isLoading || !input.trim()}
            className="chat-send-btn"
          />
        </div>
      </form>
    </div>
  );
}
