[![GitHub Release](https://img.shields.io/github/v/release/stefma/pkl-gha?include_prereleases)](https://github.com/StefMa/pkl-gha/releases/latest)
[![GitHub License](https://img.shields.io/github/license/stefma/pkl-gha)](https://github.com/StefMa/pkl-gha/blob/main/LICENSE)

# <img src="icon.png" alt="Pkl" width="55"/> pkl-gha

A [Pkl](https://pkl-lang.org/) template for writing GitHub Action workflows.

## What?

[Pkl](https://pkl-lang.org/) is a configuration as code language with rich validation.
YAML, the language used for GitHub Actions on the other hand, is a configuration language with **no validation** at all.
We have to rely on third-party tools or IDE support to validate our GitHub Actions.
While this will get better over time, it's still not as good as having a language with rich validation out of the box.

This is where **this** template comes in.
It allows you to write your GitHub Action Workflows in Pkl
and then compile them (using the [Pkl cli](https://pkl-lang.org/main/current/pkl-cli/index.html#installation)) to YAML.
The generated YAML output, if successfully converted, 
is definitely YAML validated and ready to be used as your Action Workflows.

## How?

**1. Write a `Pkl` file and `amend` this template**

```pkl
amends "package://pkg.pkl-lang.org/github.com/stefma/pkl-gha/com.github.action@0.0.5#/Workflow.pkl"
import "package://pkg.pkl-lang.org/github.com/stefma/pkl-gha/com.github.action@0.0.5#/Context.pkl" // Optional
import "package://pkg.pkl-lang.org/github.com/stefma/pkl-gha/com.github.action@0.0.5#/Action.pkl" // Optional

name = "Test"

on {
  // Define your `on` triggers. E.g.:
  push {
    branches {
      "main"
    }
  }
  pull_request {}
}

jobs {
  // Define your `jobs`. E.g.: 
  ["test"] {
    `runs-on` = new UbuntuLatest {} // Could also be a string like "ubuntu-latest"
    // Define your `steps`. E.g.:
    steps {
      (Action.checkout) {
        fetchDepth = 0
      }
      new {
        name = "Setup nexus credentials"
        run = """
          mkdir ~/.gradle
          echo "systemProp.nexusUsername=\(Context.secrets("NEXUS_USERNAME")) >> ~/.gradle/gradle.properties
          echo "systemProp.nexusPassword=\(Context.secrets("NEXUS_PASSWORD")) >> ~/.gradle/gradle.properties
        """
      }
      new {
        name = "Test android app"
        run = "./gradlew testDebugUnitTest"
      }
    }
  }
}
```

**2. Install the Pkl cli**

For macOS it as simple as:
```bash
brew install pkl
````

For other platforms, please follow the [official installation guide](https://pkl-lang.org/main/current/pkl-cli/index.html#installation).

**3. Convert the Pkl file to Yaml**

```bash
pkl eval path/to/your/pkl/file.pkl -o path/to/your/pkl/file.yaml
```

*Or alternatively for all files in the `.github/workflows` directory*:
```bash
pkl eval path/to/your/pkl/files/*.pkl -o path/to/your/pkl/files/%{moduleName}.yml
```

## Why?

* **Strong typing**: Pkl is a strongly typed language. This means that you can't accidentally use a wrong type in your
  configuration.
* **Simplicity**: Strong validation and strong typing but still simple to write.

## Examples

You can find real-life examples in the [.github/pkl-workflows](.github/pkl-workflows) directory of this repository.
There are also some examples in the [examples](examples) directory.

The (right now) supported templates looks like that:
```
name: String
on: On
env: EnvironmentVariables?
concurrency: Concurrency?
permissions: (*Permissions|"read-all"|"write-all")?
jobs: Jobs
```

The template itself as well as the `class` definitions can be found in the [Workflow.pkl](Workflow.pkl) file.

## Adopters

This module is already used in the following repositories:
* [StefMa/pkl-gha](https://github.com/StefMa/pkl-gha/tree/725a23cc42112a11dec32ff934d3166bddc54e5c/.github/pkl-workflows)
* [pkl-community/setup-pkl](https://github.com/pkl-community/setup-pkl/tree/52a58184f4f3e64a7fd8444f2a5dee6fa8eeba58/.github/pkl-workflows)
* [realm/realm-dotnet](https://github.com/realm/realm-dotnet/tree/d44ca659e2744ce0a210ff7ffbcb59607d8b3dac/.github/pkl-workflows)

Additionally, it is used in the internal codebase of the [ioki](https://ioki.com/en/platform/) Android White-Label Apps.

Let me know if you have also adopted the module, or submit a PR!

## Release

**Step 1**: Make sure you're on the `main` branch and pull the latest changes.

```bash
git checkout main
git pull origin main
```

**Step 2**: Create a git tag in form of `com.github.action@[SEMVER_VERSION]`.

```bash
git tag com.github.action@[SEMVER_VERSION]
```

> [!IMPORTANT]
> The `[SEMVER_VERSION]` should be the same as the version in the `PklProject` and `doc-package-info.pkl` files.

**Step 3**: Push the tag to the remote repository.

```bash
git push origin com.github.action@[SEMVER_VERSION]
```

**Step 4**: The tag creates a new release on GitHub.
Go to the [releases](http://github.com/StefMa/pkl-gha/releases) page and edit the new release.
Put some information about the changes in the description and publish the release.

**Step 5**: Update the version in the [PklProject](PklProject) and [doc-package-info](doc-package-info.pkl) files.
Adjust the version to the next [Semantic Versioning](https://semver.org/) version.

Commit and push the changes:
```bash
git commit -m "Bump version to [SEMVER_VERSION]" .
git push origin main
```
