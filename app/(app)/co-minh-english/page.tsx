"use client";

import React, { useState, useEffect } from "react";
import ChatWindow from "../../../components/ChatWindow";

export default function CoMinhEnglishPage(): React.ReactElement {
  const [level, setLevel] = useState("A2 (Pre-Intermediate)");
  const [weakness, setWeakness] = useState("");

  useEffect(() => {
    const savedLevel = localStorage.getItem("co_minh_level");
    const savedWeakness = localStorage.getItem("co_minh_weakness");
    setTimeout(() => {
      if (savedLevel) setLevel(savedLevel);
      if (savedWeakness) setWeakness(savedWeakness);
    }, 0);
  }, []);

  // Keep in sync when sidebar changes (via storage event)
  useEffect(() => {
    const onStorage = () => {
      const l = localStorage.getItem("co_minh_level");
      const w = localStorage.getItem("co_minh_weakness");
      if (l) setLevel(l);
      if (w !== null) setWeakness(w);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <ChatWindow level={level} weakness={weakness} />;
}
