"use client";

import React, { useState, useCallback, useRef } from "react";
import { AutoComplete, Button, Typography } from "antd";
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
  const [suggestions, setSuggestions] = useState<{ value: string }[]>([]);
  const [localError, setLocalError] = useState("");
  // Track whether the current query was confirmed via dropdown or hint click
  const confirmedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEnglishOnly = (text: string) => /^[a-zA-Z\s'\-]+$/.test(text.trim());

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2 || !isEnglishOnly(q)) { setSuggestions([]); return; }
    try {
      const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(q)}*&max=8`);
      const data: { word: string }[] = await res.json();
      setSuggestions(data.map((d) => ({ value: d.word })));
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleChange = (val: string) => {
    confirmedRef.current = false; // user is typing again → unconfirm
    onQueryChange(val);
    setLocalError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  // Called only when user selects from dropdown or clicks a hint/history tag
  const confirmAndSearch = (word: string) => {
    confirmedRef.current = true;
    setLocalError("");
    setSuggestions([]);
    onQueryChange(word);
    onSearch(word);
  };

  // Called by Enter / button — validate before searching
  const trySearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Already confirmed via dropdown or hint
    if (confirmedRef.current) {
      onSearch(trimmed);
      return;
    }

    // Manually typed: only allow if exact match in suggestions OR no suggestions (complete word)
    const exactMatch = suggestions.some(
      (s) => s.value.toLowerCase() === trimmed.toLowerCase()
    );

    if (exactMatch || suggestions.length === 0) {
      confirmedRef.current = true;
      onSearch(trimmed);
    } else {
      setLocalError("Chọn từ gợi ý bên dưới hoặc nhập đầy đủ từ nhé! 👇");
    }
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

      {/* Search input with autocomplete */}
      <div className="vocab-input-group">
        <AutoComplete
          options={suggestions}
          value={query}
          onChange={handleChange}
          onSelect={(val: string) => confirmAndSearch(val)}
          style={{ width: "100%" }}
          classNames={{ popup: { root: "vocab-autocomplete-dropdown" } }}
          filterOption={false}
        >
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
        </AutoComplete>
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
          <div className="vocab-section-label" style={{ marginTop: 16 }}>
            <HistoryOutlined style={{ marginRight: 5 }} />Đã tra gần đây
          </div>
          <div className="vocab-history">
            {history.map((h) => (
              <button key={h} className="vocab-history-item" onClick={() => confirmAndSearch(h)}>
                {h}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
