import React, { useEffect, useRef, useState } from "react";
import { X, ChevronRight, PanelLeft } from "lucide-react";
import TypingIndicatorWeb from "./TypingIndicatorWeb";

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
  isAITyping?: boolean;
  onOpenHistory?: () => void; 
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  suggestedFAQs = [],
  messages,
  onSendMessage,
  onEndConversation,
  onFAQSelect,
  isAITyping = false,
  onOpenHistory
}) => {
  const [input, setInput] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAITyping, isUserTyping]);

  // set user typing flag based on input
  useEffect(() => {
    setIsUserTyping(input.trim().length > 0);
  }, [input]);

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
    <div
      className="relative w-full h-full bg-white overflow-hidden flex flex-col"
    >

      {/* TOP CURVE with overflow hidden for clouds */}
      <div className="absolute left-0 top-0 w-full h-32 overflow-hidden pointer-events-none z-10">
        <img
          src={new URL("../../assets/images/curved.svg", import.meta.url).href}
          className="absolute left-0 w-full"
          style={{ top: '-16px' }}
          alt=""
        />
        {/* Top curve - left cloud */}
        <img
          src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
          className="absolute top-8 left-0 w-16 opacity-60 animate-cloudSlow pointer-events-none"
          alt="cloud"
          style={{ maxWidth: '100%', overflow: 'hidden' }}
        />
        {/* Top curve - right cloud */}
        <img
          src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
          className="absolute top-4 right-0 w-16 opacity-60 animate-cloudReverse pointer-events-none"
          alt="cloud"
          style={{ maxWidth: '100%', overflow: 'hidden' }}
        />
      </div>

      {/* HEADER */}
            <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 pt-6 pb-3">
        <div className="flex items-center gap-3">

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={onOpenHistory}
            className="lg:hidden p-1"
            aria-label="Open chat history"
          >
            <PanelLeft className="w-6 h-6 text-white" />
          </button>

          <img
            src={new URL("../../assets/images/lili.svg", import.meta.url).href}
            className="w-8 h-8 sm:w-9 sm:h-9"
            alt="Lili"
          />
          <span className="text-white text-sm sm:text-base font-semibold">
            Lili
          </span>
        </div>

        <button onClick={() => setShowCloseModal(true)}>
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* MESSAGES */}
      <div
        className="relative z-5 flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`inline-block w-fit max-w-[85%] sm:max-w-[70%] lg:max-w-[65%] px-4 sm:px-5 py-2 sm:py-3 rounded-2xl text-sm sm:text-base leading-relaxed break-words ${
                msg.sender === "user"
                  ? "bg-white text-[#4f7f63] shadow"
                  : "bg-[#7fa98a] text-white"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* SHOW PROMPT + QUICK FAQ BUTTONS WHEN NO MESSAGES */}
        {messages.length === 0 && (
          <>
            <div className="mt-8 sm:mt-12">
              <p className="text-center text-[#4f7f63] text-xs sm:text-sm font-medium">
                Tap to send Lili a message
              </p>

              {suggestedFAQs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 sm:mt-6">
                  {suggestedFAQs.map((faq, i) => (
                    <button
                      key={i}
                      onClick={() => handleFAQClick(faq)}
                      className="w-full flex items-center justify-between bg-white rounded-[5px] px-3 py-2 text-xs sm:text-sm transition hover:bg-[#f7fbf7]"
                      style={{
                        boxShadow: '-3px 0 1px #AFC8AD, inset 0 0 0 1px #AFC8AD',
                        border: '1px solid rgba(175,200,173,0.15)'
                      }}
                    >
                      <span className="text-left text-[#4f7f63] font-bold text-[11px] sm:text-[13px]">
                        {faq}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#88AB8E]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* typing indicators */}
        {isAITyping && <TypingIndicatorWeb variant="ai" />}
        {isUserTyping && !isAITyping && <TypingIndicatorWeb variant="user" /> }

        <div ref={bottomRef} />
      </div>

      {/* BOTTOM CURVE with overflow hidden for clouds */}
      <div className="absolute left-0 w-full h-32 pointer-events-none z-10" style={{ bottom: '-16px' }}>
        <img
          src={new URL("../../assets/images/curved.svg", import.meta.url).href}
          className="absolute left-0 w-full rotate-180"
          style={{ bottom: '-16px' }}
          alt=""
        />
        {/* Bottom curve - left cloud */}
        <img
          src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
          className="absolute bottom-12 left-0 w-16 opacity-60 animate-cloudSlowBottom pointer-events-none"
          alt="cloud"
          style={{ maxWidth: '100%', overflow: 'hidden' }}
        />
        {/* Bottom curve - right cloud */}
        <img
          src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
          className="absolute bottom-8 right-0 w-16 opacity-60 animate-cloudReverseBottom pointer-events-none"
          alt="cloud"
          style={{ maxWidth: '100%', overflow: 'hidden' }}
        />
      </div>

      {/* INPUT (smaller) */}
      <div className="relative z-20 px-4 sm:px-6 py-1 flex items-center gap-3 bg-transparent">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type here..."
          className="flex-1 px-3 py-2 rounded-full text-sm bg-transparent border border-[#d3e4d3] outline-none transition h-9"
        />
        <button
          onClick={sendMessage}
          className="bg-white p-0 border-0 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ height: '36px', width: '44px' }}
          aria-label="Send message"
        >
          <img
            src={new URL("../../assets/images/send.svg", import.meta.url).href}
            className="w-8 h-8"
            alt="send"
          />
        </button>
      </div>

      {/* MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[15px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] w-full max-w-sm relative flex flex-col items-center py-8 px-6 gap-4">
            {/* Content Container - flex col for vertical layout */}
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Image */}
              <div className="flex justify-center">
                <img
                  src={new URL("../../assets/images/leave.jpg", import.meta.url).href}
                  alt="Leave chat"
                  className="w-20 h-20 object-contain"
                  style={{ transform: 'rotate(9.743deg)' }}
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col gap-1">
                {/* Heading */}
                <h2 className="text-[#2E523A] text-lg font-semibold text-center">
                  Leave this chat?
                </h2>

                {/* Subtitle */}
                <p className="text-gray-400 text-xs text-center">
                  End this conversation and start a new one?
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleEndConversation}
                className="flex-1 bg-[#88AB8E] text-[#F2F1EB] px-4 py-2 rounded-[8px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] font-bold text-xs hover:bg-[#7a9d80] transition whitespace-nowrap"
              >
                YES, END THIS CONVERSATION
              </button>

              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 bg-white text-[#88AB8E] border border-[#88AB8E] px-4 py-2 rounded-[8px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] font-bold text-xs hover:bg-gray-50 transition whitespace-nowrap"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
