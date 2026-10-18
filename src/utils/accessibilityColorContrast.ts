type RgbaColor = readonly [red: number, green: number, blue: number, alpha: number];

function getRelativeLuminance(color: RgbaColor): number {
  const channels = color.slice(0, 3).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function parseHexColor(color: string): RgbaColor {
  const normalized = color.trim().replace(/^#/, "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((channel) => `${channel}${channel}`).join("")
    : normalized;
  if (!/^[\da-f]{6}$/i.test(expanded)) {
    throw new Error(`Cor hexadecimal inválida: ${color}`);
  }
  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
    1,
  ];
}

export function getContrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = getRelativeLuminance(parseHexColor(foreground));
  const backgroundLuminance = getRelativeLuminance(parseHexColor(background));
  const brightest = Math.max(foregroundLuminance, backgroundLuminance);
  const darkest = Math.min(foregroundLuminance, backgroundLuminance);
  return (brightest + 0.05) / (darkest + 0.05);
}

