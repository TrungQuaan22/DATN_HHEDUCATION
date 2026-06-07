"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send } from "lucide-react";

interface AiTutorChatProps {
  isQuiz: boolean;
}

export function AiTutorChat({ isQuiz }: AiTutorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [aiPos, setAiPos] = useState({ left: 0, top: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content:
        "Xin chào! Mình là AI Tutor hỗ trợ học tập của HH Education. Bạn có câu hỏi nào về nội dung bài học hiện tại không?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAiPos({
        left: window.innerWidth - 80,
        top: window.innerHeight - 100,
      });
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiTyping]);

  useEffect(() => {
    if (isQuiz && isOpen) {
      setIsOpen(false);
    }
  }, [isQuiz, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiTyping) return;

    const userMsg = inputMessage;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInputMessage("");
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponse =
        "Hệ thống AI Tutor đang sử dụng cơ chế thử nghiệm ở Phase 1. Khi kết nối API RAG thật ở Phase 3, mình sẽ giải đáp chi tiết câu hỏi này dựa trên tài liệu bài học chính xác nhé!";
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes("tích phân") || lowerMsg.includes("tich phan")) {
        aiResponse =
          "Tích phân là phép toán ngược của đạo hàm, giúp chúng ta tính toán diện tích dưới đường cong bằng phương pháp giới hạn tổng Riemann.";
      } else if (
        lowerMsg.includes("xin chào") ||
        lowerMsg.includes("hello") ||
        lowerMsg.includes("hi")
      ) {
        aiResponse = "Xin chào! Mình có thể giúp gì cho bạn hôm nay?";
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
      setIsAiTyping(false);
    }, 1200);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    dragStart.current = { x: e.clientX - aiPos.left, y: e.clientY - aiPos.top };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    isDragging.current = true;
    const newLeft = e.clientX - dragStart.current.x;
    const newTop = e.clientY - dragStart.current.y;

    const maxLeft = window.innerWidth - 64;
    const maxTop = window.innerHeight - 64;

    setAiPos({
      left: Math.max(16, Math.min(newLeft, maxLeft)),
      top: Math.max(16, Math.min(newTop, maxTop)),
    });
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleAiClick = () => {
    if (!isDragging.current) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <aside
        className={`learning-sidebar-shell relative h-full shrink-0 overflow-hidden ${
          isOpen ? "w-[320px]" : "w-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div
          className={`learning-slide-panel absolute right-0 top-0 h-full w-[320px] border-l border-border-dark/60 bg-deep-black flex flex-col shrink-0 shadow-2xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* AI Header */}
          <div className="p-4 border-b border-border-dark bg-off-black flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-cream uppercase tracking-wider">
              <Sparkles size={14} className="text-brand-pink animate-pulse" />
              <span>AI Tutor Chat</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-muted-text hover:text-red-400 hover:bg-surface-input transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Message Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] rounded-lg p-3 text-[12px] leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-brand-pink text-brand-dark font-semibold"
                    : "bg-surface-input border border-border-dark text-cream"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex items-center gap-1.5 bg-surface-input border border-border-dark rounded-lg p-3 w-fit text-muted-text text-[11px]">
                <div className="flex gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span>AI Tutor đang suy nghĩ...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-border-dark/60 bg-off-black flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Hỏi AI về bài học..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isQuiz}
              className="flex-grow bg-surface-input border border-border-dark rounded-lg px-3 py-2 text-[12px] text-cream placeholder-muted-text focus:outline-none focus:border-brand-pink/50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isAiTyping || isQuiz}
              className="p-2 rounded-lg bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </aside>

      {/* Floating Draggable AI Tutor Button */}
      {!isQuiz && !isOpen && (
        <button
          onMouseDown={handleMouseDown}
          onClick={handleAiClick}
          style={{
            position: "fixed",
            left: `${aiPos.left}px`,
            top: `${aiPos.top}px`,
            cursor: "grab",
          }}
          className="w-12 h-12 rounded-full bg-brand-pink text-brand-dark flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 active:cursor-grabbing border border-brand-pink/30 hover:shadow-brand-pink/20 transition-all z-50 group"
          title="Hỏi AI Tutor"
        >
          <Sparkles
            size={20}
            className="group-hover:rotate-12 transition-transform"
          />
        </button>
      )}
    </>
  );
}
