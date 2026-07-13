export interface PhotoAnalysis {
  score: number;
  label: string;
  color: string;

  brightness: number;
  sharpness: number;
  contrast: number;
  resolution: number;
  aspectRatio: number;

  tips: string[];
}

export async function analyzePhoto(
  file: File
): Promise<PhotoAnalysis> {

  return new Promise((resolve) => {

    const img = new Image();

    img.onload = () => {

      const width = img.width;
      const height = img.height;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve({
          score: 0,
          label: "Poor",
          color: "bg-red-600",
          brightness: 0,
          sharpness: 0,
          contrast: 0,
          resolution: 0,
          aspectRatio: 0,
          tips: ["Unable to analyze image."]
        });

        return;
      }

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0,
        0,
        width,
        height
      );

      const pixels = imageData.data;

      //-----------------------------------
      // Brightness
      //-----------------------------------

      let avgBrightness = 0;

      for (let i = 0; i < pixels.length; i += 4) {

        avgBrightness +=
          (pixels[i] +
            pixels[i + 1] +
            pixels[i + 2]) / 3;

      }

      avgBrightness /= pixels.length / 4;
      

      let brightnessScore = 0;

      const tips: string[] = [];

      if (avgBrightness < 60) {

        brightnessScore = 5;

        tips.push(
          "Photo is too dark. Try taking it in daylight."
        );

      }

      else if (avgBrightness < 100) {

        brightnessScore = 12;

        tips.push(
          "Lighting is acceptable but could be brighter."
        );

      }

      else if (avgBrightness < 180) {

        brightnessScore = 20;

      }

      else {

        brightnessScore = 12;

        tips.push(
          "Photo is very bright. Reduce exposure slightly."
        );

      }

      //-----------------------------------
      // Contrast
      //-----------------------------------

      let mean = avgBrightness;

      let variance = 0;

      for (let i = 0; i < pixels.length; i += 4) {

        const value =
          (pixels[i] +
            pixels[i + 1] +
            pixels[i + 2]) / 3;

        variance += Math.pow(value - mean, 2);

      }

      variance /= pixels.length / 4;

      const stdDev = Math.sqrt(variance);

      let contrastScore = 0;

      if (stdDev > 60) {

        contrastScore = 15;

      }

      else if (stdDev > 40) {

        contrastScore = 10;

      }

      else {

        contrastScore = 5;

        tips.push(
          "Image has low contrast."
        );

      }

      //-----------------------------------
      // Resolution
      //-----------------------------------

      let resolutionScore = 0;

      if (width >= 1600) {

        resolutionScore = 35;

      }

      else if (width >= 1200) {

        resolutionScore = 30;

      }

      else if (width >= 900) {

        resolutionScore = 20;

      }

      else {

        resolutionScore = 10;

        tips.push(
          "Higher resolution photos attract more buyers."
        );

      }

      //-----------------------------------
      // Aspect Ratio
      //-----------------------------------

      const ratio = width / height;

      let aspectScore = 0;

      if (ratio > 0.7 && ratio < 1.8) {

        aspectScore = 10;

      }

      else {

        aspectScore = 5;

        tips.push(
          "Try cropping the photo."
        );

      }

      //-----------------------------------
      // Temporary Sharpness
      //-----------------------------------

      const sharpnessScore = 15;

      //-----------------------------------
      // Final Score
      //-----------------------------------

      const score =
        brightnessScore +
        contrastScore +
        resolutionScore +
        aspectScore +
        sharpnessScore;

      let label = "";
      let color = "";

      if (score >= 85) {

        label = "Excellent";
        color = "bg-green-600";

      }

      else if (score >= 70) {

        label = "Good";
        color = "bg-blue-600";

      }

      else if (score >= 50) {

        label = "Average";
        color = "bg-yellow-500";

      }

      else {

        label = "Poor";
        color = "bg-red-600";

      }

      if (tips.length === 0) {

        tips.push(
          "Excellent photo quality. This image is likely to attract more buyers."
        );

      }

      resolve({

        score,

        label,

        color,

        brightness: brightnessScore,

        sharpness: sharpnessScore,

        contrast: contrastScore,

        resolution: resolutionScore,

        aspectRatio: aspectScore,

        tips

      });

    };

    img.src = URL.createObjectURL(file);

  });

}