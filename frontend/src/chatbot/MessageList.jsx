import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import PropertyCarousel from './PropertyCarousel';

const MessageList = ({ messages, typing }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-3 min-h-0">
      {messages.map((m) =>
        m.variant === 'carousel' && m.properties?.length ? (
          <div key={m.id} className="flex w-full justify-start">
            <div className="w-full max-w-[100%] rounded-2xl border border-slate-100 bg-white/95 px-2 py-2 shadow-sm">
              <PropertyCarousel properties={m.properties} />
            </div>
          </div>
        ) : (
          <MessageBubble key={m.id} role={m.role}>
            <div className="whitespace-pre-wrap">{m.text}</div>
          </MessageBubble>
        )
      )}
      {typing ? (
        <div className="flex justify-start">
          <MessageBubble role="bot">
            <span className="sr-only">Assistant is typing</span>
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
            </span>
          </MessageBubble>
        </div>
      ) : null}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
