import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No generar frontend/AGENTS.md al arrancar `next dev` con un asistente de IA.
  agentRules: false,
};

export default nextConfig;
