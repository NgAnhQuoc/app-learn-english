"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button, Typography } from "antd";
import {
  SearchOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  WarningFilled,
  ReadOutlined,
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

// Datamuse autocomplete hook
function useDatamuse(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2 || !/^[a-zA-Z\s'\-]+$/.test(q)) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=8`);
      const data: { word: string }[] = await res.json();
      setSuggestions(data.map((d) => d.word));
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, fetchSuggestions]);

  return { suggestions, clearSuggestions: () => setSuggestions([]) };
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
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { suggestions, clearSuggestions } = useDatamuse(query);
  const visibleSuggestions = showDropdown ? suggestions : [];

  const handleChange = (val: string) => {
    confirmedRef.current = false;
    onQueryChange(val);
    setLocalError("");
    setActiveIdx(-1);
    setShowDropdown(true);
  };

  const confirmAndSearch = (word: string) => {
    confirmedRef.current = true;
    setLocalError("");
    onQueryChange(word);
    onSearch(word);
    clearSuggestions();
    setShowDropdown(false);
    setActiveIdx(-1);
  };

  const trySearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    confirmedRef.current = true;
    onSearch(trimmed);
    clearSuggestions();
    setShowDropdown(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (visibleSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((prev) => (prev < visibleSuggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => (prev > 0 ? prev - 1 : visibleSuggestions.length - 1));
        return;
      }
      if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        confirmAndSearch(visibleSuggestions[activeIdx]);
        return;
      }
      if (e.key === "Escape") {
        setShowDropdown(false);
        setActiveIdx(-1);
        return;
      }
    }
    if (e.key === "Enter") trySearch();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const combinedError = queryError || localError;

  return (
    <div className="vocab-left-inner">
      {!hasSearched && (
        <div className="vocab-hero-intro">
          <span className="vocab-hero-icon">📖</span>
          <Title level={2} className="vocab-hero-title">Từ điển Cô Lành</Title>
          <Text className="vocab-hero-sub">Nhập từ tiếng Anh — Cô Lành giải thích theo kiểu riêng 🎉</Text>
        </div>
      )}

      {hasSearched && (
        <div className="vocab-panel-header">
          <span className="vocab-logo">📖</span>
          <div>
            <Title level={5} className="vocab-title">Từ điển Cô Lành</Title>
            <Text className="vocab-subtitle">AI giải thích theo cách riêng 😄</Text>
          </div>
        </div>
      )}

      <div className="vocab-input-group">
        <div className="vocab-input-autocomplete-wrapper">
          <div className={`vocab-input-wrap${combinedError ? " vocab-input-wrap--error" : ""}`}>
            <SearchOutlined className="vocab-input-prefix" />
            <input
              ref={inputRef}
              className="vocab-ac-input"
              placeholder="Nhập từ tiếng Anh..."
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {visibleSuggestions.length > 0 && (
            <div ref={dropdownRef} className="vocab-suggest-dropdown">
              {visibleSuggestions.map((word, i) => (
                <button
                  key={word}
                  className={`vocab-suggest-item${i === activeIdx ? " vocab-suggest-item--active" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); confirmAndSearch(word); }}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <ReadOutlined className="vocab-suggest-icon" />
                  <span>{word}</span>
                </button>
              ))}
            </div>
          )}
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
