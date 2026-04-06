"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, Typography, Empty } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  LeftOutlined,
  UndoOutlined,
  AlignLeftOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        opts: Record<string, unknown>
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;

  // Player state
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Transcript state
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(true);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const transcriptListRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Find active transcript index
  let activeIndex = -1;
  for (let i = transcript.length - 1; i >= 0; i--) {
    if (transcript[i].offset <= currentTime) {
      activeIndex = i;
      break;
    }
  }

  // Initialize YouTube IFrame API
  useEffect(() => {
    let destroyed = false;

    const initPlayer = () => {
      if (destroyed || !containerRef.current) return;

      // containerRef is always empty — React renders NO children inside it.
      // The YT API replaces the div with an iframe; using innerHTML here is safe
      // because React has no virtual DOM nodes tracked inside containerRef.
      const playerId = `yt-player-${videoId}`;
      containerRef.current.innerHTML = `<div id="${playerId}"></div>`;

      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          enablejsapi: 1,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            if (destroyed) return;
            setDuration(e.target.getDuration());
            setPlayerReady(true);
          },
          onStateChange: (e: { data: number }) => {
            if (destroyed) return;
            const PLAYING = window.YT?.PlayerState?.PLAYING ?? 1;
            if (e.data === PLAYING) {
              setPlaying(true);
              intervalRef.current = setInterval(() => {
                if (playerRef.current) {
                  const t = playerRef.current.getCurrentTime();
                  setCurrentTime(t);
                  setDuration(playerRef.current.getDuration());
                }
              }, 500);
            } else {
              setPlaying(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      const existing = document.querySelector(
        'script[src*="youtube.com/iframe_api"]'
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    }

    return () => {
      destroyed = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [videoId]);

  // Load transcript
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/youtube/transcript?videoId=${videoId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setTranscriptError(data.error);
        setTranscript(data.items ?? []);
        setTranscriptLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setTranscriptError(e.message);
        setTranscriptLoading(false);
      });
    return () => { cancelled = true; };
  }, [videoId]);

  // Auto-scroll active transcript item
  useEffect(() => {
    if (activeIndex >= 0 && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  // Controls
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [playing]);

  const rewind10 = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(Math.max(0, currentTime - 10), true);
  }, [currentTime]);

  const seekTo = useCallback((offset: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(offset, true);
    playerRef.current.playVideo();
    setCurrentTime(offset);
  }, []);

  const handleSeekBar = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!playerRef.current) return;
      playerRef.current.seekTo(val, true);
      setCurrentTime(val);
    },
    []
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="yt-detail-wrap">
      {/* Header */}
      <header className="yt-detail-header">
        <button className="yt-detail-back" onClick={() => router.back()}>
          <LeftOutlined /> Quay lại
        </button>
        <div className="yt-detail-channel">
          <span className="yt-detail-channel-icon">📺</span>
          <span>Learn English With TV Series</span>
        </div>
      </header>

      {/* Body */}
      <div className="yt-detail-body">
        {/* === LEFT: Player === */}
        <div className="yt-player-panel">
          {/* Wrapper: loading overlay (React) + player container (YT API) are siblings */}
          <div className="yt-player-embed">
            {/* Loading overlay — React owns this, YT API never touches it */}
            {!playerReady && (
              <div className="yt-player-loading">
                <Spin indicator={<LoadingOutlined spin style={{ fontSize: 36, color: "var(--accent)" }} />} />
              </div>
            )}
            {/* YT API target — React renders NO children here, ever */}
            <div ref={containerRef} className="yt-player-container" />
          </div>

          {/* Custom Controls */}
          <div className="yt-controls">
            <button
              className="yt-ctrl-btn"
              onClick={rewind10}
              title="Tua lại 10 giây"
              disabled={!playerReady}
            >
              <UndoOutlined />
            </button>
            <button
              className="yt-ctrl-btn yt-ctrl-play"
              onClick={togglePlay}
              disabled={!playerReady}
            >
              {playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            </button>

            <div className="yt-seekbar-wrap">
              <span className="yt-time-label">{formatTime(currentTime)}</span>
              <div className="yt-seekbar-track">
                <div
                  className="yt-seekbar-progress"
                  style={{ width: `${progress}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  value={currentTime}
                  onChange={handleSeekBar}
                  className="yt-seekbar-input"
                  disabled={!playerReady}
                />
              </div>
              <span className="yt-time-label">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* === RIGHT: Transcript === */}
        <div className="yt-transcript-panel">
          <div className="yt-transcript-header">
            <div className="flex items-center gap-2">
              <AlignLeftOutlined style={{ color: "var(--accent)" }} />
              <Typography.Text strong style={{ color: "var(--text-primary)" }}>
                Record
              </Typography.Text>
            </div>
            {!transcriptLoading && transcript.length > 0 && (
              <span className="yt-transcript-count">
                {transcript.length} dòng
              </span>
            )}
          </div>

          <div className="yt-transcript-list" ref={transcriptListRef}>
            {transcriptLoading && (
              <div className="yt-transcript-loading">
                <Spin
                  indicator={
                    <LoadingOutlined spin style={{ fontSize: 24, color: "var(--accent)" }} />
                  }
                />
                <span>Đang tải transcript...</span>
              </div>
            )}

            {!transcriptLoading && transcriptError && (
              <div className="yt-transcript-empty">
                <Empty
                  description={
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      Transcript không khả dụng
                    </span>
                  }
                />
              </div>
            )}

            {!transcriptLoading &&
              !transcriptError &&
              transcript.map((item, i) => {
                const isActive = i === activeIndex;
                return (
                  <div
                    key={i}
                    ref={isActive ? activeItemRef : null}
                    data-index={i}
                    className={`yt-transcript-item ${isActive ? "yt-transcript-item--active" : ""}`}
                    onClick={() => seekTo(item.offset)}
                  >
                    <span className="yt-transcript-time">
                      {formatTime(item.offset)}
                    </span>
                    <span className="yt-transcript-text">{item.text}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
