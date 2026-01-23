![Mirord Agent Skills](assets/mirrord-agent-skills.png)
# Mirrord Agent Skills

A collection of skills for AI coding agents to work with MetalBear's mirrord. Skills are packaged instructions and scripts that extend agent capabilities for Kubernetes development workflows.

Skills follow the [Agent Skills format](https://agentskills.io/home).

## Installation

### Using npx (requires Node.js)

```bash
npx skills add metalbear-co/skills
```

### Claude Code plugin

```bash
/plugin marketplace add metalbear-co/skills
```

## Available Skills

| Skill | Description |
|-------|-------------|
| [mirrord-config](./skills/mirrord-config/) | Generate and validate mirrord.json configs |
| [mirrord-quickstart](./skills/mirrord-quickstart/) | Get started with mirrord from zero |


## Usage

Skills are automatically available once installed. The agent will use them when relevant tasks are detected.

**Example:**
- "Create a mirrord.json file that filters  incoming traffic  not by header but by  body  in the request that is being sent . For example if in the body I have a json that looks like this " {   id: "grizzly",   name: "Grizzly",   price: 25,   qty: 1, }" I want the filter to send me only when the body id equals "grizzly" if its a diffrent value I should get it."


**Example:**
- "I'm new to mirrord, how do I get started?"

## Skill Structure

Each skill contains:
- `SKILL.md` - Instructions for the agent
- `scripts/` - Helper scripts for automation (optional)
- `references/` - Supporting documentation (optional)


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

