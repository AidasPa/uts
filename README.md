# UTS
> Simple toolkit for working with TS and UnrealJS


https://www.npmjs.com/package/@aidaspa/uts

## Installation :mailbox:
`npm i -g @aidaspa/uts`

## Why :question:
This package was built in order to help ease the development with UnrealJS - no weird class compilations, full typescript support, custom extension to support decorations (or the so called "macros") and a CLI tool to generate some boilerplate.

## Philosophy :dizzy:
- There are 2 folders: `out/` and `src/`. All source code lives in the `src/` directory, while the compiled code lives strictly in the `out/` directory - you should be targeting them when working with the `Javascript` Component in UE4. The folder structure inside the `out/` directory is always reflected from the `src/`
- There are 2 extensions: `.u.ts` & `.ts`. The `.u.ts` extension contains any code that interfaces with the `UnrealJS` API. It is separated because of the differences when compiling normal TypeScript and this mess. Both file extensions are always compiled down to `.js` in the `out/` dir.
- `.u.ts` decorators. This toolkit utilizes typescript decorators to annotate classes, properties and methods: `@UCLASS()`, `@UPROPERTY()`, `@UFUNCTION`. If you've done any c++ development with unreal before, you should be familiar with these.
- Boilerplates. All `.u.ts` are preferred to be generated via the CLI.
- Any UnrealJS related class declaration must have a `@UCLASS` decorator specified - otherwise the `.u.ts` compiler will ignore it.

## TODO

- [x] `.u.ts` file extension
- [x] File Watcher
- [x] CLI
- [ ] `@UFUNCTION` Support
- [ ] **vscode** extension
- [ ] Use Babel to compile `.u.ts`
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
After initializing the project you should fire up the file watcher with:

> `uts watch`

This will watch all `.ts` and `.u.ts` files under `src/` and compile them to `out/`.

## Decorator Documentation :book:
- `@UCLASS()` Shows the compiler which classes it should touch, it is **required** for all `.u.ts` classes in order to compile properly. Declared above a class declaration.
- `@UPROPERTY(Arg1)` Just like in c++, can accept, as of right now, only one argument: `EditAnywhere` or `VisibleAnywhere`. Declared above class fields/properties.
- `@KEYBIND(type: BindAxis, action: string)` Creates a keybinding for a method, action is your UE4 configured keybinding.
- `@KEYBIND(type: BindAction, action: string, event: IE_RELEASED | IE_PRESSED)`
- `@UFUNCTION` TODO ...

## Caveats :poop:

Sadly, there are a *few* caveats when writing code using this toolkit (nothing that can't be worked on in the future).

1. In order for intellisense to work, you need to set the `.u.ts` file extension be treated as `.ts` You can do this on **vscode** by configuring the file association for `.u.ts` files.
2. Because of #2, **vscode** bugs out and doesn't read the `tsconfig.json` file which enables `experimentalDecorators`. You also can't ignore specific decorator lines because a decorator **must** be above a declaration. One workaraound is simply livin with some squiggly lines or adding a `// @ts-nocheck` ( :neutral_face: ) at the top. 
3. ONLY ONE CLASS PER `.u.ts`. Use `commonjs` modules for inheritance.

## Support, Feedback and Contributions :heart:
Having an issue? Feel free to open one here.  
Want to contribute? PRs are always welcome no matter how big.
