"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, Quote,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link2, ImageIcon,
  Highlighter, Minus, Undo2, Redo2, Code2, X, Check,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick, active, title, children, disabled,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${
        active
          ? "bg-orange-500 text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-orange-500 underline hover:text-orange-600" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl max-w-full my-4 mx-auto block" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Commencez à rédiger votre article…" }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-orange max-w-none focus:outline-none min-h-[400px] px-6 py-5 text-gray-800",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes (e.g. loading a template)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  function applyLink() {
    if (!linkUrl.trim()) {
      editor!.chain().focus().unsetLink().run();
    } else {
      editor!.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }

  function applyImage() {
    if (!imageUrl.trim()) return;
    editor!.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImageInput(false);
  }

  async function handleImageUpload(file: File) {
    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        editor!.chain().focus().setImage({ src: data.url }).run();
      }
    } catch (e) {
      console.error("Upload image:", e);
    }
    setImageUploading(false);
    setShowImageInput(false);
  }

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">

      {/* ── Barre d'outils ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200">

        {/* Historique */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Annuler (Ctrl+Z)">
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rétablir (Ctrl+Y)">
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Titres */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Titre H1">
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Titre H2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Titre H3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Formatage inline */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Gras (Ctrl+B)">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italique (Ctrl+I)">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Souligné (Ctrl+U)">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Barré">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Surligner">
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code inline">
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Listes */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste à puces">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citation">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Bloc de code">
          <Code2 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignement */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Aligner à gauche">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centrer">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Aligner à droite">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Lien */}
        <ToolbarButton onClick={() => { setShowLinkInput(!showLinkInput); setShowImageInput(false); setLinkUrl(editor.getAttributes("link").href ?? ""); }} active={editor.isActive("link")} title="Insérer un lien">
          <Link2 className="h-4 w-4" />
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton onClick={() => { setShowImageInput(!showImageInput); setShowLinkInput(false); }} title="Insérer une image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        {/* Séparateur horizontal */}
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur horizontal">
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* ── Sous-barre lien ──────────────────────────────────────────────── */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
          <Link2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://exemple.com"
            className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkInput(false); }}
            autoFocus
          />
          <button onClick={applyLink} className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setShowLinkInput(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Sous-barre image ─────────────────────────────────────────────── */}
      {showImageInput && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border-b border-emerald-100">
          <ImageIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://exemple.com/image.jpg"
            className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            onKeyDown={(e) => { if (e.key === "Enter") applyImage(); if (e.key === "Escape") setShowImageInput(false); }}
            autoFocus
          />
          <span className="text-xs text-gray-400">ou</span>
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={imageUploading}
            className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
          >
            {imageUploading ? "Upload…" : "Depuis fichier"}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
          />
          <button onClick={applyImage} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setShowImageInput(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Zone d'écriture ──────────────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Compteur ─────────────────────────────────────────────────────── */}
      <div className="px-6 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>{editor.storage.characterCount?.characters?.() ?? editor.getText().length} caractères</span>
        <span>{editor.getText().trim().split(/\s+/).filter(Boolean).length} mots</span>
      </div>
    </div>
  );
}
