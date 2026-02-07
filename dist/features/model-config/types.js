/**
 * Multi-Provider Model Configuration Types
 *
 * Types for `.claude/models.json` configuration that allows assigning
 * specific models from any provider (OpenAI, Gemini, Ollama, etc.)
 * to each agent.
 */
/**
 * Known provider-to-MCP-tool mapping
 */
export const PROVIDER_MCP_MAPPING = {
    openai: 'codex',
    codex: 'codex',
    gemini: 'gemini',
    google: 'gemini',
};
/**
 * Claude tier names for validation
 */
export const CLAUDE_TIERS = ['haiku', 'sonnet', 'opus'];
//# sourceMappingURL=types.js.map