

# NPM-la-recovery
View dependants of a particular package, even if you can't use npm install.

## Usage

```bash
npm-la-recovery --name <package-name>
```

or

```bash
npm-la-recovery --name <package-name>@<version>
```

or 

```bash
npm-la-recovery --name <package-name>@<version> --local
```


Using the local flag, means that it will use the local project as the base package.
Without the local flag, it will use the most recent published package as the base package..


## installation

```bash
$ npm install -g npm-la-recovery
```