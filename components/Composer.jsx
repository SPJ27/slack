"use client";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Mic,
  Video,
  List,
  ListOrdered,
  Code,
  Plus,
  Smile,
  AtSign,
  Paperclip,
  ArrowUp,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  File,
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const QuillToolbar = ({ onFormat, activeFormats }) => {
  const btn = (active) =>
    `flex items-center rounded p-0.5 ${active ? "text-[#1264A3] bg-[#1264A3]/10" : ""}`;

  return (
    <div className="flex items-center gap-3 px-2.5 py-1.5 border-b border-black/10 text-[#5a5a5a] shrink-0">
      <button
        type="button"
        className={btn(activeFormats.bold)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("bold", !activeFormats.bold)}
      >
        <Bold className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.italic)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("italic", !activeFormats.italic)}
      >
        <Italic className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.underline)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("underline", !activeFormats.underline)}
      >
        <Underline className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.strike)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("strike", !activeFormats.strike)}
      >
        <Strikethrough className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.link)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const url = window.prompt("Enter a URL");
          if (url) onFormat("link", url);
        }}
      >
        <LinkIcon className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.list === "bullet")}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          onFormat("list", activeFormats.list === "bullet" ? false : "bullet")
        }
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats.list === "ordered")}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          onFormat("list", activeFormats.list === "ordered" ? false : "ordered")
        }
      >
        <ListOrdered className="size-4" />
      </button>
      <button
        type="button"
        className={btn(activeFormats["code-block"])}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("code-block", !activeFormats["code-block"])}
      >
        <Code className="size-4" />
      </button>
      <div className="w-px h-4 bg-black/10" />
    </div>
  );
};

const Composer = ({ channel_id, channel_name }) => {
  const [value, setValue] = useState("");
  const [activeFormats, setActiveFormats] = useState({});
  const quillRef = useRef(null);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const getEditor = () => quillRef.current?.getEditor?.() ?? null;

  const refreshActiveFormats = () => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection();
    if (!range) return;
    setActiveFormats(editor.getFormat(range));
  };

  const handleFormat = (name, value) => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection() || {
      index: editor.getLength(),
      length: 0,
    };
    editor.focus();
    editor.setSelection(range);
    editor.format(name, value);
    refreshActiveFormats();
  };

  const handleSend = async () => {
    const text = value.replace(/<(.|\n)*?>/g, "").trim();
    if (!text) return;
    const formData = new FormData();
    formData.append("message", value);
    files.forEach((file) => {
  formData.append("attachments", file);
});
    formData.append("to", channel_id)
    formData.append("type", "CHANNEL")
    console.log( value)
    const res = await fetch("/api/messages", {
      method: "POST",
    
      body: formData,
    });

    setValue("");
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const binding = editor.keyboard.addBinding(
      { key: 13, shiftKey: null },
      (range, context) => {
        if (context.shiftKey) return true;

        handleSend();
        return false;
      },
    );

    return () => {
      if (binding) {
        editor.keyboard.bindings[13] = editor.keyboard.bindings[13].filter(
          (b) => b !== binding,
        );
      }
    };
  }, [handleSend]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quillModules = {
    toolbar: false,
  };
  return (
    <div className="mx-4 mb-12 border border-black/20 rounded-lg overflow-hidden shrink-0 flex flex-col">
      <QuillToolbar onFormat={handleFormat} activeFormats={activeFormats} />
      <div onKeyDown={handleKeyDown}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={setValue}
          onChangeSelection={refreshActiveFormats}
          modules={quillModules}
          placeholder={`Message #${channel_name}`}
          className="composer-quill"
        />
      </div>
      {files.length > 0 && (
        <div className="px-3 pt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex  items-center gap-3 rounded-lg border border-neutral-300 bg-white/5 p-2 w-60"
            >
              <div className="h-10 w-10 rounded bg-sky-500 flex items-center justify-center text-white font-bold">
                <File />
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <button
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between px-2.5 py-1.5 shrink-0">
        <div className="flex items-center gap-3 text-[#5a5a5a]">
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            <Plus className="size-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const selected = Array.from(e.target.files);

              setFiles((prev) => [...prev, ...selected]);

              e.target.value = "";
            }}
          />
        </div>
        <button
          onClick={handleSend}
          className="size-6 rounded bg-[#0a5a2a] flex items-center justify-center shrink-0"
        >
          <ArrowUp className="size-4 text-white" />
        </button>
      </div>
      <style jsx global>{`
        .composer-quill .ql-container {
          border: none !important;
          font-family: inherit;
        }
        .composer-quill .ql-editor {
          padding: 10px 12px;
          min-height: 24px;
          max-height: 220px;
          font-size: 15px;
          line-height: 1.45;
        }
        .composer-quill .ql-editor.ql-blank::before {
          color: #8a8a8a;
          font-style: normal;
          left: 12px;
        }
      `}</style>
    </div>
  );
};

export default Composer;
