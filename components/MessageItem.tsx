"use client";

import { Avatar } from "antd";

interface MessageItemProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system" | "function" | "data" | "tool";
    content: string;
  };
}

function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row--user" : "message-row--ai"}`}>
      {!isUser && (
        <Avatar className="message-avatar message-avatar--ai" size={36}>
          👩‍🏫
        </Avatar>
      )}
      <div className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--ai"}`}>
        <p className="message-text">{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="message-avatar message-avatar--user" size={36}>
          🙋
        </Avatar>
      )}
    </div>
  );
}

export default MessageItem;
