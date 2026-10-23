// Design tokens for the whole site.
export const c = {
  paper: "#F7F5EF",
  paperDim: "#EFEBE1",
  ink: "#1C2B39",
  inkSoft: "#4B5B68",
  post: "#2F5C8A",
  postDeep: "#1F4165",
  gold: "#B8863B",
  // Gold as text on white/paper: #B8863B is only about 3:1 contrast, too faint for small type.
  goldText: "#8A5F1F",
  green: "#4C7A5E",
  greenBg: "#E7EFE9",
  clay: "#B5533C",
  clayBg: "#F5E5DF",
  line: "#DBD5C7",
};

// Arial everywhere (feedback 3): guidance for partially sighted and dyslexic readers (RNIB clear
// print, British Dyslexia Association style guide) names plain sans-serif faces, Arial first.
// It is installed on practically every device, so nothing is downloaded. Liberation Sans and
// Arimo are metric-compatible stand-ins on Linux and ChromeOS.
export const displayFont = "Arial, 'Liberation Sans', Arimo, Helvetica, sans-serif";
export const bodyFont = displayFont;
// Amounts used a monospace face, which phones render as a typewriter font (Courier). They now
// use Arial like everything else, with tabular figures so digits still line up.
export const monoFont = displayFont;
