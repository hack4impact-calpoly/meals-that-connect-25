"use client";

import { useRef, useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Plus } from "lucide-react";

type Props = {
  onUpload?: (url: string) => void;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploader({ onUpload }: Props) {
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploadFile = (file: File) => {
    const fileRef = ref(storage, `images/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    setUploading(true);
    setProgress(0);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percent);
      },
      (err) => {
        console.error(err);
        setError("Upload failed");
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onUpload?.(url);
        setUploading(false);
      },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, or WEBP allowed");
      return;
    }

    setError("");
    setPreview(URL.createObjectURL(file));

    uploadFile(file);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* BEFORE UPLOAD (dotted box) */}
      {!preview && (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-6 text-center transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-pepper/40 text-pepper">
            <Plus size={20} />
          </div>

          <p className="font-montserrat text-sm font-semibold text-pepper">Click to upload an image</p>

          <p className="font-montserrat text-xs text-pepper/60">PNG, JPG, or WEBP</p>

          {uploading && <p className="text-xs text-pepper">Uploading: {progress.toFixed(0)}%</p>}
        </div>
      )}

      {/* AFTER UPLOAD (image preview replaces box) */}
      {preview && (
        <div className="relative">
          <img src={preview} alt="preview" className="h-40 w-full rounded-lg object-cover" />

          {/* Change button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-md bg-pepper px-3 py-1 text-xs font-montserrat font-semibold text-white"
          >
            Change
          </button>

          {uploading && <div className="mt-2 text-xs text-pepper">Uploading: {progress.toFixed(0)}%</div>}
        </div>
      )}

      {/* Error */}
      {error && <p className="mt-2 text-sm font-montserrat text-red-600">{error}</p>}
    </div>
  );
}
