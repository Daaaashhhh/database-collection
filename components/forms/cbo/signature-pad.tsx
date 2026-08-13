"use client";

import { useEffect, useRef } from "react";

type SignaturePadProps = {
  name: string;
  value?: string;
  readOnly?: boolean;
  onChange?: (dataUrl: string) => void;
};

function drawImageOnCanvas(
  canvas: HTMLCanvasElement,
  dataUrl: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, rect.width, rect.height);

  if (!dataUrl) return;

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, rect.width, rect.height);
  };
  img.src = dataUrl;
}

function setupCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, rect.width, rect.height);
  return ctx;
}

export function SignaturePad({
  name,
  value = "",
  readOnly = false,
  onChange,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || readOnly) return;
    setupCanvas(canvas);
    drawImageOnCanvas(canvas, value);
  }, [value, readOnly]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || readOnly) return;
    input.value = value;
  }, [value, readOnly]);

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function persistCanvas() {
    const canvas = canvasRef.current;
    const input = inputRef.current;
    if (!canvas || !input) return;
    const dataUrl = canvas.toDataURL("image/png");
    input.value = dataUrl;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    onChange?.(dataUrl);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (readOnly) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || readOnly) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || readOnly) return;
    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
    persistCanvas();
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const input = inputRef.current;
    if (!canvas || !input) return;
    setupCanvas(canvas);
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    onChange?.("");
  }

  if (readOnly) {
    if (!value) {
      return (
        <div
          className="flex h-28 items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 text-[11px] text-zinc-500"
          aria-hidden
        >
          No signature
        </div>
      );
    }
    return (
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Signature"
          className="h-28 w-full border border-zinc-300 bg-white object-contain"
        />
        <input type="hidden" name={name} value={value} readOnly />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <canvas
        ref={canvasRef}
        className="h-28 w-full touch-none cursor-crosshair border border-zinc-400 bg-white"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label="Draw signature"
      />
      <input ref={inputRef} type="hidden" name={name} value={value} readOnly />
      <button
        type="button"
        onClick={handleClear}
        className="text-[11px] text-zinc-600 underline hover:text-zinc-900"
      >
        Clear signature
      </button>
    </div>
  );
}
