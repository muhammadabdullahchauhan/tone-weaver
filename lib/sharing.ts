export function getAppOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function buildSharedUrl(audioId: string) {
  return `${getAppOrigin()}/shared/${audioId}`;
}

export function buildSharedEmbedUrl(audioId: string) {
  return `${buildSharedUrl(audioId)}/embed`;
}

export function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
}
