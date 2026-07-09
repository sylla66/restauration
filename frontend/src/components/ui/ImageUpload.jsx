import { useState, useRef } from "react";
import { uploads } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Upload, Link, X } from "lucide-react";

export default function ImageUpload({ value, onChange, folder }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const toast = useToast();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploads.file(file);
      onChange(res.url);
      toast("Image uploadée");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setUploading(false);
    }
  }

  function handleUrl() {
    if (!urlInput) return;
    onChange(urlInput);
    setUrlInput("");
    setShowUrl(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-[var(--border)] shadow-sm" />
          <button type="button" onClick={() => onChange("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : showUrl ? (
        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xs">
          <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Coller une URL d'image..." className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" onKeyDown={(e) => e.key === "Enter" && handleUrl()} />
          <button onClick={handleUrl} className="px-3 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors">OK</button>
          <button onClick={() => setShowUrl(false)} className="p-2 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-20 h-20 border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
            {uploading ? <span className="text-xs">Envoi...</span> : <><Upload className="w-5 h-5" /><span className="text-xs mt-1">Upload</span></>}
          </button>
          <button type="button" onClick={() => setShowUrl(true)} className="w-20 h-20 border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
            <Link className="w-5 h-5" /><span className="text-xs mt-1">URL</span>
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
