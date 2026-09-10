export const colors = {
  background: "#111412",
  foreground: "#E7E9E4",
  primary: "#B8D2A2",
  primaryForeground: "#172016",
  secondary: "#252A26",
  secondaryForeground: "#DCE1D8",
  muted: "#343934",
  mutedForeground: "#969D94",
  accent: "#D1C7E8",
  destructive: "#D94A4A",
  card: "#171B18",
  popover: "#191D1A",
  border: "#2A302B",
  input: "#161A17",
  sidebar: "#0F1210",
  overlay: "rgba(0,0,0,0.62)",
};

export const areaColors: Record<string, string> = {
  Career: "#AFC4D6",
  Product: "#D1C7E8",
  Fitness: "#B8D2A2",
  Ministry: "#D9B27C",
  Life: "#D9B27C",
};

const extraAreaColors = ["#AFC4D6", "#D1C7E8", "#B8D2A2", "#D9B27C", "#C4B8A8"];

export function colorForArea(area: string) {
  if (areaColors[area]) return areaColors[area];
  let hash = 0;
  for (let i = 0; i < area.length; i += 1) hash += area.charCodeAt(i);
  return extraAreaColors[hash % extraAreaColors.length];
}

export const fonts = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
};

export const floatingTab = {
  height: 64,
  bottomGap: 10,
  sideInset: 18,
  clearance: 118,
};
