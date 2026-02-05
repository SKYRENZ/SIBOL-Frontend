import React from 'react';

interface Props {
  variant?: 'ai' | 'user';
}

const TypingIndicatorWeb: React.FC<Props> = ({ variant = 'ai' }) => {
  const isAI = variant === 'ai';

  return (
    <div className={`px-2 mb-4 ${isAI ? '' : ''}`}>
      {isAI ? (
        <div className="relative max-w-[80px]">
          <div className="absolute -left-0 top-3.5 z-0">
            {/* tail shape can be omitted for simplicity */}
          </div>

          <div
            className="bg-[#88AB8E] rounded-[15px] px-4 py-2.5 ml-4 flex-row items-center justify-center inline-flex"
            style={{
              minWidth: 60,
              height: 36,
              boxShadow: '-4px 4px 2px rgba(175,200,173,0.25)'
            }}
          >
            <div style={{ display: 'flex', gap: 9 }}>
              <span className="typing-dot -green" style={{ animationDelay: '0ms' }} />
              <span className="typing-dot -green" style={{ animationDelay: '150ms' }} />
              <span className="typing-dot -green" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-row justify-end flex">
          <div
            className="bg-white rounded-[15px] px-4 py-2.5 inline-flex items-center justify-center"
            style={{
              minWidth: 60,
              height: 36,
              boxShadow: '4px 4px 2px rgba(136,139,142,0.12)'
            }}
          >
            <div style={{ display: 'flex', gap: 9 }}>
              <span className="typing-dot -grey" style={{ animationDelay: '0ms' }} />
              <span className="typing-dot -grey" style={{ animationDelay: '150ms' }} />
              <span className="typing-dot -grey" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingIndicatorWeb;
