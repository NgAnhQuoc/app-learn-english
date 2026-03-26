"use client";

import React from "react";
import { Card, Tag, Typography, Skeleton, Descriptions, Tooltip } from "antd";
import { SoundOutlined, BookOutlined, BulbOutlined } from "@ant-design/icons";
import type { VocabularyResult } from "../../../api/vocabulary/route";

const { Text, Paragraph } = Typography;

const levelColors: Record<string, string> = {
  "Dễ": "#52c41a",
  "Trung bình": "#fa8c16",
  "Khó": "#ff4d4f",
};
const levelEmoji: Record<string, string> = {
  "Dễ": "🟢",
  "Trung bình": "🟡",
  "Khó": "🔴",
};

function speak(text: string): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

interface VocabResultPanelProps {
  loading: boolean;
  hasSearched: boolean;
  result: VocabularyResult | null;
  onWordClick: (word: string) => void;
}

export default function VocabResultPanel({
  loading,
  hasSearched,
  result,
  onWordClick,
}: VocabResultPanelProps): React.ReactElement {
  return (
    <>
      {loading && (
        <Card className="vocab-card">
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      )}

      {!loading && !result && hasSearched && (
        <div className="vocab-empty">
          <div className="vocab-empty-icon">😅</div>
          <Text style={{ color: "var(--text-muted)" }}>Cô Lành đang xử lý... hoặc từ này lạ quá!</Text>
        </div>
      )}

      {!loading && result && (
        <div className="vocab-result">

          {/* Hero card */}
          <Card className="vocab-hero-card">
            <div className="vocab-hero-top">
              <div className="vocab-hero-left">
                <div className="vocab-word-row">
                  <span className="vocab-word">{result.word}</span>
                  <Tag className="vocab-pos-tag">{result.partOfSpeech}</Tag>
                </div>
                {result.meanings && result.meanings.length > 0 && (
                  <div className="vocab-meanings-group">
                    {result.meanings.map((m, i) => (
                      <div key={i} className="vocab-meaning-row">
                        {result.meanings.length > 1 && (
                          <span className="vocab-meaning-pos">{m.pos}.</span>
                        )}
                        <span className="vocab-meaning-translations">{m.translations.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="vocab-phonetic-row">
                  <span className="vocab-phonetic-label">US</span>
                  <span className="vocab-phonetic">{result.phonetic}</span>
                  <Tooltip title="Nghe phát âm">
                    <button className="vocab-speak-btn" onClick={() => speak(result.word)} aria-label="Phát âm">
                      <SoundOutlined />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className="vocab-level-badge" style={{ borderColor: levelColors[result.level], color: levelColors[result.level] }}>
                {levelEmoji[result.level]} {result.level}
              </div>
            </div>
            <div className="vocab-meaning-block">
              <div className="vocab-meaning-label"><BookOutlined /> Giải thích (theo Cô Lành)</div>
              <div className="vocab-meaning-tabs">
                <span className="vocab-meaning-badge">VI</span>
                <Paragraph className="vocab-meaning-text">{result.meaning}</Paragraph>
              </div>
            </div>
          </Card>

          {/* Example */}
          <Card className="vocab-card vocab-example-card">
            <div className="vocab-card-header"><BulbOutlined /> Ví dụ minh hoạ</div>
            <div className="vocab-example-block">
              <div className="vocab-example-en">
                <span className="vocab-example-badge">EN</span>
                <Text className="vocab-example-text">{result.example}</Text>
                <Tooltip title="Nghe câu ví dụ">
                  <button className="vocab-speak-btn vocab-speak-sm" onClick={() => speak(result.example)} aria-label="Nghe câu">
                    <SoundOutlined />
                  </button>
                </Tooltip>
              </div>
              <div className="vocab-example-vi">
                <span className="vocab-example-badge vocab-example-badge--vi">VI</span>
                <Text className="vocab-example-vi-text">{result.exampleTranslation}</Text>
              </div>
            </div>
          </Card>

          {/* Bottom row */}
          <div className="vocab-bottom-row">
            <Card className="vocab-card vocab-grammar-card">
              <div className="vocab-card-header">📝 Lưu ý ngữ pháp</div>
              <ul className="vocab-grammar-list">
                {result.grammarNotes.map((note, i) => (
                  <li key={i} className="vocab-grammar-item">
                    <span className="vocab-grammar-num">{i + 1}</span>
                    <Text className="vocab-grammar-text">{note}</Text>
                  </li>
                ))}
              </ul>
            </Card>

            {((result.synonyms?.length ?? 0) > 0 || (result.antonyms?.length ?? 0) > 0) && (
              <Card className="vocab-card vocab-syn-card">
                <div className="vocab-card-header">🔄 Từ liên quan</div>
                {result.synonyms && result.synonyms.length > 0 && (
                  <div className="vocab-syn-group">
                    <Text className="vocab-syn-label">Đồng nghĩa</Text>
                    <div className="vocab-tag-row">
                      {result.synonyms.map((s) => (
                        <button key={s} className="vocab-syn-tag" onClick={() => onWordClick(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {result.antonyms && result.antonyms.length > 0 && (
                  <div className="vocab-syn-group">
                    <Text className="vocab-syn-label vocab-ant-label">Trái nghĩa</Text>
                    <div className="vocab-tag-row">
                      {result.antonyms.map((s) => (
                        <button key={s} className="vocab-ant-tag" onClick={() => onWordClick(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Summary */}
          <Card className="vocab-card vocab-summary-card">
            <Descriptions column={2} size="small" items={[
              { key: "word", label: "Từ", children: <strong>{result.word}</strong> },
              { key: "pos", label: "Từ loại", children: result.partOfSpeech },
              { key: "phonetic", label: "Phiên âm", children: result.phonetic },
              { key: "level", label: "Độ khó", children: <Tag color={levelColors[result.level]}>{result.level}</Tag> },
            ]} />
          </Card>
        </div>
      )}
    </>
  );
}
