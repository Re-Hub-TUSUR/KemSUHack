import { PixelCrop } from 'react-image-crop';

export async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  let cropX = crop.x * scaleX;
  let cropY = crop.y * scaleY;
  let cropWidth = crop.width * scaleX;
  let cropHeight = crop.height * scaleY;

  cropX = Math.max(0, cropX);
  cropY = Math.max(0, cropY);
  if (cropX + cropWidth > image.naturalWidth) {
    cropWidth = image.naturalWidth - cropX;
  }
  if (cropY + cropHeight > image.naturalHeight) {
    cropHeight = image.naturalHeight - cropY;
  }

  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(cropWidth * pixelRatio);
  canvas.height = Math.floor(cropHeight * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const sourceX = cropX;
  const sourceY = cropY;
  const sourceWidth = cropWidth;
  const sourceHeight = cropHeight;

  const destX = 0;
  const destY = 0;
  const destWidth = canvas.width / pixelRatio;
  const destHeight = canvas.height / pixelRatio;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX,
    destY,
    destWidth,
    destHeight
  );
}
