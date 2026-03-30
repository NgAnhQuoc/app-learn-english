"use client";

import React, { useState } from "react";
import { Card, Tag, Typography, Skeleton, Descriptions, Tooltip } from "antd";
import { SoundOutlined, BookOutlined, BulbOutlined } from "@ant-design/icons";
import type { VocabularyResult } from "../../../api/vocabulary/route";

const { Title, Text, Paragraph } = Typography;

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

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const enVoices = voices.filter((v) => v.lang.startsWith("en"));
    const maleKeywords = [ "david", "daniel", "alex", "fred", "ralph"];
    const maleVoice = enVoices.find((v) =>
      maleKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );
    if (maleVoice) utt.voice = maleVoice;
    window.speechSynthesis.speak(utt);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", setVoice, { once: true });
  } else {
    setVoice();
  }
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
  const [meaningLang, setMeaningLang] = useState<"vi" | "en">("vi");

  return (
    <>
      {loading && (
        <div className="vocab-result">

          {/* Hero card skeleton */}
          <Card className="vocab-hero-card">
            <div className="vocab-hero-top">
              <div className="vocab-hero-left" style={{ flex: 1 }}>
                <div className="vocab-word-row">
                  <Skeleton.Input active style={{ width: 180, height: 36, borderRadius: 8 }} />
                  <Skeleton.Button active style={{ width: 70, height: 22, borderRadius: 6 }} />
                </div>
                <Skeleton.Input active style={{ width: 240, height: 18, marginTop: 8, borderRadius: 6 }} />
                <div className="vocab-phonetic-row" style={{ marginTop: 10 }}>
                  <Skeleton.Button active style={{ width: 30, height: 20, borderRadius: 4 }} />
                  <Skeleton.Input active style={{ width: 110, height: 20, borderRadius: 4 }} />
                </div>
              </div>
              <Skeleton.Button active style={{ width: 64, height: 30, borderRadius: 20 }} />
            </div>
            <div className="vocab-meaning-block" style={{ marginTop: 16 }}>
              <Skeleton.Input active style={{ width: "100%", height: 52, borderRadius: 8 }} />
            </div>
          </Card>

          {/* Example card skeleton */}
          <Card className="vocab-card vocab-example-card">
            <div className="vocab-card-header">
              <Skeleton.Input active style={{ width: 140, height: 16, borderRadius: 4 }} />
            </div>
            <div className="vocab-example-block">
              {[1, 2].map((i) => (
                <div key={i} className="vocab-example-item">
                  <Skeleton.Avatar active size="small" shape="circle" style={{ width: 28, height: 28 }} />
                  <div className="vocab-example-content" style={{ flex: 1 }}>
                    <Skeleton.Input active style={{ width: "90%", height: 18, borderRadius: 4 }} />
                    <Skeleton.Input active style={{ width: "70%", height: 14, marginTop: 6, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Bottom row skeleton */}
          <div className="vocab-bottom-row">
            <Card className="vocab-card vocab-grammar-card">
              <div className="vocab-card-header">
                <Skeleton.Input active style={{ width: 120, height: 16, borderRadius: 4 }} />
              </div>
              <ul className="vocab-grammar-list" style={{ listStyle: "none", padding: 0 }}>
                {[1, 2, 3].map((i) => (
                  <li key={i} className="vocab-grammar-item">
                    <Skeleton.Avatar active size="small" shape="circle" style={{ width: 22, height: 22 }} />
                    <Skeleton.Input active style={{ width: "85%", height: 14, borderRadius: 4 }} />
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="vocab-card vocab-syn-card">
              <div className="vocab-card-header">
                <Skeleton.Input active style={{ width: 100, height: 16, borderRadius: 4 }} />
              </div>
              <div className="vocab-syn-group">
                <Skeleton.Input active style={{ width: 60, height: 12, borderRadius: 4, marginBottom: 8 }} />
                <div className="vocab-tag-row">
                  {[80, 60, 90].map((w, i) => (
                    <Skeleton.Button key={i} active style={{ width: w, height: 24, borderRadius: 12 }} />
                  ))}
                </div>
              </div>
              <div className="vocab-syn-group" style={{ marginTop: 12 }}>
                <Skeleton.Input active style={{ width: 60, height: 12, borderRadius: 4, marginBottom: 8 }} />
                <div className="vocab-tag-row">
                  {[75, 85].map((w, i) => (
                    <Skeleton.Button key={i} active style={{ width: w, height: 24, borderRadius: 12 }} />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Summary card skeleton */}
          <Card className="vocab-card vocab-summary-card">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {[140, 100, 130, 80].map((w, i) => (
                <Skeleton.Input key={i} active style={{ width: w, height: 16, borderRadius: 4 }} />
              ))}
            </div>
          </Card>

        </div>
      )}


      {!loading && (!result || !result.found) && hasSearched && (
        <div className="vocab-not-found">
          <div className="vocab-not-found-icon">🔍</div>
          <Title level={4} className="vocab-not-found-title">Không tìm thấy kết quả</Title>
          <Text className="vocab-not-found-desc whitespace-nowrap">
            Vui lòng kiểm tra lại từ vựng bạn đã nhập
          </Text>
          <div className="vocab-not-found-tips">
            <span>✓ Chỉ nhập từ tiếng Anh</span>
            <span>✓ Kiểm tra chính tả</span>
            <span>✓ Thử từ đơn giản hơn</span>
          </div>
        </div>
      )}


      {!loading && result?.found && (
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
                    {(result.meanings || []).map((m, i) => (
                      <div key={i} className="vocab-meaning-row">
                        {(result.meanings || []).length > 1 && (
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
                    <button className="vocab-speak-btn" onClick={() => speak(result.word || "")} aria-label="Phát âm">
                      <SoundOutlined />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className="vocab-level-badge" style={{ borderColor: levelColors[result.level || "Dễ"], color: levelColors[result.level || "Dễ"] }}>
                {levelEmoji[result.level || "Dễ"]} {result.level}
              </div>
            </div>
            <div className="vocab-meaning-block">
              <div className="vocab-meaning-label justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOutlined /> Giải thích (theo Cô Lành)
                </span>
                <div className="vocab-lang-toggle">
                  <button
                    className={`vocab-lang-btn${meaningLang === "vi" ? " active" : ""}`}
                    onClick={() => setMeaningLang("vi")}
                  >VI</button>
                  <button
                    className={`vocab-lang-btn${meaningLang === "en" ? " active" : ""}`}
                    onClick={() => setMeaningLang("en")}
                  >EN</button>
                </div>
              </div>
              <div className="vocab-meaning-tabs">
                <Paragraph className="vocab-meaning-text">
                  {meaningLang === "vi" ? result.meaning : result.meaningEn}
                </Paragraph>
              </div>
            </div>
          </Card>

          {/* Example */}
          <Card className="vocab-card vocab-example-card">
            <div className="vocab-card-header"><BulbOutlined /> Ví dụ minh hoạ</div>
            <div className="vocab-example-block">
              {(result.examples || []).map((ex, i) => (
                <div key={i} className="vocab-example-item">
                  {/* Number badge */}
                  <span className="vocab-example-num">{i + 1}</span>
                  <div className="vocab-example-content">
                    {/* EN row */}
                    <div className="flex items-start gap-2">
                      <Text className="vocab-example-text flex-1">{ex.sentence}</Text>
                      <Tooltip title="Nghe câu ví dụ">
                        <button className="vocab-speak-btn vocab-speak-sm" onClick={() => speak(ex.sentence)} aria-label="Nghe câu">
                          <SoundOutlined />
                        </button>
                      </Tooltip>
                    </div>
                    {/* VI row */}
                    <Text className="vocab-example-vi-text mt-1 block">
                      {ex.translation}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Bottom row */}
          <div className="vocab-bottom-row">
            <Card className="vocab-card vocab-grammar-card">
              <div className="vocab-card-header">📝 Lưu ý ngữ pháp</div>
              <ul className="vocab-grammar-list">
                {(result.grammarNotes || []).map((note, i) => (
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
              { key: "level", label: "Độ khó", children: <Tag color={levelColors[result.level || "Dễ"]}>{result.level}</Tag> },
            ]} />
          </Card>
        </div>
      )}
    </>
  );
}
