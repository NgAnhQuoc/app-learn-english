"use client";

import React from "react";
import { Avatar } from "antd";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getToolDisplayName, getToolIcon } from "@/utils/toolNames";

interface ToolInvocation {
  state: "call" | "partial-call" | "result";
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
  result?: unknown;
}

interface MessageItemProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system" | "function" | "data" | "tool";
    content: string;
    toolInvocations?: ToolInvocation[];
  };
  avatarSrc?: string;
}

function ToolStep({ tool }: { tool: ToolInvocation }) {
  const [open, setOpen] = React.useState(false);
  const isDone = tool.state === "result";

  // Smart display: if result has sent_to_discord, swap panels
  const result = tool.result as Record<string, unknown> | undefined;
  const hasSentContent = isDone && result && "sent_to_discord" in result;

  const inputContent = hasSentContent
    ? JSON.stringify(result!.sent_to_discord, null, 2).replace(/\\n/g, '\n')
    : JSON.stringify(tool.args, null, 2).replace(/\\n/g, '\n');

  const outputContent = hasSentContent
    ? JSON.stringify(result!.status, null, 2).replace(/\\n/g, '\n')
    : isDone ? JSON.stringify(tool.result, null, 2).replace(/\\n/g, '\n') : null;

  return (
    <div className="tool-step-anim tool-call-card">
      {/* Header / Summary row */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="tool-call-header"
      >
        {/* Status dot */}
        <span className={`tool-call-dot ${isDone ? "tool-call-dot--done" : "tool-call-dot--pending"}`} />
        {/* Tool name */}
        <span className="tool-call-name">
          {getToolIcon(tool.toolName)} {getToolDisplayName(tool.toolName)}
        </span>
        {!isDone && (
          <span className="text-[10px] text-yellow-400/60 animate-pulse">●●●</span>
        )}
        {/* Chevron */}
        <svg
          className={`tool-call-chevron ${open ? "tool-call-chevron--open" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body — input/output panels */}
      {open && (
        <div className="tool-call-body">
          {/* INPUT */}
          <div className="tool-io-section">
            <div className="tool-io-label tool-io-label--input">│ INPUT</div>
            <pre className="tool-io-code">
              {inputContent}
            </pre>
          </div>

          {/* OUTPUT */}
          {isDone && outputContent && (
            <div className="tool-io-section">
              <div className="tool-io-label tool-io-label--output">│ OUTPUT</div>
              <pre className="tool-io-code tool-io-code--output">
                {outputContent}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageItem({ message, avatarSrc }: MessageItemProps) {
  const isUser = message.role === "user";
  const hasContent = message.content && message.content.trim() !== "";
  const hasTools = message.toolInvocations && message.toolInvocations.length > 0;

  if (!hasContent && !hasTools) return null;

  const renderAvatar = () =>
    avatarSrc ? (
      <Image src={avatarSrc} alt="AI" width={36} height={36}
        className="message-avatar message-avatar--ai"
        style={{ borderRadius: "50%", objectFit: "cover" }} />
    ) : (
      <Avatar className="message-avatar message-avatar--ai" size={36}>👩‍🏫</Avatar>
    );

  return (
    <div className={`message-row ${isUser ? "message-row--user" : "message-row--ai"}`}>
      {!isUser && renderAvatar()}

      {!isUser && hasTools ? (
        <div className="flex flex-col gap-1.5 min-w-0" style={{ maxWidth: "calc(100% - 46px)" }}>
          {/* Compact tool steps */}
          <div className="flex flex-col gap-0.5">
            {message.toolInvocations!.map(tool => (
              <ToolStep key={tool.toolCallId} tool={tool} />
            ))}
          </div>
          {/* AI response bubble */}
          {hasContent && (
            <div className="message-bubble message-bubble--ai">
              <div className="message-text px-2 markdown-message">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ) : (
        hasContent && (
          <div className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--ai"}`}>
            <div className="message-text px-2 markdown-message">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          </div>
        )
      )}

      {isUser && (
        <Avatar className="message-avatar message-avatar--user" size={36}>🙋</Avatar>
      )}
    </div>
  );
}

export default MessageItem;
