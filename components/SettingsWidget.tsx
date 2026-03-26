"use client";

import React, { useState } from "react";
import { Select, Input, Typography } from "antd";
import { SettingOutlined, CloseOutlined, TrophyOutlined, WarningOutlined } from "@ant-design/icons";

const { Text } = Typography;

const LEVELS = [
  { value: "A1 (Beginner)", label: "A1 (Beginner)" },
  { value: "A2 (Pre-Intermediate)", label: "A2 (Pre-Intermediate)" },
  { value: "B1 (Intermediate)", label: "B1 (Intermediate)" },
  { value: "B2 (Upper-Intermediate)", label: "B2 (Upper-Intermediate)" },
  { value: "C1 (Advanced)", label: "C1 (Advanced)" },
];

interface SettingsWidgetProps {
  level: string;
  weakness: string;
  onLevelChange: (val: string) => void;
  onWeaknessChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SettingsWidget({
  level,
  weakness,
  onLevelChange,
  onWeaknessChange,
}: SettingsWidgetProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="settings-widget">
      {/* Floating panel */}
      {open && (
        <div className="settings-panel">
          <div className="settings-panel-header">
            <span className="settings-panel-title">⚙️ Cài đặt học tập</span>
            <button className="settings-close-btn" onClick={() => setOpen(false)} aria-label="Đóng">
              <CloseOutlined />
            </button>
          </div>

          <div className="settings-panel-body">
            <div className="settings-field">
              <Text className="settings-field-label">
                <TrophyOutlined style={{ marginRight: 6 }} />Trình độ hiện tại
              </Text>
              <Select
                value={level}
                onChange={onLevelChange}
                style={{ width: "100%" }}
                options={LEVELS}
                className="settings-select"
              />
            </div>

            <div className="settings-field">
              <Text className="settings-field-label">
                <WarningOutlined style={{ marginRight: 6 }} />Điểm yếu cần khắc phục
              </Text>
              <Input
                placeholder="Ví dụ: Phát âm, ngữ pháp..."
                value={weakness}
                onChange={onWeaknessChange}
                className="settings-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        className={`settings-fab${open ? " settings-fab--active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở cài đặt"
      >
        <SettingOutlined className="settings-fab-icon" />
      </button>
    </div>
  );
}
