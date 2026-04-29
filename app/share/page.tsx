"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { Share2, Link2, Copy, Check, Download, QrCode, Eye, Globe, ExternalLink } from "lucide-react";
import SharingButtons from "@/components/SharingButtons";
import AudioPlayer from "@/components/AudioPlayer";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { useApp } from "@/contexts/AppContext";
import { buildSharedEmbedUrl, buildSharedUrl, triggerDownload } from "@/lib/sharing";

export default function SharePage() {
  const { audioHistory, showNotification } = useApp();
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const shareableRecords = useMemo(
    () => audioHistory.filter((audio) => Boolean(audio.audioUrl)),
    [audioHistory],
  );
  const activeAudioId =
    selectedAudioId && shareableRecords.some((audio) => audio.id === selectedAudioId)
      ? selectedAudioId
      : shareableRecords[0]?.id ?? null;
  const selected = shareableRecords.find((audio) => audio.id === activeAudioId) ?? null;
  const shareUrl = selected ? buildSharedUrl(selected.id) : null;
  const embedUrl = selected ? buildSharedEmbedUrl(selected.id) : null;
  const embedCode = embedUrl
    ? `<iframe src="${embedUrl}" width="100%" height="160" frameborder="0" loading="lazy"></iframe>`
    : "";

  useEffect(() => {
    let isActive = true;

    if (!shareUrl || !showQr) {
      return () => {
        isActive = false;
      };
    }

    void QRCode.toDataURL(shareUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }).then((dataUrl) => {
      if (isActive) {
        setQrCodeUrl(dataUrl);
      }
    }).catch(() => {
      if (isActive) {
        setQrCodeUrl(null);
      }
    });

    return () => {
      isActive = false;
    };
  }, [shareUrl, showQr]);

  const copyLink = async () => {
    if (!shareUrl) {
      showNotification("Choose a saved recording first.", "info");
      return;
    }

    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopiedLink(true);
    showNotification("Share link copied!", "success");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyEmbedCode = async () => {
    if (!embedCode) {
      showNotification("Choose a saved recording first.", "info");
      return;
    }

    await navigator.clipboard.writeText(embedCode).catch(() => {});
    showNotification("Embed code copied!", "success");
  };

  const downloadQrCode = () => {
    if (!qrCodeUrl || !selected) {
      showNotification("Generate the QR code first.", "info");
      return;
    }

    triggerDownload(qrCodeUrl, `${selected.id}-qr-code.png`);
  };

  if (shareableRecords.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="glass-card p-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#ec4899]/15 text-[#ec4899] flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Nothing to share yet</h1>
          <p className="text-slate-400 mb-6">
            Convert or generate an audio clip first. Saved recordings will show up here automatically.
          </p>
          <Link
            href="/record"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90"
          >
            Go to Recorder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#ec4899]/20 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-[#ec4899]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Share Audio</h1>
        </div>
        <p className="text-slate-400">Generate share links, QR codes, and embed snippets for saved recordings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="glass-card p-5">
            <h2 className="text-slate-200 font-semibold mb-4">Select Audio to Share</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {shareableRecords.map((audio) => (
                <button
                  key={audio.id}
                  onClick={() => setSelectedAudioId(audio.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selected?.id === audio.id
                      ? "border-[#ec4899] bg-[#ec4899]/8"
                      : "border-white/8 bg-white/3 hover:border-white/15"
                  }`}
                >
                  <div className={`text-sm font-medium ${selected?.id === audio.id ? "text-[#ec4899]" : "text-slate-200"}`}>
                    {audio.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {audio.originalAccent}
                    {" -> "}
                    {audio.targetAccent}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <AudioPlayer
            src={selected?.audioUrl}
            label={selected?.title ?? "Saved Recording"}
            accent={selected?.targetAccent}
            waveformData={selected?.waveformData}
            accentColor="#ec4899"
            showDownload
          />
        </div>

        <div className="space-y-5">
          <div className="glass-card p-5">
            <h2 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#ec4899]" />
              Share Link
            </h2>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0d0d1a] border border-white/8 mb-3">
              <Globe className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-sm font-mono text-slate-300 flex-1 truncate">{shareUrl}</span>
              <button
                onClick={copyLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  copiedLink
                    ? "bg-green-500/15 text-green-400 border border-green-500/25"
                    : "bg-[#ec4899]/15 text-[#ec4899] border border-[#ec4899]/25 hover:bg-[#ec4899]/25"
                }`}
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedLink ? "Copied!" : "Copy"}
              </button>
            </div>

            {selected && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/shared/${selected.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/8 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open shared page
                </Link>
                <button
                  onClick={copyEmbedCode}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#a5b4fc] hover:bg-[#6366f1]/15 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Copy embed code
                </button>
              </div>
            )}
          </div>

          <SharingButtons audioId={selected?.id ?? null} title={selected?.title ?? "Tone Weaver Recording"} />

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-200 font-semibold flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#8b5cf6]" />
                QR Code
              </h2>
              <button
                onClick={() => setShowQr((value) => !value)}
                className="text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
              >
                {showQr ? "Hide" : "Show"}
              </button>
            </div>
            {showQr && (
              <div className="flex flex-col items-center gap-3 fade-in">
                {qrCodeUrl ? (
                  <Image
                    src={qrCodeUrl}
                    alt={`QR code for ${selected?.title ?? "shared audio"}`}
                    width={180}
                    height={180}
                    unoptimized
                    className="rounded-xl bg-white p-3"
                  />
                ) : (
                  <div className="w-[180px] h-[180px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm text-slate-500">
                    Generating QR code...
                  </div>
                )}
                <p className="text-xs text-slate-500 text-center">Scan to open the shared page on any device</p>
                <button
                  onClick={downloadQrCode}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/25 text-[#8b5cf6] text-xs font-medium hover:bg-[#8b5cf6]/25 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download QR Code
                </button>
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <h2 className="text-slate-200 font-semibold flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-[#6366f1]" />
              Embed Code
            </h2>
            <div className="p-3 rounded-xl bg-[#0d0d1a] border border-white/8">
              <code className="text-xs text-[#a5b4fc] font-mono break-all">{embedCode}</code>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 glass-card p-5">
        <h2 className="text-slate-200 font-semibold mb-4">Share Preview</h2>
        <div className="p-4 rounded-xl bg-[#0d0d1a] border border-white/8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#ec4899] flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-slate-200 font-semibold">{selected?.title}</div>
              <div className="text-xs text-slate-500">
                {selected?.originalAccent}
                {" -> "}
                {selected?.targetAccent}
                {" • via Tone Weaver"}
              </div>
            </div>
          </div>
          <WaveformVisualizer
            data={selected?.waveformData}
            color="#6366f1"
            secondaryColor="#ec4899"
            height={48}
            type="bars"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
            <span>{shareUrl}</span>
            <span>Tap to play</span>
          </div>
        </div>
      </div>
    </div>
  );
}
