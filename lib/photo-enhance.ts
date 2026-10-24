/** Local unsharp mask. Applied to the photo only, before typography and branding. */
export function sharpenPhoto(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
  if (amount <= 0) return;
  const source = ctx.getImageData(0, 0, width, height);
  const src = source.data;
  const out = new Uint8ClampedArray(src);
  const strength = Math.min(1.5, Math.max(0, amount));
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const k = i + c;
        const blurred = (src[k] * 4 + (src[k - 4] + src[k + 4] + src[k - width * 4] + src[k + width * 4]) * 2 + src[k - width * 4 - 4] + src[k - width * 4 + 4] + src[k + width * 4 - 4] + src[k + width * 4 + 4]) / 16;
        const detail = src[k] - blurred;
        // Threshold suppresses tiny compression noise; clamp limits ringing.
        out[k] = src[k] + (Math.abs(detail) > 2 ? Math.max(-32, Math.min(32, detail * strength)) : 0);
      }
    }
  }
  ctx.putImageData(new ImageData(out, width, height), 0, 0);
}
