// All fonts are SIL OFL-1.1, installed from npm (@fontsource) — not committed to the repo.
import '@fontsource-variable/bricolage-grotesque/wght.css';
import '@fontsource-variable/instrument-sans/wght.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/jetbrains-mono/wght.css';

export const FONTS = {
  display: "'Bricolage Grotesque Variable', 'Instrument Sans Variable', sans-serif",
  sans: "'Instrument Sans Variable', sans-serif",
  serif: "'Instrument Serif', serif",
  mono: "'JetBrains Mono Variable', monospace",
} as const;
