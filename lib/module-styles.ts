export const moduleStyles = [
  { accent: "#3157d5", pale: "#eaf0ff", icon: "database" },
  { accent: "#8157c9", pale: "#f1ebfb", icon: "scale" },
  { accent: "#d05f42", pale: "#fcece7", icon: "waves" },
  { accent: "#df8d1b", pale: "#fff4dd", icon: "gauge" },
  { accent: "#238275", pale: "#e4f5f1", icon: "network" },
  { accent: "#b23a69", pale: "#f9e7ee", icon: "triangle" },
  { accent: "#52616b", pale: "#e9eef0", icon: "blocks" },
] as const;

export function getModuleStyle(moduleNumber: number) {
  return moduleStyles[moduleNumber - 1] ?? moduleStyles[0];
}
