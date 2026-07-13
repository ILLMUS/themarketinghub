// src/components/advertising/uploader/imageUtils.ts

import {
  RECOMMENDED_WIDTH,
  RECOMMENDED_HEIGHT,
} from "./validation";

export interface ImageInfo {
  width: number;
  height: number;

  aspectRatio: number;

  orientation: "landscape" | "portrait" | "square";

  recommended: boolean;

  fileSize: number;

  fileSizeMB: number;
}

export function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const width = img.width;
        const height = img.height;

        let orientation: ImageInfo["orientation"] = "landscape";

        if (width === height) {
          orientation = "square";
        } else if (height > width) {
          orientation = "portrait";
        }

        resolve({
          width,
          height,

          aspectRatio: Number((width / height).toFixed(2)),

          orientation,

          recommended:
            width === RECOMMENDED_WIDTH &&
            height === RECOMMENDED_HEIGHT,

          fileSize: file.size,

          fileSizeMB: Number(
            (file.size / 1024 / 1024).toFixed(2)
          ),
        });
      };

      img.onerror = () => {
        reject(new Error("Unable to read image."));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Unable to read file."));
    };

    reader.readAsDataURL(file);
  });
}