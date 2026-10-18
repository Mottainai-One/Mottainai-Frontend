import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { AccessibilityPreferences, AccessibilityPreferenceKey, AccessibilityWidgetState } from "@/types/accessibility.types";
import type { ChoiceGroupProps } from "@/types/accessibility-widget.types";
import { DEFAULT_ACCESSIBILITY_PREFERENCES, loadAccessibilityPreferences, saveAccessibilityPreferences } from "@/utils/accessibilityPreferences";
import styles from "./style.module.css";

function ChoiceGroup({ id, legend, value, options, onChange }: ChoiceGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend>{legend}</legend>
      <div className={styles.choices}>
        {options.map(([optionValue, label]) => {
          const selected = String(value) === String(optionValue);
          return (
            <label className={styles.choice} htmlFor={`${id}-${optionValue}`} key={optionValue}>
              <input
                id={`${id}-${optionValue}`}
                type="radio"
                name={id}
                value={optionValue}
                checked={selected}
                onChange={(event) => onChange(event.currentTarget.value)}
              />
              <span>
                {label}
                {selected && <span className={styles.selectedTag} aria-hidden="true">Selecionado</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function FloatingButton() {
  const id = useId();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(loadAccessibilityPreferences);
  const [widgetState, setWidgetState] = useState<AccessibilityWidgetState>({
    isOpen: false,
    isReading: false,
    statusMessage: "",
    statusIsError: false,
  });
  const panelTitleRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const { isOpen, isReading, statusMessage, statusIsError } = widgetState;
  const setIsOpen = useCallback((value: boolean) => setWidgetState((current) => ({ ...current, isOpen: value })), []);
  const setIsReading = useCallback((value: boolean) => setWidgetState((current) => ({ ...current, isReading: value })), []);
  const setStatusMessage = useCallback((value: string) => setWidgetState((current) => ({ ...current, statusMessage: value })), []);
  const setStatusIsError = useCallback((value: boolean) => setWidgetState((current) => ({ ...current, statusIsError: value })), []);

  const updatePreference = useCallback(<K extends AccessibilityPreferenceKey>(key: K, value: AccessibilityPreferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  }, []);

  useEffect(() => {
    saveAccessibilityPreferences(preferences);
    const root = document.documentElement;
    const rootStyles = root.style;
    const attrs: Record<string, string | undefined> = {
      "data-a11y-theme": preferences.theme === "dark" ? "dark" : undefined,
      "data-a11y-contrast": preferences.contrast === "normal" ? undefined : preferences.contrast,
      "data-a11y-saturation": preferences.saturation === "normal" ? undefined : preferences.saturation,
      "data-a11y-color-vision": preferences.colorVision === "off" ? undefined : `${id}-${preferences.colorVision}`,
      "data-a11y-jargon": preferences.jargonSupport ? "on" : undefined,
      "data-a11y-font": preferences.font === "default" ? undefined : preferences.font,
      "data-a11y-spacing": preferences.spacing > 0 ? "on" : undefined,
      "data-a11y-motion": preferences.motion ? String(preferences.motion) : undefined,
      "data-a11y-border": preferences.border ? String(preferences.border) : undefined,
      "data-a11y-underline": preferences.underline ? "on" : undefined,
      "data-a11y-align": preferences.align ? "on" : undefined,
      "data-a11y-targets": preferences.targets ? "on" : undefined,
      "data-a11y-spotlight": preferences.spotlight === "off" ? undefined : preferences.spotlight,
      "data-a11y-zoom": preferences.textScale ? "on" : undefined,
      "data-a11y-cursor": preferences.cursorColor !== "default" || preferences.cursorSize !== "default" ? "on" : undefined,
    };
    Object.entries(attrs).forEach(([name, value]) => value ? root.setAttribute(name, value) : root.removeAttribute(name));
    rootStyles.setProperty("--a11y-spacing", String(preferences.spacing));
    const textZoom = (100 + preferences.textScale * 10) / 100;
    rootStyles.setProperty("--a11y-zoom", String(textZoom));
    rootStyles.setProperty("--a11y-zoom-inverse", String(1 / textZoom));
    rootStyles.setProperty("--a11y-cursor", getCursorValue(preferences.cursorColor, preferences.cursorSize));
    rootStyles.setProperty("--a11y-color-vision-filter", preferences.colorVision === "off" ? "none" : `url(#${id}-${preferences.colorVision})`);
    return () => {
      Object.keys(attrs).forEach((name) => root.removeAttribute(name));
      ["--a11y-spacing", "--a11y-zoom", "--a11y-zoom-inverse", "--a11y-cursor", "--a11y-color-vision-filter"].forEach((name) => rootStyles.removeProperty(name));
    };
  }, [preferences, id]);

  useEffect(() => {
    if (isOpen) panelTitleRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        if (isOpen) triggerRef.current?.focus();
        setIsOpen(!isOpen);
      } else if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (preferences.spotlight === "off") return;
    const moveSpotlight = (x: number, y: number) => {
      const overlay = spotlightRef.current;
      if (overlay) {
        overlay.style.setProperty("--a11y-x", `${x}px`);
        overlay.style.setProperty("--a11y-y", `${y}px`);
      }
    };
    const onPointer = (event: PointerEvent) => moveSpotlight(event.clientX, event.clientY);
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.closest(".a11y-widget")) return;
      const bounds = target.getBoundingClientRect();
      moveSpotlight(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("focusin", onFocus);
    moveSpotlight(window.innerWidth / 2, window.innerHeight / 2);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [preferences.spotlight]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function choose<K extends AccessibilityPreferenceKey>(key: K, value: string) {
    updatePreference(key, value as AccessibilityPreferences[K]);
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setStatusMessage("Seu navegador não oferece leitura em voz alta.");
      setStatusIsError(true);
      return;
    }
    window.speechSynthesis.cancel();
    const parts = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
    const chunks: string[] = [];
    let current = "";
    parts.forEach((part) => {
      if (current && (current + part).length > 220) {
        chunks.push(current.trim());
        current = part;
      } else current += part;
    });
    if (current.trim()) chunks.push(current.trim());
    if (chunks.length === 0) {
      setStatusMessage("Não há texto disponível para leitura.");
      setStatusIsError(true);
      return;
    }
    const language = document.documentElement.lang || "pt-BR";
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = language;
      utterance.rate = preferences.rate;
      if (index === chunks.length - 1) {
        utterance.onend = () => {
          setIsReading(false);
          setStatusMessage("Leitura concluída.");
          setStatusIsError(false);
        };
        utterance.onerror = () => {
          setIsReading(false);
          setStatusMessage("O navegador não conseguiu concluir a leitura.");
          setStatusIsError(true);
        };
      }
      window.speechSynthesis.speak(utterance);
    });
    setIsReading(chunks.length > 0);
    setStatusMessage("Leitura iniciada.");
    setStatusIsError(false);
  }

  function readPage() {
    const main = document.querySelector<HTMLElement>("main, [role='main']");
    const text = (main ?? document.body).innerText.replace(/\s+/g, " ").trim();
    speak(text);
  }

  function readSelection() {
    const text = window.getSelection()?.toString().replace(/\s+/g, " ").trim() ?? "";
    if (!text) {
      setStatusMessage("Selecione um trecho de texto na página e tente novamente.");
      setStatusIsError(true);
      return;
    }
    speak(text);
  }

  function resetPreferences() {
    setPreferences({ ...DEFAULT_ACCESSIBILITY_PREFERENCES });
    window.speechSynthesis?.cancel();
    setIsReading(false);
    setStatusMessage("Preferências restauradas.");
    setStatusIsError(false);
  }

  const textPercent = 100 + preferences.textScale * 10;

  return (
    <>
      <svg className={styles.filterDefs} aria-hidden="true" focusable="false">
        <defs>
          <filter id={`${id}-protanopia`}><feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" /></filter>
          <filter id={`${id}-deuteranopia`}><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" /></filter>
          <filter id={`${id}-tritanopia`}><feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" /></filter>
        </defs>
      </svg>
      {preferences.spotlight !== "off" && (
        <div ref={spotlightRef} className={`a11y-spotlight ${styles.spotlight}`} aria-hidden="true" data-mode={preferences.spotlight} />
      )}
      <div className={`a11y-widget ${styles.widget}`} data-open={isOpen}>
        <button
          ref={triggerRef}
          className={styles.trigger}
          type="button"
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
          aria-keyshortcuts="Alt+Shift+A"
          aria-label={isOpen ? "Fechar preferências de acessibilidade" : "Abrir preferências de acessibilidade"}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="4.5" r="2" fill="currentColor" />
            <path d="M4 8.2c2.4-1.5 5-2.2 8-2.2s5.6.7 8 2.2l-1.2 2c-1.6-1-3.3-1.6-5.1-1.8v4.1l3.8 7.2-2.1 1.1-3.4-6.2-3.4 6.2-2.1-1.1 3.8-7.2V10c-1.8.2-3.5.8-5.1 1.8z" fill="currentColor" />
          </svg>
          <span>Acessibilidade</span>
        </button>

        <section
          className={styles.panel}
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-title`}
          aria-hidden={!isOpen}
          data-open={isOpen}
          inert={!isOpen}
        >
            <header className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>Preferências</p>
                <h2 id={`${id}-title`} ref={panelTitleRef} tabIndex={-1}>Acessibilidade</h2>
              </div>
              <button className={styles.close} type="button" aria-label="Fechar preferências de acessibilidade" onClick={() => { setIsOpen(false); triggerRef.current?.focus(); }}>×</button>
            </header>
            <p className={styles.intro}>As escolhas valem para todas as páginas e ficam salvas neste navegador.</p>
            <div className={styles.panelContent}>
              <h3>Cores</h3>
              <ChoiceGroup id={`${id}-theme`} legend="Tema" value={preferences.theme} options={[["light", "Claro"], ["dark", "Escuro"]]} onChange={(value) => choose("theme", value)} />
              <ChoiceGroup id={`${id}-contrast`} legend="Contraste" value={preferences.contrast} options={[["normal", "Padrão"], ["high", "Alto contraste"], ["low", "Baixo contraste"]]} onChange={(value) => choose("contrast", value)} />
              <ChoiceGroup id={`${id}-saturation`} legend="Saturação das cores" value={preferences.saturation} options={[["normal", "Padrão"], ["low", "Baixa"], ["gray", "Cinza"]]} onChange={(value) => choose("saturation", value)} />
              <ChoiceGroup id={`${id}-color-vision`} legend="Filtro para daltonismo" value={preferences.colorVision} options={[["off", "Desligado"], ["protanopia", "Protanopia (vermelho)"], ["deuteranopia", "Deuteranopia (verde)"], ["tritanopia", "Tritanopia (azul)"]]} onChange={(value) => choose("colorVision", value)} />
              <div className={styles.toggles}>
                <button type="button" aria-pressed={preferences.jargonSupport} onClick={() => updatePreference("jargonSupport", !preferences.jargonSupport)}>
                  Ajuda para termos técnicos
                  {preferences.jargonSupport && <span className={styles.activeTag} aria-hidden="true">Ligado</span>}
                </button>
              </div>
              <p className={styles.hint}>Quando ativada, a ajuda aparece ao passar o cursor ou focar os termos marcados com “i”.</p>

              <h3>Texto</h3>
              <div className={styles.group} role="group" aria-labelledby={`${id}-text-size`}>
                <span id={`${id}-text-size`} className={styles.legend}>Tamanho do texto</span>
                <div className={styles.stepper}>
                  <button type="button" aria-label="Diminuir texto" disabled={preferences.textScale <= -1} onClick={() => updatePreference("textScale", Math.max(-1, preferences.textScale - 1))}>A−</button>
                  <output aria-live="polite">{textPercent}%</output>
                  <button type="button" aria-label="Aumentar texto" disabled={preferences.textScale >= 5} onClick={() => updatePreference("textScale", Math.min(5, preferences.textScale + 1))}>A+</button>
                </div>
              </div>
              <ChoiceGroup id={`${id}-font`} legend="Tipo de fonte" value={preferences.font} options={[["default", "Padrão"], ["verdana", "Verdana"], ["arial", "Arial"], ["lexend", "Lexend"], ["andika", "Andika"], ["comic", "Comic Sans"], ["serif", "Com serifa"]]} onChange={(value) => choose("font", value)} />
              <p className={styles.hint}>Nenhuma fonte funciona igual para todo mundo: teste e escolha a mais confortável. Lexend e Andika dependem das fontes instaladas no dispositivo.</p>
              <label className={styles.rangeLabel} htmlFor={`${id}-spacing`}>Espaçamento <output htmlFor={`${id}-spacing`}>{preferences.spacing.toFixed(1)}</output></label>
              <input className={styles.range} id={`${id}-spacing`} type="range" min="0" max="2" step="0.1" value={preferences.spacing} onChange={(event) => updatePreference("spacing", Number(event.currentTarget.value))} />
              <div className={styles.toggles}>
                <button type="button" aria-pressed={preferences.underline} onClick={() => updatePreference("underline", !preferences.underline)}>
                  Sublinhar links
                  {preferences.underline && <span className={styles.activeTag} aria-hidden="true">Ligado</span>}
                </button>
                <button type="button" aria-pressed={preferences.align} onClick={() => updatePreference("align", !preferences.align)}>
                  Texto à esquerda e linhas curtas
                  {preferences.align && <span className={styles.activeTag} aria-hidden="true">Ligado</span>}
                </button>
                <button type="button" aria-pressed={preferences.targets} onClick={() => updatePreference("targets", !preferences.targets)}>
                  Botões e links maiores
                  {preferences.targets && <span className={styles.activeTag} aria-hidden="true">Ligado</span>}
                </button>
              </div>

              <h3>Movimento e bordas</h3>
              <ChoiceGroup id={`${id}-motion`} legend="Reduzir movimento" value={preferences.motion} options={[[0, "Normal"], [25, "25%"], [50, "50%"], [100, "Parar"]]} onChange={(value) => choose("motion", value)} />
              <ChoiceGroup id={`${id}-border`} legend="Aumentar borda" value={preferences.border} options={[[0, "Padrão"], [25, "25%"], [50, "50%"], [100, "100%"]]} onChange={(value) => choose("border", value)} />

              <h3>Mouse</h3>
              <ChoiceGroup id={`${id}-cursor-color`} legend="Cor do cursor" value={preferences.cursorColor} options={[["default", "Padrão"], ["black", "Preto"], ["white", "Branco"], ["yellow", "Amarelo"], ["red", "Vermelho"], ["blue", "Azul"]]} onChange={(value) => choose("cursorColor", value)} />
              <ChoiceGroup id={`${id}-cursor-size`} legend="Tamanho do cursor" value={preferences.cursorSize} options={[["default", "Padrão"], ["large", "Grande"], ["xlarge", "Extra grande"]]} onChange={(value) => choose("cursorSize", value)} />
              <ChoiceGroup id={`${id}-spotlight`} legend="Foco de leitura" value={preferences.spotlight} options={[["off", "Desligado"], ["lantern", "Lanterna"], ["ruler", "Régua"]]} onChange={(value) => choose("spotlight", value)} />

              <h3>Leitura em voz alta</h3>
              <div className={styles.reading} role="group" aria-label="Leitura em voz alta">
                <p>Usa a voz disponível no seu dispositivo para ler o conteúdo principal da página.</p>
                <button type="button" onClick={readPage} disabled={isReading}>Ouvir esta página</button>
                <button type="button" onClick={readSelection} disabled={isReading}>Ler seleção</button>
                <button type="button" onClick={() => { window.speechSynthesis?.cancel(); setIsReading(false); setStatusMessage("Leitura interrompida."); }} disabled={!isReading}>Parar leitura</button>
              </div>
              <ChoiceGroup id={`${id}-rate`} legend="Velocidade da voz" value={preferences.rate} options={[[0.75, "Lenta"], [1, "Normal"], [1.25, "Rápida"], [1.5, "Mais rápida"]]} onChange={(value) => choose("rate", value)} />
              <button className={styles.reset} type="button" onClick={resetPreferences}>Restaurar preferências</button>
              <p className={styles.shortcut}>Atalho: Alt + Shift + A · Fechar: Esc</p>
            </div>
            <p className={styles.status} role={statusIsError ? "alert" : "status"} aria-live={statusIsError ? "assertive" : "polite"}>{statusMessage}</p>
        </section>
      </div>
    </>
  );
}

function getCursorValue(color: AccessibilityPreferences["cursorColor"], size: AccessibilityPreferences["cursorSize"]): string {
  if (color === "default" && size === "default") return "";
  const palettes: Record<Exclude<AccessibilityPreferences["cursorColor"], "default">, [string, string]> = {
    black: ["#000", "#fff"], white: ["#fff", "#000"], yellow: ["#ffd400", "#000"], red: ["#e00000", "#fff"], blue: ["#0057ff", "#fff"],
  };
  const [fill, stroke] = palettes[color === "default" ? "black" : color];
  const dimensions = size === "xlarge" ? 48 : size === "large" ? 36 : 24;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions}" height="${dimensions}" viewBox="0 0 24 24"><path d="M3 2v18l5-4.5 3.5 7.5 3-1.4-3.5-7.4H19z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 3 2, auto`;
}

export default FloatingButton;
