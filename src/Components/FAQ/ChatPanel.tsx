import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface ChatPanelProps {
  initialUserMessage?: string;
  suggestedFAQs?: string[];
  onEndConversation: () => void;
  onFAQSelect?: (faq: string) => void; // New prop to handle FAQ selection
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  initialUserMessage,
  suggestedFAQs = [],
  onEndConversation,
  onFAQSelect,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize messages ONLY on first mount or when starting a new conversation
  useEffect(() => {
    if (!hasInitialized && initialUserMessage) {
      setMessages([
        { sender: "user", text: initialUserMessage },
        {
          sender: "bot",
          text: "That's a great question! Let me walk you through that for you.",
        },
      ]);
      setHasInitialized(true);
    } else if (!hasInitialized && !initialUserMessage) {
      setMessages([
        {
          sender: "bot",
          text: "Hi! I'm Lili! How may I help you today?",
        },
      ]);
      setHasInitialized(true);
    }
  }, []);

  // Reset when ending conversation
  const handleEndConversation = () => {
    setMessages([
      {
        sender: "bot",
        text: "Hi! I'm Lili! How may I help you today?",
      },
    ]);
    setHasInitialized(true);
    setShowCloseModal(false);
    onEndConversation();
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input },
      {
        sender: "bot",
        text: "Thanks! I'm checking that for you now. Please hold on for a moment.",
      },
    ]);
    setInput("");
  };

  // Append FAQ to messages WITHOUT resetting
  const handleFAQClick = (faq: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: faq },
      {
        sender: "bot",
        text: "Thanks for asking! Here's what you need to know.",
      },
    ]);
    if (onFAQSelect) {
      onFAQSelect(faq);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#eaf2ec] overflow-hidden flex flex-col">
      {/* TOP CURVE */}
      <img
        src={new URL("../../assets/images/curved.svg", import.meta.url).href}
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        alt=""
      />

      {/* CLOUDS */}
      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-26 -left-20 w-20 opacity-60 animate-cloudSlow pointer-events-none z-0"
        alt="cloud"
      />
      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-15 -right-20 w-20 opacity-60 animate-cloudReverse pointer-events-none z-0"
        alt="cloud"
      />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Close Button */}
          <button
            onClick={() => setShowCloseModal(true)}
            className="p-1 bg-transparent hover:text-[#d3e4d3] transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Lili mascot */}
          <img
            src={new URL("../../assets/images/lili.svg", import.meta.url).href}
            className="w-9 h-9"
            alt="Lili"
          />
          <span className="font-semibold text-[#4f7f63]">
            Lili – Chat Support
          </span>
        </div>

        {/* Burger Menu */}
        <button className="bg-transparent p-0 border-0">
          <img
            src={new URL("../../assets/images/burger.svg", import.meta.url).href}
            className="w-6"
            alt="menu"
          />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="relative z-10 flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`w-full flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`inline-block w-fit max-w-[65%] px-5 py-3 rounded-2xl text-sm leading-relaxed break-words ${
                msg.sender === "user"
                  ? "bg-[#7fa98a] text-white"
                  : "bg-white text-[#4f7f63] shadow"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* QUICK FAQ BUTTONS - Show only on initial greeting */}
        {messages.length === 1 && !initialUserMessage && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            {suggestedFAQs.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleFAQClick(faq)}
                className="bg-white text-[#4f7f63] px-4 py-3 rounded-xl text-xs shadow hover:bg-[#eef5ef] transition"
              >
                {faq}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* BOTTOM CURVE */}
      <img
        src={new URL("../../assets/images/curved.svg", import.meta.url).href}
        className="absolute bottom-0 left-0 w-full rotate-180 pointer-events-none"
        alt=""
      />

      {/* INPUT */}
      <div className="relative z-10 px-6 py-4 flex items-center gap-3 bg-[#7fa98a]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type here..."
          className="flex-1 px-5 py-3 rounded-full text-sm focus:outline-none"
        />
        <button onClick={sendMessage} className="bg-transparent p-0 border-0">
          <img
            src={new URL("../../assets/images/send.svg", import.meta.url).href}
            className="w-10"
            alt="send"
          />
        </button>
      </div>

      {/* MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center shadow-lg">
            <p className="mb-6 text-[#4f7f63] font-medium">
              Do you want to end the conversation?
            </p>
            <div className="flex justify-between gap-4">
              <button
                onClick={handleEndConversation}
                className="flex-1 bg-[#7fa98a] text-white px-4 py-2 rounded-full shadow hover:bg-[#6d9277] transition"
              >
                End Conversation
              </button>

              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 bg-white text-[#4f7f63] border border-[#4f7f63] px-4 py-2 rounded-full shadow hover:bg-[#f0f5f0] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
