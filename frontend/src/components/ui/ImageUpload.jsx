import { useState, useRef } from "react";
import { uploads } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Upload, X } from "lucide-react";

export default function ImageUpload({ value, onChange, folder }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
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

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="w-24 h-24 object-cover rounded-lg border" />
          <button type="button" onClick={() => onChange("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-24 h-24 border-2 border-dashed border-[var(--border)] rounded-lg flex flex-col items-center justify-center text-[var(--muted-foreground)] hover:border-[#e67e22] hover:text-[#e67e22] transition-colors">
          {uploading ? (
            <span className="text-xs">Envoi...</span>
          ) : (
            <><Upload className="w-5 h-5" /><span className="text-xs mt-1">Upload</span></>
          )}
        </button>
      )}
    </div>
  );
}
