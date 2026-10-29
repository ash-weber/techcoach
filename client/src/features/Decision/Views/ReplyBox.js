import React from 'react';

const ReplyBox = ({ value, onChange, onReply, onReplyEmail }) => (
  <div className="reply-box">
    <input
      placeholder="Write a reply…"
      value={value}
      onChange={onChange}
    />
    <div className="reply-box__actions">
      <button className="decision-btn decision-btn--primary" onClick={onReply}>
        Reply
      </button>
      <button className="decision-btn decision-btn--primary" onClick={onReplyEmail}>
        Reply &amp; Email
      </button>
    </div>
  </div>
);

export default ReplyBox;