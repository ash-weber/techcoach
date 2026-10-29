import React from 'react';

const TagPicker = ({ tags, selected, onToggle, emptyHint }) => (
  <div className="tag-picker">
    {tags.length === 0 ? (
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {emptyHint || 'No tags match your search'}
      </span>
    ) : (
      tags.map((tag) => (
        <div key={tag} className="tag-item">
          <label className="tag-label" htmlFor={tag}>
            <input
              type="checkbox"
              id={tag}
              checked={selected.includes(tag)}
              onChange={() => onToggle(tag)}
            />
            {tag}
          </label>
        </div>
      ))
    )}
  </div>
);

export default TagPicker;