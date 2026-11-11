
import React from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { AiFillEdit } from "react-icons/ai";

const CommentItem = ({
  comment,
  isReply,
  isAuthor,
  onEdit,
  children,
}) => {
  const edited = comment.created_at !== comment.updated_at;

  const DisplayBiasTags = ({ tags = [] }) => {
    if (!Array.isArray(tags) || tags.length === 0) return null;

    return (
      <div className="comment-bias-list">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className={
              tag.tag_type === "Bias"
                ? "comment-bias-chip"
                : "comment-other-chip"
            }
          >
            {tag.tag_name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div
        className={
          "comment" +
          (isReply ? " comment--reply" : "") +
          (isAuthor ? " comment--author" : "")
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

        <DisplayBiasTags tags={comment.biasTags} />

        <div className="comment__meta">
          <span className="comment__avatar">
            {(comment.displayname || "?")[0]}
          </span>

          <span className="comment__meta-text">
            {comment.displayname} | {comment.email} |{" "}
            {edited ? (
              <>
                Edited{" "}
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
