"use client";
// Button that opens an inline notes panel for a specific application
// Shows existing notes, allows adding and deleting notes
// Calls GET/POST /api/recruiter/notes?applicationId=xxx and DELETE /api/recruiter/notes/[id]

import { useState, useEffect } from "react";
import { StickyNote, Loader2, Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";

interface RecruiterNote {
  id: string;
  content: string;
  createdAt: string;
  recruiter: { id: string; name: string | null };
}

interface Props {
  applicationId: string;
}

function timeAgoClient(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function NotesButton({ applicationId }: Props) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<RecruiterNote[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Fetch count on mount
  useEffect(() => {
    fetch(`/api/recruiter/notes?applicationId=${applicationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.notes) setCount(data.notes.length);
      })
      .catch(() => setCount(0));
  }, [applicationId]);

  async function loadNotes() {
    setLoadingNotes(true);
    setError("");
    try {
      const res = await fetch(`/api/recruiter/notes?applicationId=${applicationId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors du chargement");
        return;
      }
      setNotes(data.notes);
      setCount(data.notes.length);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoadingNotes(false);
    }
  }

  function handleToggle() {
    if (!open) {
      loadNotes();
    }
    setOpen((v) => !v);
  }

  async function handleSave() {
    if (!newContent.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/recruiter/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, content: newContent.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la sauvegarde");
        return;
      }
      setNotes((prev) => [data.note, ...prev]);
      setCount((prev) => (prev ?? 0) + 1);
      setNewContent("");
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    setError("");
    try {
      const res = await fetch(`/api/recruiter/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la suppression");
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setCount((prev) => Math.max(0, (prev ?? 1) - 1));
    } catch {
      setError("Erreur réseau");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
      >
        <StickyNote className="h-3.5 w-3.5 text-yellow-500" />
        Notes {count !== null ? `(${count})` : ""}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 border border-gray-200 rounded-xl bg-gray-50 p-3 space-y-3">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-2 py-1.5 rounded-lg">{error}</p>
          )}

          {/* Notes list */}
          {loadingNotes ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start justify-between gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap break-words">{note.content}</p>
                    <p className="text-gray-400 text-xs mt-1">{timeAgoClient(note.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                    title="Supprimer cette note"
                  >
                    {deletingId === note.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">Aucune note pour cette candidature</p>
          )}

          {/* Add note */}
          <div className="space-y-2">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Ajouter une note..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none bg-white"
            />
            <button
              onClick={handleSave}
              disabled={saving || !newContent.trim()}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors font-medium"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Ajouter une note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
