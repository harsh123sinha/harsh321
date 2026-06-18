const MessageBubble = ({ role, children }) => {
  const isUser = role === 'user';
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-navy text-white rounded-br-md'
            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-md'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default MessageBubble;
