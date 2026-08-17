"use client";

import { useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { signatureToTransparentPng } from "@/lib/cbo/signature-png-client";

type SignaturePadProps = {
  name: string;
  value?: string;
  readOnly?: boolean;
  onChange?: (dataUrl: string) => void;
};

type SignatureCanvasRef = SignatureCanvas | null;

export function SignaturePad({
  name,
  value = "",
  readOnly = false,
  onChange,
}: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvasRef>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const syncedValueRef = useRef(value);

  useEffect(() => {
    if (readOnly) return;

    const pad = sigRef.current;
    if (!pad) return;
    if (value === syncedValueRef.current) return;

    syncedValueRef.current = value;

    if (!value) {
      pad.clear();
      return;
    }

    pad.fromDataURL(value, {
      ratio: Math.max(window.devicePixelRatio || 1, 1),
    });
  }, [value, readOnly]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || readOnly) return;
    input.value = value;
  }, [value, readOnly]);

  function persistSignature() {
    const pad = sigRef.current;
    const input = inputRef.current;
    if (!pad || !input) return;

    if (pad.isEmpty()) {
      syncedValueRef.current = "";
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      onChange?.("");
      return;
    }

    const dataUrl = pad.toDataURL("image/png");
    void signatureToTransparentPng(dataUrl).then((transparent) => {
      syncedValueRef.current = transparent;
      input.value = transparent;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      onChange?.(transparent);
    });
  }

  function handleClear() {
    const pad = sigRef.current;
    const input = inputRef.current;
    if (!pad || !input) return;

    pad.clear();
    syncedValueRef.current = "";
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    onChange?.("");
  }

  if (readOnly) {
    if (!value) {
      return (
        <div
          className="flex h-36 items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 text-[11px] text-zinc-500"
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
          className="h-36 w-full border border-zinc-300 bg-transparent object-contain"
        />
        <input type="hidden" name={name} value={value} readOnly />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <SignatureCanvas
        ref={sigRef}
        clearOnResize={false}
        penColor="#000000"
        minWidth={0.8}
        maxWidth={2.8}
        velocityFilterWeight={0.7}
        minDistance={2}
        throttle={8}
        onEnd={persistSignature}
        canvasProps={{
          className:
            "h-36 w-full touch-none cursor-crosshair border border-zinc-400 bg-white",
          "aria-label": "Draw signature",
        }}
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
