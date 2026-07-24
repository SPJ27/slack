"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  List,
  ListOrdered,
  Code,
  Plus,
  ArrowUp,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  File,
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import Image from "next/image";
import { send_message } from "@/actions/message";
import type ReactQuillType from "react-quill-new";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
}) as typeof ReactQuillType;

interface ActiveFormats {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  link?: string | boolean;
  list?: "bullet" | "ordered" | false;
  "code-block"?: boolean;
  [key: string]: unknown;
}

interface QuillToolbarProps {
  onFormat: (name: string, value: unknown) => void;
  activeFormats: ActiveFormats;
}

const QuillToolbar = ({ onFormat, activeFormats }: QuillToolbarProps) => {
  const btn = (active: boolean | undefined) =>
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
        className={btn(Boolean(activeFormats.link))}
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
        className={btn(Boolean(activeFormats["code-block"]))}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat("code-block", !activeFormats["code-block"])}
      >
        <Code className="size-4" />
      </button>
      <div className="w-px h-4 bg-black/10" />
    </div>
  );
};

let mentionBlotReady: Promise<void> | null = null;

function ensureStyledMentionBlot() {
  if (!mentionBlotReady) {
    mentionBlotReady = (async () => {
      await import("quill-mention/autoregister");
      const { Quill } = await import("react-quill-new");

      const MentionBlot = Quill.import("blots/mention") as any;

      class StyledMentionBlot extends MentionBlot {
  static render(data: {
    id: string | number;
    value: string;
    denotationChar?: string;
  }) {
    const element = document.createElement("span");
    element.className = "mention-pill";
    element.contentEditable = "false";

    element.dataset.id = String(data.id);
    element.dataset.type = data.denotationChar === "#" ? "channel" : "user";

    element.innerHTML = `
      <span class="mention-prefix">${data.denotationChar}</span>
      <span class="mention-label">${data.value}</span>
    `;

    element.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (data.denotationChar === "#") {
        window.location.href = `/channels/${data.id}`;
      }
    });

    return element;
  }
}
      (StyledMentionBlot as any).blotName = "styled-mention";
      (StyledMentionBlot as any).className = "ql-styled-mention";

      Quill.register(StyledMentionBlot, true);
    })();
  }
  return mentionBlotReady;
}

const Composer = ({
  id,
  name,
  type = "CHANNEL",
}: {
  id: number;
  name: string;
  type: string;
}) => {
  const [value, setValue] = useState("");
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({});
  const quillRef = useRef<ReactQuillType | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [blotReady, setBlotReady] = useState(false);

  const getEditor = () => quillRef.current?.getEditor?.() ?? null;

  const refreshActiveFormats = () => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection();
    if (!range) return;
    setActiveFormats(editor.getFormat(range));
  };

  useEffect(() => {
    let cancelled = false;
    ensureStyledMentionBlot().then(() => {
      if (!cancelled) setBlotReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFormat = (name: string, value: unknown) => {
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

    setValue("");
    setFiles([]);
    const formData = new FormData();
    formData.append("message", value);
    files.forEach((file) => {
      formData.append("attachments", file);
    });
    formData.append("to", String(id));
    formData.append("type", type);

    await send_message(formData);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  async function suggestAtMentions(searchTerm: string) {
    const atValues = [
      { id: 1, value: "sage" },
      { id: 2, value: "spj" },
      { id: 3, value: "fsh" },
      { id: 4, value: "matthias" },
      { id: 5, value: "mish" },
    ];
    return atValues.filter((person) =>
      person.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  async function suggestHashMentions(searchTerm: string) {
    const hashValues = [
      { id: 33, value: "Fredrik Sundqvist 2" },
      { id: 4, value: "Patrik Sjölin 2" },
    ];
    return hashValues.filter((person) =>
      person.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  const quillModules = {
  toolbar: false,
  mention: {
    allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
    mentionDenotationChars: ["@", "#"],
    showDenotationChar: false,
    defaultMenuOrientation: "top",
    dataAttributes: ["id", "value", "denotationChar", "link", "target", "disabled"],
    blotName: "styled-mention",
    source: async function (
      searchTerm: string,
      renderList: (data: { id: number; value: string }[], term: string) => void,
      mentionChar: string,
    ) {
      const matches =
        mentionChar === "@"
          ? await suggestAtMentions(searchTerm)
          : await suggestHashMentions(searchTerm);
      renderList(matches, searchTerm);
    },
    renderItem: function (
      item: { id: number; value: string },
      mentionChar: string,
    ) {
      const wrapper = document.createElement("div");
      wrapper.className = "mention-item";

      const avatar = document.createElement("div");
      avatar.className = "mention-avatar";
      // avatar.textContent = mentionChar === "@" ? getInitials(item.value) : "#";

      const name = document.createElement("span");
      name.className = "mention-name";
      name.textContent = item.value;

      wrapper.appendChild(avatar);
      wrapper.appendChild(name);
      return wrapper;
    },
  },
};

  return (
    <div className="mx-4 mb-12 border border-black/20 rounded-lg  shrink-0 flex flex-col relative">
      <QuillToolbar onFormat={handleFormat} activeFormats={activeFormats} />
      <div onKeyDownCapture={handleEditorKeyDown}>
        {blotReady && (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={setValue}
            onChangeSelection={refreshActiveFormats}
            modules={quillModules}
            placeholder={`Message #${name}`}
            className="composer-quill"
          />
        )}
      </div>

      {files.length > 0 && (
        <div className="px-3 pt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex  items-center gap-3 rounded-lg border border-neutral-300 bg-white/5 p-2 max-w-60"
            >
              {!file.type.startsWith("image") ? (
                <>
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
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="relative group overflow-hidden rounded-sm border border-neutral-300">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    width={100}
                    height={100}
                    unoptimized
                    className="max-h-12 w-auto object-contain bg-neutral-100"
                  />

                  <button
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm opacity-0 transition group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              )}
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
              const selected = Array.from(e.target.files ?? []);

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
        .ql-mention-list-container {
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          background: #fff;
          padding: 4px;
          min-width: 220px;
          max-height: 240px;
          overflow-y: auto;
        }
        .ql-mention-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .ql-mention-list-item {
          padding: 0;
          border-radius: 6px;
          cursor: pointer;
        }
        .ql-mention-list-item.selected,
        .ql-mention-list-item:hover {
          background: #1264a3;
        }
        .ql-mention-list-item.selected .mention-name,
        .ql-mention-list-item:hover .mention-name {
          color: #fff;
        }
        .mention-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
        }
        .mention-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1264a3;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .mention-name {
          font-size: 14px;
          color: #1d1c1d;
        }

        .mention-pill {
          color: #1264a3;
          background-color: rgba(18, 100, 163, 0.12);
          border-radius: 4px;
          padding: 1px 3px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
        }
        .mention-pill:hover {
          background-color: rgba(18, 100, 163, 0.22);
          text-decoration: none;
        }
          .mention-pill {
  display: inline-flex;
  align-items: center;
  gap: 1px;

  background: #e8f5ff;
  color: #1264a3;
  border-radius: 4px;
  padding: 1px 4px;

  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.mention-pill:hover {
  background: #d3ebff;
}

.mention-prefix {
  font-weight: 700;
}

.mention-label {
  font-weight: 500;
}
      `}</style>
    </div>
  );
};

export default Composer;