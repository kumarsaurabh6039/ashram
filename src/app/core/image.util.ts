const toBase64 = (b: Blob) => new Promise<string>((res, rej) => {
  const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] ?? ''); r.onerror = () => rej(new Error('File padh nahi payi.')); r.readAsDataURL(b);
});

/**
 * Shrinks a photo in the browser (longest side <= 1600 px, JPEG, under ~700 KB) so it fits in Firestore and loads fast on phones.
 * Honours the camera's rotation. HEIC (some iPhones) is not readable by browsers - export as JPG first.
 */
export async function shrinkImage(file: File, maxSide = 1600, maxBytes = 700 * 1024): Promise<{ mime: string; data: string }> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name}: sirf JPG, PNG ya WEBP photo chalegi.`);
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions); }
  catch { throw new Error(`${file.name}: photo khul nahi payi.`); }
  let side = maxSide, q = 0.86;
  for (let i = 0; i < 14; i++) {
    const k = Math.min(1, side / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', q));
    if (blob && blob.size <= maxBytes) { bmp.close?.(); return { mime: 'image/jpeg', data: await toBase64(blob) }; }
    if (q > 0.62) q -= 0.08; else side = Math.round(side * 0.85);
  }
  bmp.close?.(); throw new Error(`${file.name}: photo bahut badi hai.`);
}
