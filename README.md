# UTS
![npm](https://img.shields.io/npm/dw/@aidaspa/uts)
![GitHub package.json version](https://img.shields.io/github/package-json/v/aidaspa/uts)
> Simple toolkit for working with TS and UnrealJS

![CLI Gif](https://i.ibb.co/CvWKHQL/uts.gif)

## Installation :mailbox:
`npm i -g @aidaspa/uts`

Or if you always want the latest version without installing

`npx @aidaspa/uts`

## Upgrade to 1.0.0 :star2:

If you didn't use `npx`, please update to the latest version by running `npm i -g @aidaspa/uts` again.

This major release introduces a custom written babel plugin - [babel-plugin-uts](https://github.com/AidasPa/babel-plugin-uts)

In order to upgrade you simply need to run the `init` command again. This will install additional packages and create a `.babelrc` file as required for babel.

**A breaking change: replace all `export = {export}` with `export default {export}`**

Full list of changes can be seen in the release notes.

## Why :question:
This package was built in order to help ease the development with UnrealJS - no weird class compilations, full typescript support, custom extension to support decorations (or the so called "macros") and a CLI tool to generate some boilerplate.

## Philosophy :dizzy:
- There are 2 folders: `out/` and `src/`. All source code lives in the `src/` directory, while the compiled code lives strictly in the `out/` directory - you should be targeting them when working with the `Javascript` Component in UE4. The folder structure inside the `out/` directory is always reflected from the `src/`
- There are 2 extensions: `.u.ts` & `.ts`. The `.u.ts` extension contains any code that interfaces with the `UnrealJS` API. It is separated because of the differences when compiling normal TypeScript and this mess. Both file extensions are always compiled down to `.js` in the `out/` dir.
- `.u.ts` decorators. This toolkit utilizes typescript decorators to annotate classes, properties and methods: `@UCLASS()`, `@UPROPERTY()`, `@KEYBIND()`. If you've done any c++ development with unreal before, you should be familiar with these.
- Boilerplates. All `.u.ts` are preferred to be generated via the CLI.
- Any UnrealJS related class declaration must have a `@UCLASS` decorator specified - otherwise the `.u.ts` compiler will ignore it.

## TODO

- [x] `.u.ts` file extension
- [x] File Watcher
- [x] CLI
- [x] `@UFUNCTION` Support
- [x] Use Babel to compile `.u.ts`
- [ ] CLI Template generation (third person, first person etc..)

## The CLI :computer:

### Initializing a project :bulb:
When initializing a fresh project after setting up the `UnrealJS` plugin you need to run:

> `uts init`

This command will generate some additional typing files to support the decorators.

---

### Creating `.u.ts` classes :pencil2:
Whenever you want to generate a `.u.ts` file you can run one of the following:

> `uts create:actor {ClassName}`

Where `{ClassName}` can also include forward-slashes (`/`) to specify a directory.

### Compiling source code :eyes:
After initializing the project you should fire up the babel file watcher with:

> `yarn run watch`

This will watch all `.ts` and `.u.ts` files under `src/` and compile them to `out/`.

## Decorator Documentation :book:
- `@UCLASS(BlueprintComponent?)` Shows the compiler which classes it should touch, it is **required** for all `.u.ts` classes in order to compile properly. Declared above a class declaration. The `BlueprintComponent` argument tells the compiler that this file should be loaded from UE4. Not required, but what this does is it cleans the code up a little bit.
- `@UPROPERTY(Arg1)` Just like in c++, can accept, as of right now, only one argument: `EditAnywhere` or `VisibleAnywhere`. Declared above class fields/properties.
- `@KEYBIND(type: BindAxis, action: string)` Creates a keybinding for a method, action is your UE4 configured keybinding.
- `@KEYBIND(type: BindAction, action: string, event: IE_RELEASED | IE_PRESSED)`
- `@UFUNCTION(...args)` Tells the compiler that the decorated method is an RPC. `...args`: `Reliable | Unreliable`, `Server | Client | NetMulticast`

## Examples :speech_balloon:
Here's a [link](https://gist.github.com/AidasPa/ce857725a6e64c5179d249f897bcbe84) to a gist containing code required to re-create the third person character in `.u.ts`: 

## Support, Feedback and Contributions :heart:
Having an issue? Feel free to open one here.  
Want to contribute? PRs are always welcome no matter how big, but please make sure you follow linter rules defined in [.eslintrc.js](https://github.com/AidasPa/uts/blob/master/.eslintrc.js)
