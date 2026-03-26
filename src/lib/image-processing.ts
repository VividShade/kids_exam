export const IMAGE_UPLOAD_LIMITS = {
  maxCount: 6,
  maxImageBytes: 3 * 1024 * 1024,
  maxTotalBytesHard: 18 * 1024 * 1024,
  maxLongEdge: 2560,
  maxMegapixels: 8_000_000,
  thumbLongEdge: 480,
  qualitySteps: [0.86, 0.8, 0.74, 0.68] as const,
};

export type UploadImagePayload = {
  originalBase64: string;
  thumbnailBase64: string;
  width: number;
  height: number;
  thumbWidth: number;
  thumbHeight: number;
  sizeBytes: number;
};

export type CompressedUploadImage = {
  originalInput: string;
  thumbnailPreview: string;
  uploadPayload: UploadImagePayload;
};

function getScaledDimensions(width: number, height: number, longEdgeLimit: number, pixelLimit: number) {
  let targetWidth = width;
  let targetHeight = height;
  const longEdge = Math.max(width, height);
  if (longEdge > longEdgeLimit) {
    const ratio = longEdgeLimit / longEdge;
    targetWidth = Math.round(width * ratio);
    targetHeight = Math.round(height * ratio);
  }
  const pixels = targetWidth * targetHeight;
  if (pixels > pixelLimit) {
    const ratio = Math.sqrt(pixelLimit / pixels);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }
  return { width: Math.max(1, targetWidth), height: Math.max(1, targetHeight) };
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image.'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode image.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to convert blob.'));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBase64(dataUrl: string) {
  const [, base64] = dataUrl.split(',');
  return base64 ?? '';
}

function drawResized(image: HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas context unavailable.');
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

export async function compressImageForUpload(file: File): Promise<CompressedUploadImage> {
  const image = await loadImage(file);
  const scaled = getScaledDimensions(
    image.naturalWidth,
    image.naturalHeight,
    IMAGE_UPLOAD_LIMITS.maxLongEdge,
    IMAGE_UPLOAD_LIMITS.maxMegapixels,
  );
  let canvas = drawResized(image, scaled.width, scaled.height);
  let chosenBlob: Blob | null = null;

  for (const quality of IMAGE_UPLOAD_LIMITS.qualitySteps) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= IMAGE_UPLOAD_LIMITS.maxImageBytes) {
      chosenBlob = blob;
      break;
    }
    chosenBlob = blob;
  }

  if (!chosenBlob) {
    throw new Error('Failed to compress image.');
  }

  let currentBlob = chosenBlob;
  let currentWidth = scaled.width;
  let currentHeight = scaled.height;
  while (currentBlob.size > IMAGE_UPLOAD_LIMITS.maxImageBytes && currentWidth > 640 && currentHeight > 640) {
    currentWidth = Math.round(currentWidth * 0.9);
    currentHeight = Math.round(currentHeight * 0.9);
    canvas = drawResized(image, currentWidth, currentHeight);
    currentBlob = await canvasToBlob(canvas, IMAGE_UPLOAD_LIMITS.qualitySteps[IMAGE_UPLOAD_LIMITS.qualitySteps.length - 1]);
  }

  if (currentBlob.size > IMAGE_UPLOAD_LIMITS.maxImageBytes) {
    throw new Error('Image is too large after compression. Try a smaller image.');
  }

  const thumbScaled = getScaledDimensions(
    currentWidth,
    currentHeight,
    IMAGE_UPLOAD_LIMITS.thumbLongEdge,
    IMAGE_UPLOAD_LIMITS.thumbLongEdge * IMAGE_UPLOAD_LIMITS.thumbLongEdge,
  );
  const thumbCanvas = drawResized(image, thumbScaled.width, thumbScaled.height);
  const thumbBlob = await canvasToBlob(thumbCanvas, 0.72);
  const originalDataUrl = await blobToDataUrl(currentBlob);
  const thumbnailDataUrl = await blobToDataUrl(thumbBlob);

  return {
    originalInput: originalDataUrl,
    thumbnailPreview: thumbnailDataUrl,
    uploadPayload: {
      originalBase64: dataUrlToBase64(originalDataUrl),
      thumbnailBase64: dataUrlToBase64(thumbnailDataUrl),
      width: currentWidth,
      height: currentHeight,
      thumbWidth: thumbScaled.width,
      thumbHeight: thumbScaled.height,
      sizeBytes: currentBlob.size,
    },
  };
}
