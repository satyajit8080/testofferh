"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { brand } from "@/lib/site";
import { cn } from "@/lib/cn";

type Message = { role: "user" | "assistant"; content: string };

// Served by public/api/chat.php on the same host as the static site.
const endpoint = process.env.NEXT_PUBLIC_CHAT_ENDPOINT ?? "/api/chat.php";
const storageKey = "offerhost-chat";

const greeting: Message = {
  role: "assistant",
  content: `Hi! I'm the ${brand.name} assistant, online 24/7. Ask me about dedicated servers, pricing, ASN & IP services or our locations — or I can connect you with our sales team.`,
};

const suggestions = [
  "Which server fits my workload?",
  "Do you offer DDoS protection?",
  "I need a custom quote",
  "Talk to sales",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the conversation across page navigations within this tab.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending, open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || pending) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setError(null);
    setPending(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      // Give the visitor their message back so they can retry.
      setMessages(messages);
      setInput(content);
    } finally {
      setPending(false);
    }
  };

  const shown = [greeting, ...messages];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={`${brand.name} chat assistant`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass fixed inset-x-3 bottom-20 z-[55] flex max-h-[min(640px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-xl sm:inset-x-auto sm:right-6 sm:w-[380px]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">{brand.name} Assistant</p>
                <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-subtle">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                  ONLINE 24/7 · SALES & SUPPORT
                </p>
              </div>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-md text-fg/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {shown.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <p
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-[14px] leading-relaxed",
                      m.role === "user"
                        ? "bg-brand-500 text-white"
                        : "border border-line bg-ink-850/80 text-fg/90",
                    )}
                  >
                    {m.content}
                  </p>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-line-strong px-3 py-1.5 text-[12.5px] text-fg/80 transition-colors hover:border-brand-400 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {pending && (
                <div className="flex justify-start" aria-label="Assistant is typing">
                  <span className="flex gap-1 rounded-lg border border-line bg-ink-850/80 px-3 py-3">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-blink rounded-full bg-brand-300"
                        style={{ animationDelay: `${d * 0.3}s` }}
                      />
                    ))}
                  </span>
                </div>
              )}
              {error && <p className="text-center text-[12.5px] text-red-300">{error}</p>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 border-t border-line p-3"
            >
              <textarea
                ref={inputRef}
                value={input}
                rows={1}
                maxLength={2000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Type your message…"
                aria-label="Message"
                className="max-h-32 min-h-10 flex-1 resize-none rounded-md border border-line bg-ink-900/70 px-3 py-2 text-[14px] text-fg placeholder:text-subtle focus:border-brand-400 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={pending || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
            <p className="px-4 pb-2 text-center text-[10.5px] text-subtle">
              AI assistant — answers may be imperfect. Our team confirms all orders.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label={open ? "Close chat" : "Chat with us"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[55] grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-white shadow-[0_10px_40px_-8px_rgb(42_109_255/0.7)] transition-colors hover:bg-brand-600 sm:bottom-6 sm:right-6"
      >
        {!open && (
          <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-brand-500/50" aria-hidden />
        )}
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
