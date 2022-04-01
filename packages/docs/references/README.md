# CLI & references

## `mookme init`

The main initialization command. It :

- **asks** you to select a behavior to observe when the staged files are updated by your git hooks
- **asks** you to select one or multiple git event to hook
- **creates** the `.hooks` folder in each package where you can write **dedicated hooks!** that will be triggered only
when changes in this package occur
- **creates** a `.hooks` folder at the root of your project where you can write **project-wide hooks** that will be
triggered on every commit
- **writes** `.git/hooks` files
- **writes** into the `.gitignore` files of your root project and specified packages to ignore [local steps](/features/#uncommited-steps-gitignore)

### Options

- `--only-hook` (optional)

Skip prompters and only write `.git/hooks` files. This is for installation in an already-configured project.

- `--skip-types-selection` (optional)

Skip hook types selection and hook every git event.

## `mookme run`

Mainly used for debugging and dry run :

`mookme run --type pre-commit --args "test arguments"`

### Options

- `-t --type` (required)

The type of hook to run, has to be one of `pre-commit`, `prepare-commit-msg`, `commit-msg`, `post-commit`.

- `-a --args` (optional)

The arguments that would be normally passed by git to the hook

- `-r --run-all` (optional)

Skip the selection of hooks to run based on git-staged files, and run hooks of every package for this type

- `--from` (optional)

Starting git reference used to evaluate hooks to run. If set, `to` has to be set as well, otherwise this option is ignored.

- `--to` (optional)

Ending git reference used to evaluate hooks to run. If set, `from` has to be set as well, otherwise this option is ignored.

## `mookme inspect`

Manually test wich packages are discovered and assess if your hooks are properly configured.

`mookme inspect --type pre-commit`

<img src="/inspect-results.png" alt="inspect-results"/>

### Options

- `-t --type` (required)

The type of hook to inspect, has to be one of `pre-commit`, `prepare-commit-msg`, `commit-msg`, `post-commit`.

- `-f --files` (optional)

A list of files paths to inspect. Paths must be relative from the repository root.

## Hook files

### General description

See [Writing your hooks](/get-started/#writing-your-hooks)

### Available options

- `steps`

The list of steps (commands) being executed by this hook. In a step you can define :

#### Step options

| Option        | Description           | Required  |
| ------------- | ------------- | ------|
| `name`      | The name that will be given to this step | yes |
| `cmd`      | The command invoked at this step |   yes |
| `onlyOn` | A shell wildcard conditioning the execution of the step based on modified files      |    no |
| `serial` | A boolean value describing if the package hook execution should await for the step to end |    no |
| `from` | Extend a shared step |    no |

::: warning
A serial step that fails will not prevent the execution of the following steps
:::

::: warning
The pattern provided in `onlyOn` will be matched agains the relative path of matched files of the execution, from the package folder, not from the repository root.
:::

- `type`

A flag used mainly to tell `mookme` this is a python hook, and might need a virtual environment to be activated. Possible values are `python, js, script`

- `venvActivate`

A path to a `<venv>/bin/activate` script to execute before the command if the hook type is `python`

### Available arguments

A set of arguments is provided by Mookme, that can be directly used in the hooks command definitions using the following syntax in the step definition:

````json
{
    "command": "run-something {args}" // Will be replaced with the value of `args`
}
````

- `args`

The argument being passed by git to the hook file. See [the Git documentation on the hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) for more details about what it contains depending on the hook type being executed.

- `packageFiles`

The list of files being matched by the package filtering strategy, and responsible for it being ran in this execution. The files are separated by a blank space (" "). See [the section about how Mookme selects packages to run](/get-started/#how-will-mookme-decide-which-hooks-to-run) for more details on how the files passed in this are selected.

::: warning
The paths are relative from the repository root folder
:::

- `matchedFiles`

The list of files being matched by the step filtering strategy, and responsible for it being ran in this execution. The files are separated by a blank space (" "). See [the section about how Mookme selects packages to run](/get-started/#how-will-mookme-decide-which-hooks-to-run) for more details on how the files passed in this are selected.

::: warning
The paths are relative from the package folder (eg, the folder where the `.hooks` folder was detected)
:::
