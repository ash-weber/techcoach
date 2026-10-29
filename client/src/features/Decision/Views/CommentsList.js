import React from 'react';
import CommentItem from './CommentItem';
import ReplyBox from './ReplyBox';

const CommentsList = ({
  title,
  comments,
  replies,
  onReplyChange,
  onReply,
  onReplyEmail,
  onEditReply,
  onEditComment,
  showAuthorReplies = false,
}) => {
  if (!comments || comments.length === 0) {
    return (
      <section className="comments-section">
        <h3 className="comments-section__title">{title}</h3>
        <p className="comments-empty">No comments yet.</p>
      </section>
    );
  }

  return (
    <section className="comments-section">
      <h3 className="comments-section__title">{title}</h3>

      {comments.map((c) => {
        const isAuthor = c.type_of_member === 'author';
        const isMember = c.type_of_member === 'member';
        const repliesForThis = showAuthorReplies
          ? comments.filter((r) => r.parentCommentId === c.id)
          : [];

        return (
          <CommentItem
            key={c.id}
            comment={c}
            isAuthor={isAuthor}
            onEdit={onEditComment}
          >
            {showAuthorReplies && isMember && (
              <>
                {repliesForThis.map((r) => (
                  <CommentItem
                    key={r.id}
                    comment={r}
                    isAuthor
                    isReply
                    onEdit={onEditReply}
                  />
                ))}

                {repliesForThis.length === 0 && (
                  <ReplyBox
                    value={replies[c.id] || ''}
                    onChange={onReplyChange(c.id)}
                    onReply={() => onReply(c.id, c.groupId)}
                    onReplyEmail={() => onReplyEmail(c.id, c.groupId)}
                  />
                )}
              </>
            )}
          </CommentItem>
        );
      })}
    </section>
  );
};

export default CommentsList;