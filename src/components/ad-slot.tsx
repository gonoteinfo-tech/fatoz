"use client";

import { useEffect, useRef } from "react";

// Renderiza um espaço de publicidade: código HTML/JS (AdSense, etc.) tem
// prioridade; senão imagem com link; se nada configurado, não exibe nada.
export function AdSlot({
  code,
  image,
  link,
  className = "",
  label,
}: {
  code?: string;
  image?: string;
  link?: string;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !code) return;
    el.innerHTML = code;
    // scripts inseridos via innerHTML não executam — recria para rodar (AdSense)
    el.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      s.text = old.textContent || "";
      old.replaceWith(s);
    });
  }, [code]);

  if (code) {
    return <div className={className} aria-label={label || "Publicidade"} ref={ref} />;
  }

  if (image) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={label || "Publicidade"} className="mx-auto block h-auto max-w-full rounded-lg" />
    );
    return (
      <div className={className}>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer sponsored">
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    );
  }

  return null;
}
