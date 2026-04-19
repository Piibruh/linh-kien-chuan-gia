import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'color',
  'background',
  'link',
  'image',
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  minHeight = '300px',
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    // Suppress findDOMNode warning from ReactQuill
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('findDOMNode')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };

    // Add custom styles for the editor
    const style = document.createElement('style');
    style.innerHTML = `
      .ql-container {
        min-height: ${minHeight};
        font-size: 14px;
        font-family: Inter, system-ui, -apple-system, sans-serif;
      }
      .ql-editor {
        min-height: ${minHeight};
      }
      .ql-toolbar {
        border-color: #c3c4c7 !important;
        background: #f6f7f7;
        border-radius: 4px 4px 0 0;
      }
      .ql-container {
        border-color: #c3c4c7 !important;
        border-radius: 0 0 4px 4px;
      }
      .ql-editor.ql-blank::before {
        color: #8c8f94;
        font-style: normal;
      }
    `;
    document.head.appendChild(style);

    return () => {
      console.error = originalError;
      document.head.removeChild(style);
    };
  }, [minHeight]);

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
      />
    </div>
  );
}