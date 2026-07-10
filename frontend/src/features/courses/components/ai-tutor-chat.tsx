"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, FileText } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { API_BASE_URL, refreshAccessToken } from "@/lib/api/axios";

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let token = useAuthStore.getState().accessToken;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  } as Record<string, string>;

  let res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    try {
      const newAccessToken = await refreshAccessToken();
      const newHeaders = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newAccessToken}`,
      } as Record<string, string>;
      
      res = await fetch(url, { ...options, headers: newHeaders });
    } catch (refreshErr) {
      console.error("Failed to refresh token in fetchWithAuth:", refreshErr);
    }
  }
  
  return res;
};

interface Citation {
  chunkId?: string;
  chunk_id?: string;
  rank: number;
  score?: number | any;
  quote?: string | null;
  sourceTitle?: string | null;
  source_title?: string | null;
}

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

interface AiTutorChatProps {
  isQuiz: boolean;
  courseId: string;
  lessonId?: string | null;
}

export function CitationBadge({ rank, citation }: { rank: number; citation: Citation }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    tooltipTimeout.current = setTimeout(() => {
      setShowTooltip(false);
    }, 150);
  };

  const quote = citation.quote || "";
  const sourceTitle = citation.sourceTitle || citation.source_title || "Tài liệu học tập";

  return (
    <span className="relative inline-block mx-0.5 align-middle select-none">
      <button
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setShowTooltip(!showTooltip)}
        className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-extrabold rounded-full bg-brand-pink/20 hover:bg-brand-pink/40 text-brand-pink border border-brand-pink/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
      >
        {rank}
      </button>

      {showTooltip && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg border border-border-dark/80 bg-deep-black/95 backdrop-blur-md shadow-2xl transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-dark/65 pb-1.5 mb-1.5">
            <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-brand-pink tracking-wider">
              <FileText size={10} />
              Nguồn [{rank}]
            </span>
          </div>

          {/* Title */}
          <h4 className="text-[11px] font-bold text-cream truncate mb-1">
            {sourceTitle}
          </h4>

          {/* Quote Excerpt */}
          {quote && (
            <p className="text-[10px] text-muted-text leading-relaxed line-clamp-3 bg-surface-input/40 p-1.5 rounded border border-border-dark/30 italic">
              &quot;{quote.length > 150 ? `${quote.substring(0, 150)}...` : quote}&quot;
            </p>
          )}

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-deep-black/95" />
        </div>
      )}
    </span>
  );
}

function renderMessageText(text: string, citations: Citation[] = []) {
  if (!text) return null;
  const paragraphs = text.split("\n\n");
  
  return paragraphs.map((para, pIdx) => {
    const segments = para.split(/(\*\*.*?\*\*|\[\d+\])/g);
    
    return (
      <p key={pIdx} className="mb-2 last:mb-0">
        {segments.map((seg, sIdx) => {
          if (seg.startsWith("**") && seg.endsWith("**")) {
            const innerText = seg.slice(2, -2);
            return (
              <strong key={sIdx} className="font-extrabold text-cream">
                {innerText}
              </strong>
            );
          } else if (/^\[\d+\]$/.test(seg)) {
            const rank = parseInt(seg.slice(1, -1), 10);
            const citation = citations.find((c) => c.rank === rank);
            if (citation) {
              return (
                <CitationBadge
                  key={sIdx}
                  rank={rank}
                  citation={citation}
                />
              );
            }
            return seg;
          } else {
            return seg;
          }
        })}
      </p>
    );
  });
}

export function AiTutorChat({ isQuiz, courseId, lessonId }: AiTutorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [aiPos, setAiPos] = useState({ left: 0, top: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Xin chào! Mình là AI Tutor hỗ trợ học tập của HH Education. Bạn có câu hỏi nào về nội dung bài học hiện tại không?",
      citations: [],
    },
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const typewriterQueue = useRef<string>("");
  const typedTextRef = useRef<string>("");
  const isStreamActiveRef = useRef(false);
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
      }
    };
  }, []);

  const startTypewriter = (messageIndex: number) => {
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
    }
    typewriterQueue.current = "";
    typedTextRef.current = "";

    typewriterIntervalRef.current = setInterval(() => {
      const queueLen = typewriterQueue.current.length;
      if (queueLen === 0) {
        if (!isStreamActiveRef.current) {
          clearInterval(typewriterIntervalRef.current!);
          typewriterIntervalRef.current = null;
          setIsAiTyping(false);
        }
        return;
      }

      // Adaptive speed
      let charsToTake = 1;
      if (queueLen > 100) {
        charsToTake = 4;
      } else if (queueLen > 50) {
        charsToTake = 3;
      } else if (queueLen > 20) {
        charsToTake = 2;
      }

      const chunk = typewriterQueue.current.substring(0, charsToTake);
      typewriterQueue.current = typewriterQueue.current.substring(charsToTake);
      typedTextRef.current += chunk;

      setMessages((prev) => {
        const copy = [...prev];
        const lastMsg = copy[messageIndex];
        if (lastMsg && lastMsg.role === "assistant") {
          lastMsg.content = typedTextRef.current;
        }
        return copy;
      });
    }, 15);
  };

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

  // Load chat session history when the drawer opens, courseId changes, or lessonId changes
  useEffect(() => {
    if (isOpen && courseId) {
      // Clear any running typewriter when switching sessions/lessons/opening drawer
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
      isStreamActiveRef.current = false;
      setIsAiTyping(false);

      const loadHistory = async () => {
        try {
          const lessonParam = lessonId ? `&lessonId=${lessonId}` : '';
          const sessionsRes = await fetchWithAuth(`${API_BASE_URL}/learning/tutor/sessions?courseId=${courseId}${lessonParam}`);
          
          if (!sessionsRes.ok) return;
          const sessionsData = await sessionsRes.json();
          const activeSessions = sessionsData.data || [];
          
          if (activeSessions.length > 0) {
            const activeSession = activeSessions[0];
            setSessionId(activeSession.id);
            
            const detailRes = await fetchWithAuth(`${API_BASE_URL}/learning/tutor/sessions/${activeSession.id}`);
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const history = (detailData.data.messages || []).map((m: any) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
                citations: m.citations || []
              }));
              if (history.length > 0) {
                setMessages(history);
                return;
              }
            }
          }
          
          // Reset if no session or empty messages
          setSessionId(null);
          setMessages([
            {
              role: "assistant",
              content: "Xin chào! Mình là AI Tutor hỗ trợ học tập của HH Education. Bạn có câu hỏi nào về nội dung bài học hiện tại không?",
              citations: [],
            }
          ]);
        } catch (err) {
          console.error("Error loading chat history:", err);
        }
      };
      
      loadHistory();
    }
  }, [isOpen, courseId, lessonId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiTyping) return;

    const userMsg = inputMessage;
    setInputMessage("");

    const targetMsgIndex = messages.length + 1;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      { role: "assistant", content: "", citations: [] }
    ]);
    setIsAiTyping(true);

    try {
      let activeSessionId = sessionId;

      // 1. Create session if it doesn't exist
      if (!activeSessionId) {
        const createSessionRes = await fetchWithAuth(`${API_BASE_URL}/learning/tutor/sessions`, {
          method: "POST",
          body: JSON.stringify({ courseId, lessonId })
        });
        
        if (!createSessionRes.ok) {
          throw new Error("Failed to create chat session");
        }
        
        const sessionData = await createSessionRes.json();
        activeSessionId = sessionData.data.id;
        setSessionId(activeSessionId);
      }

      // 2. Fetch streaming message endpoint
      const streamRes = await fetchWithAuth(`${API_BASE_URL}/learning/tutor/sessions/${activeSessionId}/messages/stream`, {
        method: "POST",
        body: JSON.stringify({
          message: userMsg,
          lessonId: lessonId || null
        })
      });

      if (!streamRes.ok) {
        throw new Error("Failed to start message stream");
      }

      const reader = streamRes.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read stream body");
      }

      isStreamActiveRef.current = true;
      startTypewriter(targetMsgIndex);

      const decoder = new TextDecoder();
      let currentCitations: Citation[] = [];
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer) {
            parseSseBuffer(buffer);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const boundary = buffer.lastIndexOf("\n\n");
        if (boundary !== -1) {
          const completeData = buffer.substring(0, boundary);
          buffer = buffer.substring(boundary + 2);
          parseSseBuffer(completeData);
        }
      }

      function parseSseBuffer(dataText: string) {
        const blocks = dataText.split("\n\n");
        for (const block of blocks) {
          if (!block.trim()) continue;

          const lines = block.split("\n");
          let event = "";
          let data = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              event = line.substring(6).trim();
            } else if (line.startsWith("data:")) {
              data = line.substring(5).trim();
            }
          }

          if (event && data) {
            try {
              const parsed = JSON.parse(data);
              if (event === "citations") {
                currentCitations = parsed;
              } else if (event === "content") {
                typewriterQueue.current += parsed.text;
                setMessages((prev) => {
                  const copy = [...prev];
                  const lastMsg = copy[targetMsgIndex];
                  if (lastMsg && lastMsg.role === "assistant") {
                    lastMsg.citations = currentCitations;
                  }
                  return copy;
                });
              } else if (event === "error") {
                typewriterQueue.current +=
                  "AI Tutor đang gặp sự cố. Vui lòng thử lại sau.";
              }
            } catch (err) {
              console.error("SSE parsing error:", err);
            }
          }
        }
      }

    } catch (err) {
      console.error("Error in AI Chat Tutor stream:", err);
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
      setMessages((prev) => {
        const copy = [...prev];
        const lastMsg = copy[targetMsgIndex];
        if (lastMsg && lastMsg.role === "assistant") {
          lastMsg.content = lastMsg.content
            ? `${lastMsg.content}\n\n[Đã xảy ra lỗi khi kết nối tới AI Tutor. Vui lòng thử lại sau.]`
            : "Đã xảy ra lỗi khi kết nối tới AI Tutor. Vui lòng thử lại sau.";
        }
        return copy;
      });
    } finally {
      isStreamActiveRef.current = false;
      if (!typewriterIntervalRef.current) {
        setIsAiTyping(false);
      }
    }
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
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-cream uppercase tracking-wider">
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
                className={`flex flex-col max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-brand-pink text-brand-dark font-semibold"
                    : "bg-surface-input border border-border-dark text-cream"
                }`}
              >
                <div>
                  {msg.role === "assistant" ? (
                    <>
                      {renderMessageText(msg.content, msg.citations)}
                      {isAiTyping && index === messages.length - 1 && msg.content !== "" && (
                        <span className="inline-block w-1.5 h-3 bg-brand-pink ml-1 animate-pulse align-middle" />
                      )}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isAiTyping && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-center gap-1.5 bg-surface-input border border-border-dark rounded-lg p-3 w-fit text-muted-text text-xs">
                <div className="flex gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-bounce"
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
              className="flex-grow bg-surface-input border border-border-dark rounded-lg px-3 py-2 text-xs text-cream placeholder-muted-text focus:outline-none focus:border-brand-pink/50"
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
