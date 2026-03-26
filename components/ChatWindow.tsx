"use client";

import { useChat } from "ai/react";
import { Button, Input, Typography, App } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import { useEffect, useRef } from "react";
import type { TextAreaRef } from "antd/es/input/TextArea";
import MessageItem from "./MessageItem";

// Moved destructuring into component


export default function ChatWindow({ level, weakness }: { level: string; weakness: string }) {
  const { modal, message: messageApi, notification } = App.useApp();
  const { Text } = Typography;

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ 
      api: "/api/chat",
      body: {
        level,
        weakness,
      },
      onError: (error) => {
        notification.error({
          message: "Lỗi kết nối",
          description: "Có lỗi xảy ra khi trò chuyện với Cô Minh. Trò thử kiểm tra lại mạng hoặc API key xem sao nhé! 😅",
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
        behavior: "smooth"
      });
    }
  }, [messages]);

  // Re-focus input after AI finishes responding
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-header-avatar">👩‍🏫</span>
          <div>
            <Text className="chat-header-name">Cô Minh</Text>
            <div className="chat-header-status">
              <span className="status-dot" />
              <Text className="chat-header-sub">AI English Teacher • Online</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={scrollContainerRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-emoji">👩‍🏫</div>
            <Text className="chat-empty-title">Chào mừng đến lớp học của Cô Minh!</Text>
            <Text className="chat-empty-desc">
              Hãy bắt đầu bằng cách nhập một câu tiếng Anh — cô sẽ sửa và giúp bạn luyện tập ngay! 😄
            </Text>
            <div className="chat-suggestions">
              {[
                "I go to school yesterday",
                "What mean happy?",
                "Tell me about yourself",
              ].map((s) => (
                <button
                  key={s}
                  className="suggestion-chip"
                  onClick={() => {
                    const syntheticEvent = {
                      target: { value: s },
                    } as React.ChangeEvent<HTMLTextAreaElement>;
                    handleInputChange(syntheticEvent);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="message-row message-row--ai">
            <div className="message-avatar message-avatar--ai">👩‍🏫</div>
            <div className="message-bubble message-bubble--ai typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <div className="chat-input-wrapper">
          <Input.TextArea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu tiếng Anh... (Enter gửi, Shift+Enter xuống dòng)"
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
