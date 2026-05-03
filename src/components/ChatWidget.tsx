"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, ChevronDown } from "lucide-react";

// Rendu du texte : gère les tirets comme listes, le gras **...**, les sauts de ligne
function renderText(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ligne vide → espace vertical léger
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-1" />);
      continue;
    }

    // Ligne de liste (commence par - ou •)
    const isBullet = /^[-•]\s+/.test(line.trim());
    const content = isBullet ? line.trim().replace(/^[-•]\s+/, "") : line;

    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      elements.push(
        <div key={key++} className="flex items-start gap-1.5">
          <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
          <span>{parts}</span>
        </div>
      );
    } else {
      elements.push(<div key={key++}>{parts}</div>);
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Comment postuler à une offre ?",
  "Conseils pour améliorer mon CV",
  "Salaires moyens en RCA",
  "Comment publier une offre ?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setShowSuggestions(true);
    }
  }, [open, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setShowSuggestions(false);

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Erreur réseau");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { text } = JSON.parse(data);
            assistantMessage.content += text;
            setMessages([...newMessages, { ...assistantMessage }]);
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Désolé, une erreur s'est produite. Veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-[360px] max-h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">KTZ Assistant</p>
                <p className="text-orange-100 text-xs">Toujours disponible</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ maxHeight: "360px" }}>
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-orange-500" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[260px]">
                  <p className="text-sm text-gray-700">
                    Bonjour ! Je suis l'assistant KTZ Emploi. Comment puis-je vous aider aujourd'hui ?
                  </p>
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-orange-500" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 max-w-[260px] text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-700 rounded-tl-sm"
                  }`}
                >
                  {msg.content ? renderText(msg.content) : (
                    <span className="flex items-center gap-1 text-gray-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      En train d'écrire…
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3.5 w-3.5 text-orange-500" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && messages.length === 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-3 py-1 hover:bg-orange-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0 border-t border-gray-100 pt-2">
            <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question…"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none max-h-24"
                style={{ minHeight: "24px" }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-1.5">Propulsé par Claude · KTZ Emploi</p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95"
        aria-label="Ouvrir le chat"
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}
