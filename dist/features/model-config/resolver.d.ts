/**
 * Model Resolution Pipeline
 *
 * Resolves the model to use for a given agent by checking:
 * 1. .claude/models.json agent override
 * 2. .claude/models.json defaults
 * 3. Fall back to existing static tier from definitions.ts
 */
import type { ModelType } from '../../shared/types.js';
import type { ResolvedModel } from './types.js';
/**
 * Determine which MCP tool to use for an external provider
 */
export declare function getMcpToolForProvider(provider: string): string | undefined;
/**
 * Resolve model config for a specific agent.
 *
 * Resolution order:
 * 1. .claude/models.json agent-specific config
 * 2. .claude/models.json defaults
 * 3. Static tier fallback (passed by caller from definitions.ts)
 */
export declare function resolveModelForAgent(agentName: string, staticTier?: ModelType, projectRoot?: string): ResolvedModel;
/**
 * Check if an external provider is available (has resolved API key or is local)
 */
export declare function isProviderAvailable(resolved: ResolvedModel): boolean;
/**
 * Get the fallback ResolvedModel when external provider is unavailable
 */
export declare function getFallbackModel(resolved: ResolvedModel): ResolvedModel;
/**
 * Resolve model for agent with automatic fallback if provider unavailable
 */
export declare function resolveModelWithFallback(agentName: string, staticTier?: ModelType, projectRoot?: string): ResolvedModel;
//# sourceMappingURL=resolver.d.ts.map