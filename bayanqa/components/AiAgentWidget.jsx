import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { detectServiceFromText, saveChatFeedback, saveSurveyFeedback } from "@/utils/feedback";

function inferConversationService(messages, currentText) {
  const directService = detectServiceFromText(currentText);
  if (directService !== "Document") {
    return directService;
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.sender !== "user") continue;

    const inferredFromHistory = detectServiceFromText(message.text);
    if (inferredFromHistory !== "Document") {
      return inferredFromHistory;
    }
  }

  return "Document";
}

export default function AiAgentWidget() {
  const router = useRouter();
  const { isChatOpen, setIsChatOpen } = useChat();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I'm Bayan QA Assistant. How can I help you today?",
      collectFeedback: false,
      feedbackState: null,
      service: "Document",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const inferredService = inferConversationService(messages, inputValue);
    const userMessage = { id: Date.now(), sender: "user", text: inputValue };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: data.reply ?? "Sorry, I couldn't get a response.",
          collectFeedback: true,
          feedbackState: null,
          service: inferredService,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Something went wrong. Please try again.",
          collectFeedback: true,
          feedbackState: null,
          service: inferredService,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSelection = async (messageId, helpful, service) => {
    if (helpful) {
      await saveChatFeedback({ service, helpful: true });
      await saveSurveyFeedback({ service, rating: 3 });
    }

    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, feedbackState: helpful ? "yes" : "no" }
          : message
      )
    );
  };

  const handleImproveClick = (service) => {
    const query = `service=${encodeURIComponent(service)}`;
    router.push(`/feedback?${query}`);
  };

  return (
    <div className="ai-agent-container">
      {!isChatOpen && (
        <button
          className="ai-agent-button"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isChatOpen && (
        <div className="ai-chat-box">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <Bot size={18} />
              <span>Bayan QA Assistant</span>
            </div>
            <button
              className="ai-chat-close"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="ai-chat-messages" ref={messagesContainerRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message ai-message-${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <div className="ai-bubble ai-bubble-bot">
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#2563eb", textDecoration: "underline" }}
                          >
                            {children}
                          </a>
                        ),
                        p: ({ children }) => <p style={{ margin: "0 0 0.5rem 0" }}>{children}</p>,
                        ul: ({ children }) => (
                          <ul style={{ margin: "0.5rem 0", paddingLeft: "1.25rem" }}>{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol style={{ margin: "0.5rem 0", paddingLeft: "1.25rem" }}>{children}</ol>
                        ),
                        li: ({ children }) => <li style={{ marginBottom: "0.25rem" }}>{children}</li>,
                        strong: ({ children }) => <strong style={{ fontWeight: "600" }}>{children}</strong>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="ai-bubble ai-bubble-user">{msg.text}</p>
                )}

                {msg.sender === "bot" && msg.collectFeedback && (
                  <div className="ai-feedback-panel">
                    {msg.feedbackState === null && (
                      <>
                        <p className="ai-feedback-label">Was this helpful?</p>
                        <div className="ai-feedback-buttons">
                          <button
                            type="button"
                            className="ai-feedback-btn"
                            onClick={() => handleFeedbackSelection(msg.id, true, msg.service)}
                          >
                            👍 Yes
                          </button>
                          <button
                            type="button"
                            className="ai-feedback-btn ai-feedback-btn-secondary"
                            onClick={() => handleFeedbackSelection(msg.id, false, msg.service)}
                          >
                            👎 No
                          </button>
                        </div>
                      </>
                    )}

                    {msg.feedbackState === "no" && (
                      <button
                        type="button"
                        className="ai-improve-btn"
                        onClick={() => handleImproveClick(msg.service)}
                      >
                        Help improve this service
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-message ai-message-bot">
                <p style={{ color: "#9ca3af", fontStyle: "italic", margin: 0 }}>
                  Generating answer, please wait up to 10 seconds...
                </p>
              </div>
            )}
          </div>

          <div className="ai-chat-input-group">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              className="ai-chat-send"
              onClick={handleSendMessage}
              disabled={loading}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>

          <p
            style={{
              fontSize: "0.72rem",
              color: "#9ca3af",
              textAlign: "center",
              padding: "0.4rem 1rem 0.75rem",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            AI responses may not always be accurate. Please verify important information with official sources.
          </p>
        </div>
      )}
    </div>
  );
}