/* eslint-disable @next/next/no-img-element */
import ImageUploader from "@/components/ImageUploader";

type Props = {
  imageUrl: string;
  onUpload: (url: string) => void;
  onReplace: () => void;
};

export function ImageUploadSection({ imageUrl, onUpload, onReplace }: Props) {
  if (!imageUrl) {
    return (
      <div className="mt-6 rounded-4xl border-2 border-dashed border-pepper/30 bg-pepper/5 px-6 py-10 text-center text-pepper">
        <div className="mx-auto max-w-xs text-center">
          <ImageUploader onUpload={onUpload} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col mt-6 rounded-4xl border-2 border-dashed border-pepper/30 bg-pepper/5 px-6 py-10 text-center text-pepper items-center">
      <div className="flex w-full flex-col items-center">
        <img src={imageUrl} alt="Uploaded" className="max-h-48 max-w-full rounded-xl object-contain" />

        <button onClick={onReplace} className="mt-4 text-sm text-blue-500">
          Replace image
        </button>
      </div>
    </div>
  );
}
