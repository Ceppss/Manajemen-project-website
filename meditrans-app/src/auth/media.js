// Returns a normalized array of { name, data }. Understands the current
// multi-file JSON array format as well as the older single-object format
// (kept so any pre-existing report data still renders).
export function parseMediaList(value) {
  if (!value || value === "-") return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && item.name && item.data);
    }
    if (parsed && parsed.name && parsed.data) return [parsed];
  } catch {
    // ignore
  }
  return [];
}

// Chrome/Edge silently block top-level navigation (target="_blank", window.open)
// straight to a data: URL. Converting to a blob: URL first sidesteps that block.
export function openDataUrl(dataUrl) {
  try {
    const [meta, base64] = dataUrl.split(",");
    const mime = meta.match(/data:(.*?);base64/)?.[1] || "application/octet-stream";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
    window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch {
    window.open(dataUrl, "_blank");
  }
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function resizeImage(file, maxSize = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
