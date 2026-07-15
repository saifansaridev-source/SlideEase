'use client';

import React, { useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  // Sync value from parent state into editor innerHTML if different
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      marginTop: '0.25rem'
    }}>
      {/* Editor Formatting Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.35rem',
        padding: '0.6rem 0.8rem',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        alignItems: 'center',
        userSelect: 'none'
      }}>
        <button
          type="button"
          onClick={() => handleCommand('bold')}
          style={{ padding: '0.35rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => handleCommand('italic')}
          style={{ padding: '0.35rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontStyle: 'italic', fontSize: '0.85rem' }}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => handleCommand('underline')}
          style={{ padding: '0.35rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
          title="Underline"
        >
          U
        </button>
        
        <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1', margin: '0 0.35rem' }}></div>
        
        <button
          type="button"
          onClick={() => handleCommand('insertUnorderedList')}
          style={{ padding: '0.35rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
          title="Bullet List"
        >
          • Bullet List
        </button>
        <button
          type="button"
          onClick={() => handleCommand('insertOrderedList')}
          style={{ padding: '0.35rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
          title="Numbered List"
        >
          1. Number List
        </button>
        
        <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1', margin: '0 0.35rem' }}></div>

        <button
          type="button"
          onClick={() => handleCommand('formatBlock', '<h3>')}
          style={{ padding: '0.35rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
          title="Heading"
        >
          Heading
        </button>
        <button
          type="button"
          onClick={() => handleCommand('formatBlock', '<p>')}
          style={{ padding: '0.35rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
          title="Paragraph text"
        >
          Normal Text
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1', margin: '0 0.35rem' }}></div>

        <button
          type="button"
          onClick={() => handleCommand('removeFormat')}
          style={{ padding: '0.35rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}
          title="Clear formatting attributes"
        >
          Clear Formatting
        </button>
      </div>

      {/* Content Editable Zone */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="rich-editor-content"
        style={{
          minHeight: '130px',
          padding: '1rem',
          outline: 'none',
          fontSize: '0.9rem',
          color: '#0f172a',
          lineHeight: '1.6',
          cursor: 'text',
          backgroundColor: '#ffffff',
          overflowY: 'auto'
        }}
        data-placeholder={placeholder}
      ></div>
    </div>
  );
}
