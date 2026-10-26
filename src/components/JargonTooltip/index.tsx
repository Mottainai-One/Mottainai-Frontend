import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./style.module.css";

interface JargonTooltipProps {
  term: string;
  explanation: string;
}

interface TooltipPosition {
  top: number;
  left: number;
}

function JargonTooltip({ term, explanation }: JargonTooltipProps) {
  const tooltipId = useId();
  const termRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const isVisible = isEnabled && (isHovered || isFocused || isPinned);

  useEffect(() => {
    const root = document.documentElement;
    const updateEnabled = () => {
      const enabled = root.getAttribute("data-a11y-jargon") === "on";
      setIsEnabled(enabled);
      if (enabled && termRef.current) {
        setIsHovered(termRef.current.matches(":hover"));
        setIsFocused(termRef.current.matches(":focus-visible"));
      }
    };

    updateEnabled();
    const observer = new MutationObserver(updateEnabled);
    observer.observe(root, { attributes: true, attributeFilter: ["data-a11y-jargon"] });
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const termElement = termRef.current;
      const tooltipElement = tooltipRef.current;
      if (!termElement || !tooltipElement) return;

      const termBounds = termElement.getBoundingClientRect();
      const tooltipBounds = tooltipElement.getBoundingClientRect();
      const gap = 8;
      const edge = 8;
      const top = termBounds.top - tooltipBounds.height - gap >= edge
        ? termBounds.top - tooltipBounds.height - gap
        : Math.min(window.innerHeight - tooltipBounds.height - edge, termBounds.bottom + gap);
      const left = Math.max(
        edge,
        Math.min(termBounds.left, window.innerWidth - tooltipBounds.width - edge),
      );
      setPosition({ top: Math.max(edge, top), left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isVisible]);

  return (
    <>
      <button
        ref={termRef}
        className={styles.term}
        type="button"
        aria-describedby={isVisible ? tooltipId : undefined}
        aria-expanded={isVisible}
        aria-controls={isVisible ? tooltipId : undefined}
        onClick={() => setIsPinned((current) => !current)}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {term}<span className={styles.indicator} aria-hidden="true"> i</span>
      </button>
      {isVisible && createPortal(
        <span
          ref={tooltipRef}
          id={tooltipId}
          className={styles.tooltip}
          role="tooltip"
          style={position ? { top: position.top, left: position.left } : undefined}
        >
          {explanation}
        </span>,
        document.body,
      )}
    </>
  );
}

export default JargonTooltip;
