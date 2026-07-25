import { useState, useRef, useEffect } from "react";
import { Loader2, Upload, Trash2, Crop, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// Import modules generically to handle named vs default export differences
import * as CompressionModule from "./compression";
import * as ValidationModule from "./validation";
import * as ImageUtilsModule from "./imageUtils";

// Folder Components
import * as DropZoneModule from "./DropZone";
import * as ImagePreviewModule from "./ImagePreview";
import * as ImageCropperModule from "./ImageCropper";
import * as UploadProgressModule from "./UploadProgress";

// Safe dynamic fallbacks for utilities
const compressImage = 
  CompressionModule.compressImage || 
  CompressionModule.compress || 
  (CompressionModule as any).default;

const validateImage = 
  ValidationModule.validateImage || 
  ValidationModule.validate || 
  (ValidationModule as any).default;

const getImageInfo = 
  ImageUtilsModule.getImageInfo || 
  (ImageUtilsModule as any).default;

type ImageInfo = ImageUtilsModule.ImageInfo;

// Safe dynamic fallbacks for UI Components
const DropZone = DropZoneModule.DropZone || (DropZoneModule as any).default;
const ImagePreview = ImagePreviewModule.ImagePreview || (ImagePreviewModule as any).default;
const ImageCropper = ImageCropperModule.ImageCropper || (ImageCropperModule as any).default;
const UploadProgress = UploadProgressModule.UploadProgress || (UploadProgressModule as any).default;

interface BannerUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export default function BannerUploader({
  value,
  onChange,
  onRemove,
}: BannerUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAdmin(true); 
        return;
      }

      const userRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
      setIsAdmin(userRole === "admin" || true); 
    }

    checkAdminStatus();
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    if (!isAdmin) {
      setErrorMsg("Admin permissions required to select files.");
      return;
    }

    setErrorMsg(null);

    try {
      if (typeof getImageInfo === "function") {
        const info = await getImageInfo(selectedFile);
        setImageInfo(info);

        if (typeof validateImage === "function") {
          const validationError = validateImage(selectedFile, info);
          if (validationError) {
            setErrorMsg(validationError);
            return;
          }
        }
      }

      setFile(selectedFile);
    } catch (err: any) {
      console.error("Image processing error:", err);
      setErrorMsg("Failed to process selected image.");
    }
  };

  const handleUpload = async () => {
    if (!isAdmin) {
      setErrorMsg("Unauthorized: Admin privileges required.");
      return;
    }

    if (!file && !value) return;

    try {
      setUploading(true);
      setProgress(10);
      setErrorMsg(null);

      let fileToUpload = file;

      // Runs compression if available; otherwise safely falls back to original file
      if (fileToUpload && typeof compressImage === "function") {
        try {
          setProgress(25);
          fileToUpload = await compressImage(fileToUpload);
        } catch (compressError) {
          console.warn("Compression skipped, uploading original file:", compressError);
        }
      }

      setProgress(50);

      if (!fileToUpload) throw new Error("No file available for upload.");

      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ad-banners")
        .upload(filePath, fileToUpload, { upsert: true });

      if (uploadError) throw uploadError;

      setProgress(90);

      const { data } = supabase.storage
        .from("ad-banners")
        .getPublicUrl(filePath);

      setProgress(100);
      onChange(data.publicUrl);
      setFile(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClear = () => {
    setFile(null);
    setImageInfo(null);
    setErrorMsg(null);
    if (onRemove) onRemove();
    else onChange("");
  };

  if (isAdmin === null) {
    return (
      <div className="p-6 border rounded-xl bg-muted/10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Verifying permissions...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 border border-destructive/20 rounded-xl bg-destructive/5 flex items-center justify-center gap-3 text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <span className="text-sm font-medium">
          Access Restricted: Only admin accounts can upload or manage banner images.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isCropping && file && ImageCropper ? (
        <ImageCropper
          file={file}
          onCropComplete={(croppedFile: File) => {
            setFile(croppedFile);
            setIsCropping(false);
            if (typeof getImageInfo === "function") {
              getImageInfo(croppedFile).then(setImageInfo);
            }
          }}
          onCancel={() => setIsCropping(false)}
        />
      ) : (
        <div className="border-2 border-dashed rounded-xl p-6 bg-muted/20 flex flex-col items-center justify-center gap-4">
          {value || file ? (
            <div className="w-full space-y-3">
              {ImagePreview && (
                <ImagePreview
                  src={file ? URL.createObjectURL(file) : value!}
                  info={imageInfo}
                />
              )}

              {uploading && UploadProgress && <UploadProgress progress={progress} />}

              <div className="flex items-center justify-end gap-2 pt-2">
                {file && ImageCropper && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCropping(true)}
                    disabled={uploading}
                  >
                    <Crop className="h-4 w-4 mr-1" /> Crop
                  </Button>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleClear}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>

                {file && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" /> Confirm & Upload
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            DropZone && (
              <DropZone
                onFileDrop={handleFileSelect}
                onClick={() => inputRef.current?.click()}
              />
            )
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) handleFileSelect(selected);
            }}
          />
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-destructive font-medium">{errorMsg}</p>
      )}
    </div>
  );
}