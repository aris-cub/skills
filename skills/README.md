# mirrord Skills

This folder contains AI agent skills for [mirrord](https://github.com/metalbear-co/mirrord).

## Available Skills

| Skill | Description |
|-------|-------------|
| [mirrord-config](./mirrord-config/) | Generate and validate mirrord.json configuration files |
| [mirrord-quickstart](./mirrord-quickstart/) | Guide new users from install to first session |

## Structure

Each skill folder contains:
- `SKILL.md` — Instructions loaded by the AI agent

## Adding a New Skill

1. Create a folder: `skills/<skill-name>/`
2. Add `SKILL.md` with frontmatter and instructions
3. Register in `../.claude-plugin/marketplace.json` under the `skills` array
