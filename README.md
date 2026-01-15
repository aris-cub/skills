# Agent Skills

A collection of skills for AI coding agents to work with MetalBear's mirrord. Skills are packaged instructions and scripts that extend agent capabilities for Kubernetes development workflows.

Skills follow the [Agent Skills format](https://agentskills.io/home).

## Available Skills

### mirrord-config

Generate, validate, and edit [mirrord](https://mirrord.dev) configuration files. Helps you create valid `mirrord.json` configs for connecting local processes to Kubernetes environments.

**Use when:**
- "Generate a mirrord config for..."
- "Validate my mirrord.json"
- "Fix my mirrord configuration"


**Features:**
- Generates valid configs from natural language descriptions
- Validates against the official mirrord JSON schema
- Uses `mirrord verify-config` CLI for authoritative validation
- Fixes invalid configurations with explanations
- Supports all mirrord features: env, fs, network, operator mode

**How it works:**
1. Reads the mirrord JSON schema and configuration reference
2. Generates valid mirrord.json files based on your requirements
3. Validates using `mirrord verify-config` command
4. Returns validated JSON with explanations
5. Uses [Schema](https://raw.githubusercontent.com/metalbear-co/mirrord/refs/heads/main/mirrord-schema.json) and [Configuration](https://metalbear.com/mirrord/docs/config) as references.


## Usage

Skills are automatically available once installed. The agent will use them when relevant tasks are detected.

**Example:**
- "Create a mirrord.json file that filters  incoming traffic  not by header but by  body  in the request that is being sent . For example if in the body I have a json that looks like this " {   id: "grizzly",   name: "Grizzly",   price: 25,   qty: 1, }" I want the filter to send me only when the body id equals "grizzly" if its a diffrent value I should get it."


## Skill Structure

Each skill contains:
- `SKILL.md` - Instructions for the agent
- `scripts/` - Helper scripts for automation (optional)
- `references/` - Supporting documentation (optional)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

