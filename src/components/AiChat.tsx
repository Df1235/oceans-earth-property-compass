import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { askFaq } from "@/lib/faq.functions";
import { faqFallback } from "@/lib/faq";

type Message = { id: number; from: "bot" | "user"; text: string };

const ASSISTANT_NAME = "Ask Oceans & Earth";
const GREETING =
  "Hi! I'm the Oceans & Earth assistant. Ask me about areas we cover, property types, site visits, home loans and more.";
const SUGGESTIONS = [
  "Which areas do you cover?",
  "Book a site visit",
  "Do you help with home loans?",
  "RERA details",
  "How do I get started?",
];

let nextId = 0;
const makeId = () => ++nextId;

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: makeId(), from: "bot", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const ask = useServerFn(askFaq);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, typing]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;
    busyRef.current = true;
    setShowSuggestions(false);
    setMessages((m) => [...m, { id: makeId(), from: "user", text: trimmed }]);
    setInput("");
    setTyping(true);
    // Artificial thinking delay so replies feel conversational (respects reduced motion via CSS only).
    const delay = 500 + Math.floor(Math.random() * 400);
    try {
      const [reply] = await Promise.all([
        ask({ data: { message: trimmed } }),
        new Promise((r) => setTimeout(r, delay)),
      ]);
      setMessages((m) => [...m, { id: makeId(), from: "bot", text: reply.answer }]);
    } catch {
      setMessages((m) => [...m, { id: makeId(), from: "bot", text: faqFallback() }]);
    } finally {
      setTyping(false);
      busyRef.current = false;
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask Oceans & Earth — AI assistant"
          className="fixed bottom-24 right-6 z-50 flex items-center justify-center rounded-full bg-primary p-4 text-primary-foreground shadow-soft transition-transform hover:scale-105 motion-reduce:transition-none"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={ASSISTANT_NAME}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          className="fixed bottom-24 right-4 left-4 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-md border bg-card text-card-foreground shadow-soft sm:left-auto sm:right-6 sm:w-[min(22rem,calc(100vw-3rem))]"
        >
          <div className="flex items-center justify-between gap-3 border-b bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div>
                <p className="eyebrow opacity-80">AI assistant</p>
                <p className="text-sm font-semibold leading-tight">{ASSISTANT_NAME}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-sm p-1 transition-opacity hover:opacity-70 motion-reduce:transition-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.from === "user"
                    ? "ml-auto max-w-[85%] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[85%] rounded-md bg-muted px-3 py-2 text-sm text-foreground"
                }
              >
                {m.text}
              </div>
            ))}

            {typing && (
              <div
                className="mr-auto flex max-w-[85%] items-center gap-1 rounded-md bg-muted px-3 py-2"
                aria-label="Assistant is typing"
              >
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s] motion-reduce:animate-none" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s] motion-reduce:animate-none" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none" />
              </div>
            )}

            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void sendMessage(s)}
                    className="eyebrow rounded-full border px-3 py-1 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground motion-reduce:transition-none"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t px-3 py-3">
            <Label htmlFor="ai-chat-input" className="sr-only">
              Type your question
            </Label>
            <Input
              id="ai-chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              autoComplete="off"
            />
            <Button type="submit" size="icon" aria-label="Send message" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
