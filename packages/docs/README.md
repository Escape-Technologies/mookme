# Welcome on Mookme

*A simple and easy-to-use, yet powerful and language agnostic git hook for monorepos.*

<img src="banner.png" alt="banner"/>

## What is Mookme ?

Mookme is a Git hook manager. It's sole purpose is to execute some scripts when you want to commit or do other git stuff. It could be a
linter, tests, your favorite commit message checker.

::: tip
**Everything that is invoked through a cli can be used with Mookme!**
:::

You are welcome to use it and enjoy it's simplicity.
**If you encounter any bug or weird behavior, don't be afraid to open an [issue](https://github.com/Escape-Technologies/mookme/issues) :)**

## How does it work ?

1. Mookme is invoked by a git hook script
2. Mookme looks for `.hooks` folders across your repository
3. For each detected folders, Mookme detects if there are any hooks defined for the git hook currently being executed
4. For each detected folders, Mookme detects if there are git-staged changes in this folder (only for pre-commit hooks)
5. If both conditions above are valid, Mookme runs concurrently (or not) the different commands provided in the hook file.

## Why not ... ?

### `bash` scripts

**`bash` scripts directly written in my `.git/hooks` folder**

- Even if it is true that, in the end, `Mookme` will do nothing more than invoking commands the exact same way a bash
script would, the `.git/hooks` folder is a not a versioned one, *hence it will prevent you from sharing configuration*.
- `Mookme` provides you with a way to version these hooks, and to share repository configuration among the rest of your team.
- The hook setup is a one liner for the new developers landing in your team. It won't download anything, just write a
small line in your `.git/hooks` files

### `pre-commit` *(our tool before developing Mookme)*

We had several issues with `pre-commit`, that led us to develop our own tool :

- pre-commit is not designed for monorepos, hence most of the hook are some sort of hacks
- per-package environment were not easy to manage, because `pre-commit` has it's own global environment and we have to
create global dependency to run a particular hook for one package.

::: warning
This led us to one of the guideline used by `Mookme` to work:
If we run a hook on a package in your monorepo it means:

- that you have changes in the folder of this package
- that you developed something on this package
- that the dev environment of this package is okay
- we can invoke your test/lint commands **as they are provided** without worrying about an environment
properly setup
:::
