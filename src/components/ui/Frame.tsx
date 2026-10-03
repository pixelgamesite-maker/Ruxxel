import { useState } from "react";

/**
 * Pixel-art tile with CRT lines. If the file is missing it either renders a
 * labelled placeholder (`placeholder`) or nothing (`optional`), so a
 * not-yet-supplied image never leaves a broken-image icon on the page.
 */
export function Frame({
  src,
  alt,
  placeholder,
  optional,
  eager,
  onMissing,
  className = "",
}: {
  src: string;
  alt: string;
  placeholder?: string;
  optional?: boolean;
  eager?: boolean;
  /** Called once if the file cannot be loaded. */
  onMissing?: () => void;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed && optional) return null;

  return (
    <span className={`frame scan ${className}`}>
      {failed ? (
        <span className="placeholder">{placeholder ?? "Art pending"}</span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => {
            setFailed(true);
            onMissing?.();
          }}
          draggable={false}
        />
      )}
    </span>
  );
}
