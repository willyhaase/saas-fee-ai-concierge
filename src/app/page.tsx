"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
};

type ChatResponse = {
  success?: boolean;
  reply?: string;
  conversationId?: string;
  incidentCreated?: boolean;
  incidentId?: string | null;
  priority?: string | null;
  error?: string;
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getVisitorErrorMessage(message: string) {
  if (
    message.includes("Missing Supabase") ||
    message.includes("Missing OPENAI") ||
    message.includes("env vars")
  ) {
    return "The concierge is temporarily unavailable. Please try again later.";
  }

  return message;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello, I am the Saas-Fee AI concierge. Tell me what happened and I will help or notify the team.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = useMemo(
    () => message.trim().length > 0 && !isSending,
    [isSending, message]
  );

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = message.trim();
    if (!text || isSending) {
      return;
    }

    setError(null);
    setIsSending(true);
    setMessage("");

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          customerName: customerName.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined,
          context: {
            source: "website-chat",
          },
        }),
      });

      const responseText = await response.text();
      let data: ChatResponse;

      try {
        data = responseText ? (JSON.parse(responseText) as ChatResponse) : {};
      } catch {
        data = {
          error:
            "The concierge returned an unexpected response. Please try again.",
        };
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || "The concierge is unavailable right now.");
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            data.reply ||
            "Thanks. I captured that and the team will review it shortly.",
          meta: data.incidentCreated
            ? `Incident ${data.incidentId ?? "created"}${
                data.priority ? `, ${data.priority} priority` : ""
              }`
            : data.conversationId
              ? `Conversation ${data.conversationId}`
              : undefined,
        },
      ]);
    } catch (sendError) {
      const errorMessage =
        sendError instanceof Error
          ? sendError.message
          : "The concierge is unavailable right now.";
      const visitorMessage = getVisitorErrorMessage(errorMessage);

      console.error(errorMessage);
      setError(visitorMessage);
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: "I could not send that message. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#1f2421]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#d8d8ce] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#5b6b5f]">
              Saas-Fee
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#151815] sm:text-4xl">
              AI Concierge
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5b6b5f]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2f7d59]" />
            Online
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-h-[66vh] flex-col overflow-hidden rounded-lg border border-[#d8d8ce] bg-white shadow-sm">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex ${
                    item.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 sm:max-w-[76%] ${
                      item.role === "user"
                        ? "bg-[#1f5f46] text-white"
                        : "border border-[#d8d8ce] bg-[#fbfbf7] text-[#1f2421]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {item.content}
                    </p>
                    {item.meta ? (
                      <p className="mt-2 border-t border-current/20 pt-2 text-xs opacity-75">
                        {item.meta}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
              {isSending ? (
                <div className="flex justify-start">
                  <div className="rounded-lg border border-[#d8d8ce] bg-[#fbfbf7] px-4 py-3 text-sm text-[#5b6b5f]">
                    Thinking...
                  </div>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={sendMessage}
              className="border-t border-[#d8d8ce] bg-[#fbfbf7] p-3 sm:p-4"
            >
              {error ? (
                <p className="mb-3 rounded-md border border-[#d56f5b] bg-[#fff5f2] px-3 py-2 text-sm text-[#8c2f20]">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-3">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={2}
                  className="min-h-12 flex-1 resize-none rounded-md border border-[#c8c8bc] bg-white px-3 py-3 text-base text-[#1f2421] outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="h-12 shrink-0 rounded-md bg-[#1f5f46] px-5 text-sm font-semibold text-white transition hover:bg-[#184936] disabled:cursor-not-allowed disabled:bg-[#a9b5ad]"
                >
                  {isSending ? "Sending" : "Send"}
                </button>
              </div>
            </form>
          </div>

          <aside className="rounded-lg border border-[#d8d8ce] bg-white p-4 shadow-sm lg:self-start">
            <h2 className="text-base font-semibold text-[#151815]">
              Guest details
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-[#4f5b52]">Name</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#4f5b52]">
                  Email
                </span>
                <input
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="mt-1 h-11 w-full rounded-md border border-[#c8c8bc] px-3 text-sm outline-none transition focus:border-[#2f7d59] focus:ring-2 focus:ring-[#2f7d59]/20"
                  autoComplete="email"
                  type="email"
                />
              </label>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
