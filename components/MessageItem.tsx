"use client";

import { Avatar } from "antd";
import ReactMarkdown from "react-markdown";

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
        <div className="message-text px-2">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
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
