"use client";

// Spielt das Intro-Video vollformatig ab, wenn eine Sitzung startet.
// Ruft onFinished auf, sobald das Video zu Ende ist oder übersprungen wird.

export default function IntroVideo({ onFinished }: { onFinished: () => void }) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <video
        src="/intro.mp4"
        autoPlay
        playsInline
        onEnded={onFinished}
        className="max-w-full max-h-full"
      />
      <button
        onClick={onFinished}
        className="absolute bottom-6 right-6 text-sm text-zinc-300 bg-black/50 border border-zinc-600 rounded-md px-4 py-2 hover:bg-black/70 transition"
      >
        Überspringen
      </button>
    </div>
  );
}
