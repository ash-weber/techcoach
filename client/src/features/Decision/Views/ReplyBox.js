import React from "react";
import { Autocomplete, TextField, Chip, Box } from "@mui/material";

const ReplyBox = ({
  value,
  onChange,
  onReply,
  onReplyEmail,
  biasTags = [],
  selectedTags = [],
  onTagsChange,
}) => (
  <div className="reply-box">
    <input placeholder="Write a reply…" value={value} onChange={onChange} />

    <Autocomplete
      multiple
      size="small"
      options={biasTags}
      value={selectedTags}
      getOptionLabel={(o) => o.tag_name || ""}
      isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
      onChange={onTagsChange}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box>
            <div style={{ fontWeight: 600 }}>{option.tag_name}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {option.tag_type}
            </div>
          </Box>
        </li>
      )}
      renderInput={(p) => (
        <TextField {...p} placeholder="Add bias tags..." variant="outlined" />
      )}
      sx={{ mt: 1 }}
    />
    <div className="reply-box__actions">
      <button className="decision-btn decision-btn--primary" onClick={onReply}>
        Reply
      </button>
      <button
        className="decision-btn decision-btn--primary"
        onClick={onReplyEmail}
      >
        Reply &amp; Email
      </button>
    </div>
  </div>
);

export default ReplyBox;
