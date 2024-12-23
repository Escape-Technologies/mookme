# Migration Guide: From Mookme to Gookme

Mookme has been officially discontinued and replaced by Gookme, a Golang-based CLI for managing Git hooks. This guide will help you transition smoothly from Mookme to Gookme.

## Why the Change?

- Simpler Installation: No dependency on package.json or npm. Gookme is a binary executable.
- Better Cross-Platform Support: Gookme works seamlessly on Windows, macOS, and Linux.
- Future Development: Gookme will continue to receive updates and new features, unlike Mookme.

## Key Differences

| Feature | Mookme | Gookme
|---------|--------|--------|
| Installation | Requires Node.js and npm | Prebuilt binary, no dependencies
| Hook Scripts | Written in any language but tied to JS or Python | Language-agnostic and independent
| Platforms | Linux, macOS (Windows support tricky) | Full cross-platform support

## Installation of Gookme

### 1. Download Gookme

See [the Gookme documentation](https://lmaxence.github.io/gookme/getting-started/)

### 2. Verify Installation

```bash
gookme --version
```

You should see the installed version.

## Global configuration

Gookme uses a global configuration file to store settings. You can create this file by running:

```bash
touch ~/.gookme.json
```

- The `addedBehavior` parameter has been renamed `onModifiedFiles`
- The `noClearRenderer` parameter has been removed

## Updating Hooks

Gookme handles hooks similarly to Mookme but hook files are lightly different. This will allow you to have concurrent installations of Mookme and Gookme, and progressively migrate your hooks to Gookme.

## Step 1: Remove Mookme Hooks

Run the following to clean up existing hooks:

```bash
#!/bin/bash

# Check if the .git/hooks directory exists
if [ ! -d ".git/hooks" ]; then
  echo "Error: .git/hooks directory not found!"
  exit 1
fi

# Iterate over all files in the .git/hooks directory
for file in .git/hooks/*; do
  # Check if the file is a regular file (not a directory or special file)
  if [ -f "$file" ]; then
    # Use sed to remove lines starting with 'npx mookme run'
    sed -i '/^npx mookme run/d' "$file"
    echo "Processed $file"
  fi
done

echo "All lines starting with 'npx mookme run' have been removed from .git/hooks files."
```

## Step 2: Install Gookme Hooks

Run the following to install Gookme-managed hooks:

```bash
gookme init -t pre-commit,commit-msg # Add any other hooks you need
```

## Step 3: Migrate Hook Scripts

- Using Gookme, hooks are not stored in `.hooks` folders but in `hooks` folders.

```bash
mv /path/to/.hooks /path/to/hooks
```

- Gookme hooks format is slightly different.

However, Gookme will provide a JSON schema for you to check in a code editor if the hook is valid.

The following is the `pre-commit.hook.json` hook file of Gookme:

```json
{
  "$schema": "https://raw.githubusercontent.com/LMaxence/gookme/refs/heads/main/assets/schemas/hooks.schema.json",
  "steps": [
    {
      "name": "Check format",
      "command": "./scripts/check-format.sh",
      "onlyOn": "*.go"
    },
    {
      "name": "Code quality",
      "command": "golangci-lint run ./...",
      "onlyOn": "*.go"
    },
    {
      "name": "Assets generation",
      "command": "make assets"
    }
  ]
}
``` 

## Further Support

If you encounter issues or have questions:

- Visit the [Gookme Documentation](https://lmaxence.github.io/gookme).
- Open an issue in the [Gookme GitHub Repository](https://github.com/LMaxence/gookme/issues).
