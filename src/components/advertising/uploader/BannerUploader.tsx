import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdvertisingService } from "@/services/advertising";

interface BannerUploaderProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function BannerUploader({
  value,
  onChange,
}: BannerUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const imageUrl =
        await AdvertisingService.uploadBannerImage(file);

      onChange(imageUrl);
    } catch (error) {
      console.error(error);
      alert("Failed to upload banner.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="
          border-2
          border-dashed
          rounded-xl
          p-6
          flex
          flex-col
          items-center
          justify-center
          gap-4
          bg-muted/20
        "
      >
        {value ? (
          <img
            src={value}
            alt="Banner Preview"
            className="
              w-full
              max-h-64
              rounded-lg
              object-cover
            "
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-12 w-12" />
            <span>No banner uploaded</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleUpload}
        />

        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Banner
            </>
          )}
        </Button>
      </div>
    </div>
  );
}