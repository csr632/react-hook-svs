# react-hook-svs

Implement shared services using React hooks. Organize your data layer clearly and concisely. `react-hook-svs` aims to be your last state management library.

> You can [use codesandbox to open this project and run its demos](https://codesandbox.io/s/react-hook-svs-9yzsh?fontsize=14&hidenavigation=1&moduleview=1&theme=dark).

What I mean by state management(or data layer, or data model):

- You can declare a state store to host shared state. This store lives somewhere in the component tree and can be accessed by its descendants.
- The state store should contain some routines(functions) to update the state. The update routines can be sync or async. Consumer should trigger data update by calling the routines, instead of set data fields by hand.
  - This practice makes your data model well-encapsulated, and lead to better code reuse and less bugs.
- The descendant components(consumers) can read the shared state. When the shared state is updated, consumers should re-render. This is called reactive.

## Key ideas

- Typescript first. Get full power of intellisense and type-checking. No string-based action type dispatch like redux. Let type system do most works for you.
- By taking take full advantage of react hooks, you can get better logic reuse & code organization. You can benefit from all the awesome hook libraries from react community.
- Easy to learn. We embrace the mind model of React and hooks, with only two new concept(Service and Scope). The library source code is **only 100 lines of code**, and many of them are just Typescript type notation.
- Get service output immediately in the hosting component. You **no longer need to wrap your top component with provider HOC** to get service output in it.
  - Formerly, if you want to get service output in the top component, you have to wrap your top component with provider HOC, then use `useContext(ServiceCtx)` in your top component to get the service output. But with `react-hook-svs`, you just run the service in the hosting component, and the output will be returned(just like normal hooks).
  - This is one of the major advantages compared with [unstated-next](https://github.com/jamiebuilds/unstated-next). This helps you to reduce boilerplate code.
- Besides composing with normal React hooks, `react-hook-svs` give you even more composability: **service composition**. Service composition is achieved by running two services in same scope. So the latter ones can consume the output of the former ones. Service composition give you following benefits:
  - Service providers(basically React context) are composited together and will be injected into a JSX subtree **at once**.
    - Traditionally(without `react-hook-svs`), we use React context to achieve service composition:`<Provider1> <Provider2> <Provider3> <App /> </Provider3> </Provider2> </Provider1>` (the inner ones can depend on the outer ones). If you get a lot of providers, you will end up in [provider hell](https://github.com/jamiebuilds/unstated-next/issues/35). But with `react-hook-svs`, you can achieve exactly the same with **chaining**(the latter ones can depend on the former ones).
    - This is one of the major advantages compared with [unstated-next](https://github.com/jamiebuilds/unstated-next). This will make your JSX tree much cleaner.
- Service abstraction.
  - Normal React hooks abstraction: the caller of a hook can't know whether the hook call other hooks in it. The nesting hook call is abstracted by the parent hook.
  - Beside normal React hooks abstraction, `react-hook-svs` gives you Service abstraction: SvsA can run(instead of consume) SvsB inside it, but the user of SvsA will not feel the existance of SvsB. SvsA can re-export and re-name the output of SvsB.
- Precise control of service visibility. You can make a scope(which contains some services' output) only visible to a portion of children. You can make two children consume same kind of service, but two independent outputs.
  - [unstated-next](https://github.com/jamiebuilds/unstated-next) just can not do that while still consuming the service output in the host component.

## APIs

### Service

#### createSvs

Take a hook and return a service object.

```ts
function createSvs<Input extends any[], Output>(
  useHook: (scope: IScope, ...input: Input) => Output
): ISvs<Input, Output>;
```

The service object have the following interface:

```ts
interface ISvs<Input extends any[], Output> {
  /**
   * Shorthand for `const scope = useScope(); const output = scope.useProvideSvs(svs, ...input);`
   */
  useProvideNewScope(...input: Input): readonly [Output, IScope];
  /**
   * Find nearest service output from ancestor components.
   * When optional==true, return NOT_FOUND when service not found.
   * Otherwise, throw error when service not found.
   */
  useCtxConsume(): Output;
  useCtxConsume(optional: boolean): Output | typeof NOT_FOUND;
}
```

### Scope

#### useScope

Create a new scope object.

```ts
function useScope(): IScope;
```

The scope object have the following interface:

```ts
interface IScope {
  /**
   * Create a **child scope** of **this scope**.
   * Run the service in the **child scope**.
   * Put the service output in **this scope**.
   * The output will be visible by following services in this scope and the component subtree wrapped by `injectTo`.
   */
  useProvideSvs<Input extends any[], Output>(
    svs: ISvs<Input, Output>,
    ...input: Input
  ): Output;
  /**
   * Create a **child scope** of **this scope**.
   * Run the service in the **child scope**.
   * Don't put the service output in **this scope**.
   */
  useRunSvs<Input extends any[], Output>(
    _svs: ISvs<Input, Output>,
    ...input: Input
  ): Output;
  /**
   * Find a service output from this scope, or its ancestor scope, and React context.
   */
  useConsumeSvs<Input extends any[], Output>(svs: ISvs<Input, Output>): Output;
  useConsumeSvs<Input extends any[], Output>(
    svs: ISvs<Input, Output>,
    optional: boolean
  ): Output | typeof NOT_FOUND;
  /**
   * Make the service outputs in this scope be visible by the wrapped JSX subtree. So that descendant components can consume them.
   * It takes a JSX tree, wrap it with React context provider, and return a new JSX tree that you should render.
   */
  injectTo: (children?: React.ReactNode) => React.ReactNode;
  /**
   * Create a child scope.
   * Finding a service output in a scope works like JS prototype chain.
   * You don't need to call this API manually in most cases.
   */
  createChild(): IScope;
}
```
