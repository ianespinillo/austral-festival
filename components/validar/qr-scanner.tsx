"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Loader2, CameraOff } from "lucide-react";

export function QrScanner({
  onResult,
}: {
  onResult: (code: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempting, setAttempting] = useState(true);
  const stopRef = useRef(false);

  useEffect(() => {
    let animationFrame = 0;

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("getUserMedia no disponible");
        }

        const mediaStream = await Promise.race([
          navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Tiempo de espera agotado al acceder a la cámara")),
              10_000
            )
          ),
        ]);
        if (stopRef.current) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(mediaStream);
        setAttempting(false);

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = mediaStream;
        await video.play();

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const tick = () => {
          if (stopRef.current || video.readyState !== video.HAVE_ENOUGH_DATA) {
            animationFrame = requestAnimationFrame(tick);
            return;
          }
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          if (code && code.data) {
            stop();
            onResult(code.data);
            return;
          }
          animationFrame = requestAnimationFrame(tick);
        };

        animationFrame = requestAnimationFrame(tick);
      } catch (e) {
        console.error("[QrScanner]", e);
        setAttempting(false);
        const msg = e instanceof Error ? e.message : "";
        const isPermission =
          msg.includes("Permission") ||
          msg.includes("NotAllowed") ||
          msg.includes("denied");
        setError(
          isPermission
            ? "Permiso de cámara denegado. Habilitalo en la configuración del browser y recargá la página."
            : "No se pudo acceder a la cámara. Usá la búsqueda por DNI o ingresá el código a mano."
        );
      }
    }

    function stop() {
      stopRef.current = true;
      cancelAnimationFrame(animationFrame);
      stream?.getTracks().forEach((t) => t.stop());
    }

    start();

    return () => {
      stopRef.current = true;
      cancelAnimationFrame(animationFrame);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
        <CameraOff className="h-8 w-8 text-muted-foreground" />
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-black">
      <video
        ref={videoRef}
        className="aspect-square w-full object-cover"
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />
      {attempting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Iniciando cámara…</p>
        </div>
      )}
      {!attempting && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex justify-center">
          <div className="h-52 w-52 rounded-2xl border-2 border-white/80" />
        </div>
      )}
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/80">
        Apuntá la cámara hacia el código QR de la entrada
      </p>
    </div>
  );
}