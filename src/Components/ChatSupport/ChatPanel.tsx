import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface ChatPanelProps {
  initialUserMessage?: string;
  suggestedFAQs?: string[];
  messages: Message[];
  onSendMessage: (text: string) => void;
  onEndConversation: () => void;
  onFAQSelect?: (faq: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  suggestedFAQs = [],
  messages,
  onSendMessage,
  onEndConversation,
  onFAQSelect,
}) => {
  const [input, setInput] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const handleFAQClick = (faq: string) => {
    onSendMessage(faq);
    onFAQSelect?.(faq);
  };

  const handleEndConversation = () => {
    setShowCloseModal(false);
    onEndConversation();
  };

  return (
    <div className="relative w-full h-full bg-white overflow-hidden flex flex-col">

      {/* TOP CURVE */}
      <img
        src={new URL("../../assets/images/curved.svg", import.meta.url).href}
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        alt=""
      />

      {/* CLOUDS */}
      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-24 -left-12 w-16 opacity-60 animate-cloudSlow pointer-events-none hidden md:block"
        alt="cloud"
      />
      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-20 -right-12 w-16 opacity-60 animate-cloudReverse pointer-events-none hidden md:block"
        alt="cloud"
      />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <img
            src={new URL("../../assets/images/lili.svg", import.meta.url).href}
            className="w-8 h-8 sm:w-9 sm:h-9"
            alt="Lili"
          />
          <button
            onClick={() => setShowCloseModal(true)}
            className="p-1 bg-transparent hover:text-[#d3e4d3] transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`inline-block w-fit max-w-[70%] sm:max-w-[65%] px-4 sm:px-5 py-2 sm:py-3 rounded-2xl text-sm sm:text-base leading-relaxed break-words ${
                msg.sender === "user"
                  ? "bg-[#7fa98a] text-white"
                  : "bg-white text-[#4f7f63] shadow"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* QUICK FAQ BUTTONS */}
        {messages.length === 0 && suggestedFAQs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 sm:mt-6">
            {suggestedFAQs.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleFAQClick(faq)}
                className="bg-white text-[#4f7f63] px-4 py-3 rounded-xl text-xs sm:text-sm shadow hover:bg-[#eef5ef] transition"
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
      <div className="relative z-10 px-4 sm:px-6 py-3 flex items-center gap-3 bg-transparent">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type here..."
          className="flex-1 px-4 sm:px-5 py-2 sm:py-3 rounded-full text-sm sm:text-base bg-transparent border border-[#d3e4d3] outline-none transition"
        />
        <button onClick={sendMessage} className="bg-transparent p-0 border-0">
          <img
            src={new URL("../../assets/images/send.svg", import.meta.url).href}
            className="w-8 sm:w-10"
            alt="send"
          />
        </button>
      </div>

      {/* MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-xs sm:max-w-sm text-center shadow-lg">
            <p className="mb-6 text-[#4f7f63] font-medium text-sm sm:text-base">
              Do you want to end the conversation?
            </p>
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
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
