import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import brandIcon from "@/assets/icon-white.png";

const transport = new DefaultChatTransport({ api: "/api/public/chat" });
const suggestions = ["Find a home in Noida", "Compare commercial properties", "What is carpet area?"];

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    if (open) textarea.current?.focus();
  }, [open, status]);

  function send(text: string) {
    if (busy || !text.trim()) return;
    clearError();
    setInput("");
    void sendMessage({ text: text.trim() });
    textarea.current?.focus();
  }

  return <>
    {!open && <Button size="icon" onClick={() => setOpen(true)} aria-label="Ask Oceans & Earth — AI assistant" title="Ask Oceans & Earth" className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-soft"><MessageCircle className="h-6 w-6" /></Button>}
    {open && <div role="dialog" aria-label="Ask Oceans & Earth" onKeyDown={e => { if (e.key === "Escape") setOpen(false); }} className="fixed bottom-24 left-4 right-4 z-50 flex h-[min(36rem,calc(100dvh-8rem))] min-h-0 flex-col overflow-hidden rounded-md border bg-card text-card-foreground shadow-soft sm:left-auto sm:right-6 sm:w-[25rem]">
      <div className="flex shrink-0 items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <img src={brandIcon} alt="" className="h-9 w-9 object-contain" />
        <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Ask Oceans & Earth</p><p className="text-xs opacity-80">Property assistant</p></div>
        <Button size="icon" variant="ghost" disabled={busy} aria-label="New chat" title="New chat" onClick={() => { setMessages([]); clearError(); textarea.current?.focus(); }} className="shrink-0 text-primary-foreground"><RotateCcw /></Button>
        <Button size="icon" variant="ghost" aria-label="Close chat" title="Close chat" onClick={() => setOpen(false)} className="shrink-0 text-primary-foreground"><X /></Button>
      </div>
      <Conversation className="min-h-0 flex-1" aria-live="polite">
        <ConversationContent className="gap-5 p-4">
          {messages.length === 0 && <Message from="assistant"><MessageContent><MessageResponse>{"Hello! What kind of property are you looking for? Tell me your preferred location and budget."}</MessageResponse><div className="mt-3 flex flex-col items-start gap-2">{suggestions.map(s => <Button key={s} variant="outline" size="sm" onClick={() => send(s)} className="h-auto whitespace-normal text-left">{s}</Button>)}</div></MessageContent></Message>}
          {messages.map((m, index) => <Message key={m.id} from={m.role}><MessageContent className={m.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground" : "w-full"}>
            {m.parts.map((part, i) => part.type === "text" ? <MessageResponse key={i} isAnimating={busy && index === messages.length - 1} className="break-words [&_a]:underline">{part.text}</MessageResponse> : part.type === "reasoning" ? <Reasoning key={i} defaultOpen={false} isStreaming={busy && index === messages.length - 1}><ReasoningTrigger /><ReasoningContent>{part.text}</ReasoningContent></Reasoning> : null)}
          </MessageContent></Message>)}
          {busy && !messages.at(-1)?.parts.some(p => p.type === "text" && p.text) && <Shimmer className="text-sm">Thinking…</Shimmer>}
          {error && <p role="alert" className="break-words text-sm text-destructive">{error.message}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="shrink-0 border-t p-3">
        <PromptInput onSubmit={({ text }) => send(text)}>
          <PromptInputTextarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} aria-label="Type your question" placeholder="Ask about properties or buying…" maxLength={5000} className="min-h-16 max-h-32" />
          <PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={() => void stop()} disabled={!busy && !input.trim()} aria-label={busy ? "Stop response" : "Send message"} /></PromptInputFooter>
        </PromptInput>
      </div>
    </div>}
  </>;
}
