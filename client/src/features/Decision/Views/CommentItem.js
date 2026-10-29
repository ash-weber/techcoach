import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { AiFillEdit } from 'react-icons/ai';

const CommentItem = ({ comment, isReply, isAuthor, onEdit, children }) => {
  const edited = comment.created_at !== comment.updated_at;

  return (
    <>
      <div
        className={
          'comment' +
          (isReply ? ' comment--reply' : '') +
          (isAuthor ? ' comment--author' : '')
        }
      >
        <div className="comment__header">
          <p className="comment__text">{comment.comment}</p>
          {isAuthor && onEdit && (
            <button
              className="comment__edit-btn"
              onClick={() => onEdit(comment)}
              aria-label="Edit comment"
            >
              <AiFillEdit />
            </button>
          )}
        </div>

        <div className="comment__meta">
          <span className="comment__avatar">
            {(comment.displayname || '?')[0]}
          </span>
          <span className="comment__meta-text">
            {comment.displayname} | {comment.email} |{' '}
            {edited ? (
              <>
                Edited{' '}
                {formatDistanceToNow(parseISO(comment.updated_at), {
                  addSuffix: true,
                })}
              </>
            ) : (
              formatDistanceToNow(parseISO(comment.created_at), {
                addSuffix: true,
              })
            )}
          </span>
        </div>
      </div>
      {children}
    </>
  );
};

export default CommentItem;