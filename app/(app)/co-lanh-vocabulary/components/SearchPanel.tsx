"use client";

import React, { useState, useRef } from "react";
import { Button, Typography } from "antd";
import {
  SearchOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  WarningFilled,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SUGGESTIONS = ["serendipity", "procrastinate", "resilience", "eloquent", "ambiguous", "meticulous"];

interface SearchPanelProps {
  query: string;
  queryError: string;
  loading: boolean;
  hasSearched: boolean;
  history: string[];
  onQueryChange: (val: string) => void;
  onSearch: (word: string) => void;
}

export default function SearchPanel({
  query,
  queryError,
  loading,
  hasSearched,
  history,
  onQueryChange,
  onSearch,
}: SearchPanelProps): React.ReactElement {
  const [localError, setLocalError] = useState("");
  const confirmedRef = useRef(false);

  const handleChange = (val: string) => {
    confirmedRef.current = false;
    onQueryChange(val);
    setLocalError("");
  };

  // Called when user clicks a hint/history tag
  const confirmAndSearch = (word: string) => {
    confirmedRef.current = true;
    setLocalError("");
    onQueryChange(word);
    onSearch(word);
  };

  // Called by Enter / button
  const trySearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    confirmedRef.current = true;
    onSearch(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") trySearch();
  };

  const combinedError = queryError || localError;

  return (
    <div className="vocab-left-inner">
      {/* Hero intro — only shown when not yet searched */}
      {!hasSearched && (
        <div className="vocab-hero-intro">
          <span className="vocab-hero-icon">📖</span>
          <Title level={2} className="vocab-hero-title">Từ điển Cô Lành</Title>
          <Text className="vocab-hero-sub">Nhập từ tiếng Anh — Cô Lành giải thích theo kiểu riêng 🎉</Text>
        </div>
      )}

      {/* Compact header — only shown when searched */}
      {hasSearched && (
        <div className="vocab-panel-header">
          <span className="vocab-logo">📖</span>
          <div>
            <Title level={5} className="vocab-title">Từ điển Cô Lành</Title>
            <Text className="vocab-subtitle">AI giải thích theo cách riêng 😄</Text>
          </div>
        </div>
      )}

      {/* Search input */}
      <div className="vocab-input-group">
        <div className={`vocab-input-wrap${combinedError ? " vocab-input-wrap--error" : ""}`}>
          <SearchOutlined className="vocab-input-prefix" />
          <input
            className="vocab-ac-input"
            placeholder="Nhập từ tiếng Anh..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {combinedError && (
          <div className="vocab-error-alert">
            <WarningFilled className="vocab-error-icon" />
            <span>{combinedError}</span>
          </div>
        )}
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={trySearch}
          className="vocab-search-btn"
          icon={<ThunderboltOutlined />}
          block
        >
          Tra cứu
        </Button>
      </div>

      {/* Tips */}
      <div className="vocab-tips-block">
        <div className="vocab-section-label">Mẹo sử dụng</div>
        <ul className="vocab-tips-list">
          <li>🔤 Chỉ nhập từ tiếng Anh (a–z)</li>
          <li>🔊 Học cách phát âm và cách dùng từ</li>
        </ul>
      </div>

      <div className="vocab-section-label">Gợi ý thử</div>
      <div className="vocab-hints">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="vocab-hint-tag" onClick={() => confirmAndSearch(s)}>
            {s}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <>
          <div className="vocab-section-label mt-4">
            <HistoryOutlined style={{ marginRight: 5 }} />Đã tra gần đây ({history.length}/8)
          </div>
          <div className="vocab-hints">
            {history.map((h) => (
              <button key={h} className="vocab-hint-tag" onClick={() => confirmAndSearch(h)}>
                {h}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
