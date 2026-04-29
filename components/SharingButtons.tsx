"use client";

import { useState } from "react";
import { Link, Copy, Twitter, Facebook, Linkedin, Check, Share2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { buildSharedUrl } from "@/lib/sharing";

interface SharingButtonsProps {
  audioId?: string | null;
  title?: string;
  compact?: boolean;
}

export default function SharingButtons({
  audioId = null,
  title = "My Tone Weaver Recording",
  compact = false,
}: SharingButtonsProps) {
  const { showNotification } = useApp();
  const [copied, setCopied] = useState(false);
  const shareUrl = audioId ? buildSharedUrl(audioId) : null;

  const copyLink = async () => {
    if (!shareUrl) {
      showNotification("Save a recording before sharing it.", "info");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showNotification("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showNotification("Could not copy - try manually", "error");
    }
  };

  const share = (platform: string) => {
    if (!shareUrl) {
      showNotification("Save a recording before sharing it.", "info");
      return;
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };
    const targetUrl = urls[platform];

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      showNotification(`Opened ${platform} share`, "success");
      return;
    }

    if (platform === "native" && navigator.share) {
      navigator
        .share({ title, text: title, url: shareUrl })
        .then(() => showNotification("Shared successfully", "success"))
        .catch(() => showNotification("Share canceled", "info"));
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={copyLink}
          disabled={!shareUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 text-xs transition-all disabled:opacity-40 disabled:hover:text-slate-400"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={() => share("twitter")}
          disabled={!shareUrl}
          className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all disabled:opacity-40"
          title="Share on Twitter"
        >
          <Twitter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => share("linkedin")}
          disabled={!shareUrl}
          className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-all disabled:opacity-40"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Share2 className="w-4 h-4 text-[#6366f1]" />
        <h4 className="text-slate-200 font-semibold">Share Recording</h4>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/8">
        <Link className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="text-sm text-slate-400 truncate flex-1 font-mono">
          {shareUrl ?? "No share link yet"}
        </span>
        <button
          onClick={copyLink}
          disabled={!shareUrl}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            copied
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30 hover:bg-[#6366f1]/25"
          } disabled:opacity-40`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => share("twitter")}
          disabled={!shareUrl}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-sky-500/8 border border-sky-500/20 text-sky-400 hover:bg-sky-500/15 transition-all group disabled:opacity-40"
        >
          <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">Twitter</span>
        </button>
        <button
          onClick={() => share("facebook")}
          disabled={!shareUrl}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-600/8 border border-blue-600/20 text-blue-400 hover:bg-blue-600/15 transition-all group disabled:opacity-40"
        >
          <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">Facebook</span>
        </button>
        <button
          onClick={() => share("linkedin")}
          disabled={!shareUrl}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-700/8 border border-blue-700/20 text-blue-300 hover:bg-blue-700/15 transition-all group disabled:opacity-40"
        >
          <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">LinkedIn</span>
        </button>
      </div>

      <p className="text-xs text-slate-600 text-center">
        {shareUrl ? "Shareable link is ready to copy and send." : "Save a recording to unlock sharing."}
      </p>
    </div>
  );
}
