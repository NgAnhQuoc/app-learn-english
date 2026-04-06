"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Skeleton, Empty, Typography, Input, Button, Tag } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CalendarOutlined,
  PlayCircleFilled,
  YoutubeFilled,
  ArrowRightOutlined,
  CloseOutlined,
} from "@ant-design/icons";

interface Video {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  description: string;
  views: number;
}

const DEFAULT_HANDLE = "LearnEnglishWithTVSeries";

const SUGGESTED_CHANNELS = [
  { handle: "LearnEnglishWithTVSeries", label: "TV Series" },
  { handle: "EnglishwithLucy", label: "English with Lucy" },
  { handle: "BBC", label: "BBC" },
  { handle: "TED", label: "TED" },
  { handle: "VOALearningEnglish", label: "VOA Learning" },
];

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function TimelineYoutubePage(): React.ReactElement {
  const router = useRouter();

  // Channel state
  const [channelInput, setChannelInput] = useState("");
  const [activeHandle, setActiveHandle] = useState(DEFAULT_HANDLE);
  const [channelName, setChannelName] = useState("Learn English With TV Series");

  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Title search
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const loadChannel = useCallback((handle: string) => {
    const trimmed = handle.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setVideos([]);
    setSearch("");

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    fetch(`/api/youtube/videos?handle=${encodeURIComponent(trimmed)}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setVideos(data.videos ?? []);
        if (data.channelName) setChannelName(data.channelName);
        setActiveHandle(data.handle ?? handle);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // Load default on mount
  useEffect(() => {
    loadChannel(DEFAULT_HANDLE);
    return () => abortRef.current?.abort();
  }, [loadChannel]);


  const handleChannelSearch = () => {
    const h = channelInput.trim();
    if (!h) return;
    loadChannel(h);
    setChannelInput("");
  };

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="yt-list-wrap">
      {/* ── Header ── */}
      <div className="yt-list-header">
        <div className="yt-list-brand">
          <div className="yt-list-brand-icon">📺</div>
          <div>
            <Typography.Title level={3} className="yt-list-title">
              {channelName}
            </Typography.Title>
            <Typography.Text className="yt-list-subtitle">
              @{activeHandle}
            </Typography.Text>
          </div>
        </div>

        {/* Title filter — only show when videos loaded */}
        {!loading && videos.length > 0 && (
          <Input
            prefix={<SearchOutlined style={{ color: "var(--text-muted)" }} />}
            placeholder="Lọc theo tên video..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="yt-list-search"
            allowClear
          />
        )}
      </div>

      {/* ── Channel Search Bar ── */}
      <div className="yt-channel-search-bar">
        <div className="yt-channel-search-inner">
          <YoutubeFilled className="yt-channel-icon" />
          <Input
            className="yt-channel-input"
            placeholder="Nhập channel URL hoặc @handle... (vd: @BBC, youtube.com/@TED)"
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            onPressEnter={handleChannelSearch}
            allowClear={{ clearIcon: <CloseOutlined style={{ color: "var(--text-muted)" }} /> }}
          />
          <Button
            className="yt-channel-btn"
            onClick={handleChannelSearch}
            disabled={!channelInput.trim() || loading}
            icon={<ArrowRightOutlined />}
          >
            Tìm
          </Button>
        </div>

        {/* Suggested channels */}
        <div className="yt-channel-suggestions">
          <span className="yt-channel-suggestions-label">Gợi ý:</span>
          {SUGGESTED_CHANNELS.map((ch) => (
            <Tag
              key={ch.handle}
              className={`yt-channel-tag ${activeHandle === ch.handle ? "yt-channel-tag--active" : ""}`}
              onClick={() => {
                if (activeHandle !== ch.handle) loadChannel(ch.handle);
              }}
            >
              {ch.label}
            </Tag>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="yt-list-body">
        {loading && (
          <div className="yt-list-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="yt-card yt-card--skeleton">
                <div className="yt-card-thumb-wrap" />
                <div className="yt-card-info">
                  <Skeleton active paragraph={{ rows: 2 }} title={false} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="yt-list-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: "var(--text-secondary)" }}>
                  😕 Không tìm thấy channel: <strong>@{activeHandle}</strong>
                  <br />
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {error}
                  </span>
                </span>
              }
            />
          </div>
        )}

        {!loading && !error && filtered.length === 0 && videos.length > 0 && (
          <div className="yt-list-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: "var(--text-secondary)" }}>
                  Không tìm thấy video &ldquo;{search}&rdquo;
                </span>
              }
            />
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="yt-list-count">{filtered.length} video mới nhất</div>
            <div className="yt-list-grid">
              {filtered.map((video) => (
                <div
                  key={video.id}
                  className={`yt-card ${hovered === video.id ? "yt-card--hovered" : ""}`}
                  onClick={() => router.push(`/timeline-youtube/${video.id}`)}
                  onMouseEnter={() => setHovered(video.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="yt-card-thumb-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="yt-card-thumb"
                      loading="lazy"
                    />
                    <div className="yt-card-play-overlay">
                      <PlayCircleFilled className="yt-card-play-icon" />
                    </div>
                  </div>

                  <div className="yt-card-info">
                    <div className="yt-card-title" title={video.title}>
                      {video.title}
                    </div>
                    <div className="yt-card-meta">
                      {video.views > 0 && (
                        <span>
                          <EyeOutlined /> {formatViews(video.views)}
                        </span>
                      )}
                      {video.published && (
                        <span>
                          <CalendarOutlined /> {formatDate(video.published)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
