/**
 * Model Config Loader
 *
 * Loads and validates `.claude/models.json` configuration.
 * Resolves environment variable references in API keys.
 * Caches loaded config per session.
 */
import type { ModelsConfig, ProviderConfig, AgentModelConfig } from './types.js';
/**
 * Get the path to .claude/models.json in the project root
 */
export declare function getModelsConfigPath(projectRoot?: string): string;
/**
 * Resolve an API key value.
 * If it starts with "$", treat it as an env var reference.
 * Otherwise return the raw value.
 */
export declare function resolveApiKey(value: string | undefined): string | undefined;
/**
 * Load and parse .claude/models.json
 * Returns null if the file doesn't exist.
 * Throws on parse errors.
 */
export declare function loadModelsConfigFromFile(projectRoot?: string): ModelsConfig | null;
/**
 * Validate a loaded models config.
 * Checks provider references in agent configs, model availability, etc.
 * Returns an array of warning messages (empty = valid).
 */
export declare function validateConfig(config: ModelsConfig): string[];
/**
 * Load models config with caching.
 * Returns the cached config if the same project root is used.
 */
export declare function loadModelsConfig(projectRoot?: string): ModelsConfig | null;
/**
 * Get the model config for a specific agent.
 * Returns the agent-specific config, or defaults, or null.
 */
export declare function getAgentModelConfig(agentName: string, projectRoot?: string): AgentModelConfig | null;
/**
 * Resolve the full provider config (with API key resolved) for a provider name.
 */
export declare function getResolvedProviderConfig(providerName: string, projectRoot?: string): (ProviderConfig & {
    resolvedApiKey?: string;
}) | null;
/**
 * Clear the cached config (useful for testing or config reload)
 */
export declare function clearModelsConfigCache(): void;
//# sourceMappingURL=loader.d.ts.map