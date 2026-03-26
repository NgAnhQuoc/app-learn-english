"use client";

import React, { useState } from "react";
import { message } from "antd";
import type { VocabularyResult } from "../../api/vocabulary/route";
import SearchPanel from "./components/SearchPanel";
import VocabResultPanel from "./components/VocabResultPanel";

const isEnglishOnly = (text: string) => /^[a-zA-Z\s'\-]+$/.test(text.trim());

export default function CoLanhVocabularyPage(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [queryError, setQueryError] = useState("");
  const [result, setResult] = useState<VocabularyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const doSearch = async (word: string) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    if (!isEnglishOnly(trimmed)) {
      setQueryError("Chỉ nhập từ tiếng Anh nhé!");
      return;
    }
    setQueryError("");
    setHasSearched(true);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lỗi không xác định");
      setResult(data as VocabularyResult);
      setHistory((prev) => [trimmed, ...prev.filter((h) => h !== trimmed)].slice(0, 8));
    } catch (err: unknown) {
      messageApi.error(err instanceof Error ? err.message : "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = (word: string) => {
    setQuery(word);
    doSearch(word);
  };

  return (
    <div className="vocab-split-page">
      {contextHolder}
      <div className={`vocab-content-wrap${hasSearched ? " vocab-content-wrap--searched" : ""}`}>

        {/* ── LEFT PANEL ── */}
        <aside className={`vocab-left-panel${hasSearched ? " vocab-left-panel--compact" : ""}`}>
          <SearchPanel
            query={query}
            queryError={queryError}
            loading={loading}
            hasSearched={hasSearched}
            history={history}
            onQueryChange={(val) => { setQuery(val); if (queryError) setQueryError(""); }}
            onSearch={doSearch}
          />
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className={`vocab-right-panel${hasSearched ? " vocab-right-panel--visible" : ""}`}>
          <VocabResultPanel
            loading={loading}
            hasSearched={hasSearched}
            result={result}
            onWordClick={handleWordClick}
          />
        </main>

      </div>
    </div>
  );
}
