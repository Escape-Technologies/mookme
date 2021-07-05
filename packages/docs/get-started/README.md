# Get started

## Installation

```bash
npm install @escape.tech/mookme
```

## Configuration

### First configuration

**Case 1 : You're the first to configure `Mookme` on your project**

```bash
mookme init
```

This will display a prompter to let you define **where you packages are located**, how you want the hooks to behave
when a file is changed during commit hooks, write the corresponding documentation in your `package.json`, and write
your `.git/hooks` scripts.

Every step of this process is clearly shown and nothing will be written without asking you if you're okay with it :)

### Already-configured project

**Case 2 : Someone in your team already configured `Mookme`**

This will only write your `.git/hooks` scripts.

```bash
mookme init --only-hook
```

## Writing your hooks

### Global structure of your project hooks

`Mookme` is designed for monorepos, hence it assumes your project has a root folder where global hooks can be defined,
and multiple packages where you can define per-package hook.

::: tip
Hook are written in a folder `.hooks` located at the root of your project and at the root of you packages' folders.

**When using `Mookme` in a monorepo, you will have a project structure following this :**

```bash
<root> # where your .git is located
|- .hooks # will always be executed when you commit
|  |- pre-commit.json # will be executed with the pre-commit git hook
|  |- commit-msg.json  # will be executed with the commit-msg git hook
|  |- prepare-commit-msg.json
|  |- post-commit.json
|- packages
|  |- package A
|  |  |- .hooks # will be executed if you commit changes on package A
|  |  |  |- pre-commit.json 
|  |  |  |- post-commit.json
|  |- package A
|  |  |- .hooks # will be executed if you commit changes on package B
|  |  |  |- pre-commit.json
```

:::

With `mookme`, your hooks are stored in JSON files called `{hook-type}.json` where the hook type is one of the
available git hooks, eg :

- `pre-commit`
- `prepare-commit-msg`
- `commit-msg`
- `post-commit`

### Example of hook file

Your hooks are defined in simple json files.

- For complete reference, see the JSON hooks reference
- For specific hook examples, see the recipes.

A hook defines a list of `steps`, which are basically commands to run, with a name for proper display. A few
configuration option are available, but the minimal requirement is `name` and `command`.

Here is an example that will run your commit message using `commitlint`.

```js
# commit-msg.json
{
    "steps": [{
        "name": "commit lint",
        "command": "cat {args} | ./node_modules/@commitlint/cli/cli.js"
    }]
}
```

::: tip
When writing package-scoped hooks, the current working directory assumed by `Mookme` is the folder where this
package's `.hooks'` folder is located
:::

::: warning
{args}` are replaced with the hook arguments when the command is executed. See [the  git documentation on hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
:::

**More examples to [get you started !](./docs/hooks-examples/index.md)**
