English | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md)

# oh-my-claudecode (Fork)

[![npm version](https://img.shields.io/npm/v/oh-my-claude-sisyphus?color=cb3837)](https://www.npmjs.com/package/oh-my-claude-sisyphus)
[![GitHub stars](https://img.shields.io/github/stars/anhnguyen123312/oh-my-claudecode?style=flat&color=yellow)](https://github.com/anhnguyen123312/oh-my-claudecode/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Multi-agent orchestration for Claude Code with multi-provider model configuration.**

*Fork of [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) with added multi-provider model routing via `.claude/models.json`.*

[Get Started](#installation) | [Multi-Provider Config](#multi-provider-model-configuration) | [Features](#features) | [Skills](#skills-slash-commands) | [Agents](#specialized-agents)

---

## What's New in This Fork

- **Multi-Provider Model Config** - Assign models from OpenAI, Gemini, Ollama, OpenRouter, or any OpenAI-compatible provider to each agent via `.claude/models.json`
- **Per-Agent Provider Routing** - Route your `architect` to GPT-5.3-Codex, `designer` to Gemini 3 Pro, `explore` to local Ollama, etc.
- **Environment Variable API Keys** - Reference keys as `$OPENAI_API_KEY` in config, resolved at runtime
- **Automatic Fallback** - If an external provider is unavailable, falls back to Claude tier seamlessly

---

## Installation

> **IMPORTANT:** This is a **fork** of oh-my-claudecode with extra features (multi-provider model config).
> You must install from **this repo** (`anhnguyen123312`), NOT the original (`Yeachan-Heo`).

### Step 1: Remove the original (if already installed)

If you previously installed the original oh-my-claudecode, remove it first to avoid conflicts:

```bash
# Check if original is installed
claude mcp list 2>/dev/null; ls ~/.claude/plugins/ 2>/dev/null

# Remove original plugin (if present)
/plugin uninstall oh-my-claudecode
```

### Step 2: Install this fork

```bash
# Add THIS fork's marketplace (not the original!)
/plugin marketplace add https://github.com/anhnguyen123312/oh-my-claudecode

# Install from the fork
/plugin install oh-my-claudecode
```

**Verify you installed the correct version:**
```bash
# Should show: https://github.com/anhnguyen123312/oh-my-claudecode
cat ~/.claude/plugins/oh-my-claudecode/.claude-plugin/plugin.json | grep repository
```

### Step 3: Run setup

```bash
/oh-my-claudecode:omc-setup
```

### Alternative: Manual install (git clone)

If the plugin marketplace doesn't work, install manually:

```bash
# Clone the fork directly into Claude Code's plugin directory
git clone https://github.com/anhnguyen123312/oh-my-claudecode.git ~/.claude/plugins/oh-my-claudecode
cd ~/.claude/plugins/oh-my-claudecode
npm install --omit=dev
npm run build

# Then restart Claude Code and run:
/oh-my-claudecode:omc-setup
```

### Updating

```bash
# Update from THIS fork
/plugin install oh-my-claudecode

# Or if manually installed:
cd ~/.claude/plugins/oh-my-claudecode && git pull origin main && npm install --omit=dev && npm run build

# Re-run setup to refresh configuration
/oh-my-claudecode:omc-setup

# If issues after updating
/oh-my-claudecode:doctor
```

### Troubleshooting: Claude installs the wrong version

If Claude Code keeps installing the original instead of this fork:

1. **Check which repo is registered:**
   ```bash
   cat ~/.claude/plugins/oh-my-claudecode/.claude-plugin/plugin.json
   ```
   The `repository` field MUST be `https://github.com/anhnguyen123312/oh-my-claudecode`

2. **Force reinstall from fork:**
   ```bash
   rm -rf ~/.claude/plugins/oh-my-claudecode
   git clone https://github.com/anhnguyen123312/oh-my-claudecode.git ~/.claude/plugins/oh-my-claudecode
   cd ~/.claude/plugins/oh-my-claudecode && npm install --omit=dev && npm run build
   ```

3. **Verify after restart:**
   ```bash
   /oh-my-claudecode:help
   # Should mention "Multi-Provider Model Configuration" in features
   ```

---

## Multi-Provider Model Configuration

Create `.claude/models.json` in your project root to assign models from any provider to agents:

```jsonc
{
  // Provider definitions with connection details
  "providers": {
    "openai": {
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "$OPENAI_API_KEY",
      "models": ["gpt-5.3-codex", "gpt-5.3", "gpt-5.2-codex"]
    },
    "gemini": {
      "baseUrl": "https://generativelanguage.googleapis.com",
      "apiKey": "$GOOGLE_API_KEY",
      "models": ["gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-2.5-pro"]
    },
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "models": ["llama3.3", "codellama", "deepseek-coder"]
    },
    "openrouter": {
      "baseUrl": "https://openrouter.ai/api/v1",
      "apiKey": "$OPENROUTER_API_KEY",
      "models": ["anthropic/claude-opus-4-6", "deepseek/deepseek-r1"]
    }
  },

  // Per-agent model assignment
  "agents": {
    "architect": {
      "provider": "openai",
      "model": "gpt-5.3-codex",
      "role": "architect",
      "fallback": "opus"
    },
    "code-reviewer": {
      "provider": "openai",
      "model": "gpt-5.3-codex",
      "role": "code-reviewer",
      "fallback": "sonnet"
    },
    "designer": {
      "provider": "gemini",
      "model": "gemini-3-pro-preview",
      "role": "designer",
      "fallback": "sonnet"
    },
    "explore": {
      "provider": "claude",
      "model": "haiku"
    },
    "executor": {
      "provider": "claude",
      "model": "sonnet"
    }
  },

  // Default for agents not listed above
  "defaults": {
    "provider": "claude",
    "model": "sonnet"
  }
}
```

### How It Works

```
Agent invocation (e.g., "architect")
  |
  +-- resolveModelForAgent("architect")
  |     +-- Load .claude/models.json (cached)
  |     +-- Find agents.architect config
  |     |     provider: "openai", model: "gpt-5.3-codex"
  |     +-- Resolve API key: "$OPENAI_API_KEY" -> env
  |     +-- Return { type: 'external', provider: 'openai', ... }
  |
  +-- type === 'external' && provider matches 'openai'?
  |     -> Delegate via MCP ask_codex tool
  |
  +-- type === 'external' && provider matches 'gemini'?
  |     -> Delegate via MCP ask_gemini tool
  |
  +-- type === 'claude'?
  |     -> Use Claude Task tool with tier
  |
  +-- Provider unavailable? -> Use fallback Claude tier
```

### Config Options

| Field | Type | Description |
|-------|------|-------------|
| `providers.<name>.baseUrl` | `string` | API endpoint URL |
| `providers.<name>.apiKey` | `string` | Raw key or `$ENV_VAR` reference |
| `providers.<name>.models` | `string[]` | Available model IDs |
| `agents.<name>.provider` | `string` | Provider key or `"claude"` |
| `agents.<name>.model` | `string` | Model ID or Claude tier (`haiku`/`sonnet`/`opus`) |
| `agents.<name>.role` | `string` | Role for MCP delegation |
| `agents.<name>.fallback` | `string` | Claude tier fallback if provider unavailable |
| `defaults.provider` | `string` | Default provider for unlisted agents |
| `defaults.model` | `string` | Default model for unlisted agents |

---

## Features

### Execution Modes

Multiple strategies for different use cases:

| Mode | Keyword | Description |
|------|---------|-------------|
| **Autopilot** | `autopilot` | Full autonomous execution from idea to working code |
| **Ultrawork** | `ulw` / `uw` | Maximum parallel agent orchestration |
| **Ralph** | `ralph` | Self-referential loop until task completion with architect verification |
| **Ultrapilot** | - | Parallel autopilot with file ownership partitioning (3-5x faster) |
| **Ecomode** | `eco` | Token-efficient routing using Haiku/Sonnet (30-50% cheaper) |
| **Swarm** | `swarm` | N coordinated agents on shared task list with SQLite-based claiming |
| **Pipeline** | `pipeline` | Sequential agent chaining with data passing between stages |
| **UltraQA** | `ultraqa` | QA cycling: test, verify, fix, repeat until goal met |

### Intelligent Model Routing

- **Complexity-based routing** - Haiku for simple tasks, Sonnet for moderate, Opus for complex reasoning
- **Agent category tiers** - Exploration agents default LOW, advisors default HIGH
- **Escalation keywords** - Words like "critical", "security", "architecture" trigger higher tiers
- **Configurable overrides** - Per-agent tier overrides via config

### Multi-AI Orchestration

OMC can orchestrate external AI providers alongside Claude:

| Provider | Tool | What It Enables |
|----------|------|-----------------|
| **OpenAI Codex** | `ask_codex` | Architecture review, planning validation, code review, security review |
| **Google Gemini** | `ask_gemini` | Design review, UI consistency, vision tasks (1M token context) |

Both tools now support `api_key` and `base_url` parameters for provider-specific credentials from `.claude/models.json`.

### Developer Experience

- **HUD Statusline** - Real-time orchestration metrics in your terminal
- **Skill Learning** - Extract reusable patterns from sessions (`/learner`)
- **Analytics & Cost Tracking** - Token usage across sessions (`omc-analytics`)
- **Project Session Manager** - Isolated dev environments with git worktrees and tmux
- **Notepad System** - Persistent notes that survive context compaction
- **Boulder State** - Session/plan tracking for execution continuity

---

## Skills (Slash Commands)

40 built-in skills for every workflow:

### Core Execution
| Skill | Description |
|-------|-------------|
| `/autopilot` | Full autonomous execution from idea to working code |
| `/ultrawork` | Parallel execution engine for high-throughput tasks |
| `/ralph` | Persistent loop until task completion |
| `/ultrapilot` | Parallel autopilot with file ownership |
| `/ecomode` | Token-efficient parallel execution |
| `/swarm` | Coordinated multi-agent task list |
| `/pipeline` | Sequential agent chaining |
| `/ultraqa` | QA cycling workflow |
| `/deep-executor` | Deep executor for complex goal-oriented tasks |

### Planning & Analysis
| Skill | Description |
|-------|-------------|
| `/plan` | Strategic planning with optional interview workflow |
| `/ralplan` | Iterative planning with Planner, Architect, and Critic until consensus |
| `/ralph-init` | Initialize a PRD for structured ralph-loop execution |
| `/analyze` | Deep analysis and investigation |
| `/research` | Orchestrate parallel scientist agents for research |
| `/review` | Review a plan with Critic |
| `/start-work` | Bridge from plan to execution with boulder state |

### Code Quality
| Skill | Description |
|-------|-------------|
| `/code-review` | Comprehensive code review |
| `/security-review` | Security vulnerability detection |
| `/tdd` | Test-Driven Development enforcement |
| `/build-fix` | Fix build and TypeScript errors with minimal changes |

### Search & Navigation
| Skill | Description |
|-------|-------------|
| `/deepsearch` | Thorough codebase search |
| `/deepinit` | Deep codebase initialization with hierarchical AGENTS.md |

### Design & Writing
| Skill | Description |
|-------|-------------|
| `/frontend-ui-ux` | Designer-turned-developer for stunning UI/UX |
| `/writer-memory` | Agentic memory for writers (characters, scenes, themes) |

### DevOps & Git
| Skill | Description |
|-------|-------------|
| `/git-master` | Git expert for atomic commits, rebasing, history management |
| `/project-session-manager` | Manage isolated dev environments |

### Configuration & Utility
| Skill | Description |
|-------|-------------|
| `/omc-setup` | One-time setup for oh-my-claudecode |
| `/doctor` | Diagnose and fix installation issues |
| `/mcp-setup` | Configure popular MCP servers |
| `/hud` | Configure HUD display options |
| `/note` | Save notes to notepad for compaction resilience |
| `/cancel` | Cancel any active OMC mode |
| `/trace` | Show agent flow trace timeline |
| `/help` | Guide on using oh-my-claudecode |
| `/learn-about-omc` | Analyze usage patterns and get recommendations |
| `/learner` | Extract a learned skill from conversation |
| `/skill` | Manage local skills |
| `/local-skills-setup` | Set up local skills for automatic matching |
| `/release` | Automated release workflow |
| `/orchestrate` | Activate multi-agent orchestration mode |

---

## Specialized Agents

30 specialized agents (consolidated in v4.1.0+):

### Advisory (Opus)
| Agent | Description |
|-------|-------------|
| `architect` | Strategic architecture & debugging advisor |
| `analyst` | Pre-planning consultant for requirements analysis |
| `critic` | Work plan review expert |
| `planner` | Strategic planning consultant with interview workflow |
| `deep-executor` | Autonomous deep worker for complex tasks |
| `product-manager` | Product strategy and feature prioritization |
| `product-analyst` | Requirements analysis and user research |

### Specialist (Sonnet)
| Agent | Description |
|-------|-------------|
| `executor` | Focused task executor for implementation |
| `designer` | UI/UX designer-developer |
| `researcher` | External documentation & reference researcher |
| `scientist` | Data analysis and research execution |
| `qa-tester` | Interactive CLI testing specialist |
| `code-reviewer` | Expert code review specialist |
| `security-reviewer` | Security vulnerability detection |
| `git-master` | Git expert for atomic commits and history management |
| `vision` | Visual/media file analyzer |
| `api-reviewer` | API design and consistency reviewer |
| `performance-reviewer` | Performance analysis and optimization |
| `quality-reviewer` | Code quality and maintainability review |
| `quality-strategist` | Test strategy and quality planning |
| `style-reviewer` | Code style and convention enforcement |
| `ux-researcher` | UX research and usability analysis |
| `test-engineer` | Test implementation specialist |
| `debugger` | Systematic debugging specialist |
| `verifier` | Implementation verification |

### Utility (Haiku)
| Agent | Description |
|-------|-------------|
| `explore` | Fast codebase search specialist |
| `writer` | Technical documentation writer |
| `dependency-expert` | Dependency management and updates |
| `information-architect` | Documentation structure and organization |

---

## Configuration

### Config Files

| File | Location | Purpose |
|------|----------|---------|
| `config.jsonc` | `~/.config/claude-sisyphus/config.jsonc` | User-level settings |
| `sisyphus.jsonc` | `.claude/sisyphus.jsonc` | Project-level settings |
| `models.json` | `.claude/models.json` | Multi-provider model assignment |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OMC_CODEX_DEFAULT_MODEL` | Default Codex model (default: `gpt-5.3-codex`) |
| `OMC_GEMINI_DEFAULT_MODEL` | Default Gemini model (default: `gemini-3-pro-preview`) |
| `OMC_PARALLEL_EXECUTION` | Enable/disable parallel execution |
| `OMC_ROUTING_ENABLED` | Enable/disable intelligent model routing |
| `OMC_ROUTING_DEFAULT_TIER` | Default routing tier (`LOW`/`MEDIUM`/`HIGH`) |
| `OMC_LSP_TOOLS` | Enable/disable LSP integration |
| `OMC_MAX_BACKGROUND_TASKS` | Max concurrent background tasks |
| `OPENAI_API_KEY` | OpenAI/Codex API key |
| `GOOGLE_API_KEY` | Google/Gemini API key |

### Feature Toggles

```jsonc
// .claude/sisyphus.jsonc
{
  "features": {
    "parallelExecution": true,
    "lspTools": true,
    "astTools": true,
    "continuationEnforcement": true,
    "autoContextInjection": true
  },
  "routing": {
    "enabled": true,
    "defaultTier": "MEDIUM",
    "escalationEnabled": true,
    "tierModels": {
      "LOW": "claude-haiku-4-5-20251001",
      "MEDIUM": "claude-sonnet-4-5-20250929",
      "HIGH": "claude-opus-4-6-20260205"
    }
  }
}
```

---

## Magic Keywords

Optional shortcuts for power users. Natural language works fine without them.

| Keyword | Effect | Example |
|---------|--------|---------|
| `autopilot` | Full autonomous execution | `autopilot: build a todo app` |
| `ralph` | Persistence mode | `ralph: refactor auth` |
| `ulw` / `uw` | Maximum parallelism | `ulw fix all errors` |
| `eco` | Token-efficient execution | `eco: migrate database` |
| `plan` | Planning interview | `plan the API` |
| `ralplan` | Iterative planning consensus | `ralplan this feature` |
| `ultrathink` / `think` | Deep reasoning mode | `think about this architecture` |

**ralph includes ultrawork:** When you activate ralph mode, it automatically includes ultrawork's parallel execution.

---

## Utilities

### Rate Limit Wait

Auto-resume Claude Code sessions when rate limits reset.

```bash
omc wait          # Check status, get guidance
omc wait --start  # Enable auto-resume daemon
omc wait --stop   # Disable daemon
```

**Requires:** tmux (for session detection)

---

## Requirements

- [Claude Code](https://docs.anthropic.com/claude-code) CLI
- Claude Max/Pro subscription OR Anthropic API key
- Node.js >= 20.0.0

### Optional: Multi-AI Orchestration

| Provider | Install | What It Enables |
|----------|---------|-----------------|
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `npm install -g @google/gemini-cli` | Design review, UI consistency (1M token context) |
| [Codex CLI](https://github.com/openai/codex) | `npm install -g @openai/codex` | Architecture validation, code review cross-check |

---

## License

MIT

---

<div align="center">

**Forked from:** [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)

**Inspired by:** [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) | [claude-hud](https://github.com/ryanjoachim/claude-hud) | [Superpowers](https://github.com/NexTechFusion/Superpowers)

</div>
