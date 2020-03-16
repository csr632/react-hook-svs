# react-hook-svs

Implement shared services using React hooks. Organize your data layer clearly and concisely. `react-hook-svs` aims to be your last state management library.

What I mean by state management(or data layer, or data model):

- You can declare a state store to host shared state. This store lives somewhere in the component tree and can be accessed by its descendants.
- The state store should contain some routines(functions) to update the state. The update routines can be sync or async. Consumer should trigger data update by calling the routines, instead of set data fields by hand.
  - This practice makes your data model well-encapsulated, and lead to better code reuse and less bugs.
- The descendant components(consumers) can read the shared state. When the shared state is updated, consumers should re-render. This is called reactive.

## Installation

```sh
npm install -S react-hook-svs
```

## Basic demo

```tsx
import React, { useState } from "react";
import { createSvs } from "react-hook-svs";

// Services often declare state and state-updating routines
const CounterSvs = createSvs((scope, initial) => {
  const [count, setCount] = useState(initial);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return { count, decrement, increment };
});

export default function App() {
  /**
   * Make App component be the host of CounterSvs.
   * You can get the service output immediately in the hosting component,
   * without need to wrap it in a HOC.
   */
  const [{ count, increment }, scope] = CounterSvs.useProvideNewScope(10);
  // scope.injectTo make the service output available in this subtree
  return scope.injectTo(
    <div className="App">
      <p>
        Use count in Host: {count} <button onClick={increment}>+</button>
      </p>
      <div>
        Use count in Children:
        <CounterDisplay />
      </div>
    </div>
  );
}

function CounterDisplay() {
  // find CounterSvs from react context
  const { count, decrement, increment } = CounterSvs.useCtxConsume();
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

[![Edit react-hook-svs](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/csr632/react-hook-svs/tree/master/src?fontsize=14&hidenavigation=1&moduleview=1&theme=dark)

## Key ideas and demos

- Typescript first. Get full power of intellisense and type-checking. No string-based action type dispatch like redux. Let type system do most works for you.
- By taking take full advantage of react hooks, you can get better logic reuse & code organization. You can benefit from all the awesome hook libraries from react community.
- Easy to learn. We embrace the mind model of React and hooks, with only two new concept(Service and Scope). The library source code is **only 100 lines of code**, and many of them are just Typescript type notation.
- Get service output immediately in the hosting component. You **no longer need to wrap your top component with provider HOC** to get service output in it.
  - Formerly(without `react-hook-svs`), if you want to get service output in the top component, you have to lift the service up: wrap your top component with provider HOC, then use `useContext(ServiceCtx)` in your top component to get the service output. But with `react-hook-svs`, you just run the service in the hosting component, and the output will be returned(just like normal hooks).
  - This is one of the major advantages compared with [unstated-next](https://github.com/jamiebuilds/unstated-next). This helps you to reduce boilerplate code.
  - [The basic demo](https://codesandbox.io/s/github/csr632/react-hook-svs/tree/master/src?fontsize=14&hidenavigation=1&moduleview=1&theme=dark) illustrates that.
- Besides composing with normal React hooks, `react-hook-svs` give you even more composability: **service composition**. Service composition is achieved by running two services in same scope. So the latter ones can consume the former ones. Service composition give you following benefits:
  - One service can consume another, even they are in the same component. `react-hook-svs` provide a consistent way to consume service: `scope.useConsumeSvs`. It will first try to find service in current component(in the scope), and fallback to React context.
    - Traditionally(without `react-hook-svs`), Different service in the same component can not interact. (Unless you pass data as hook parameters, but that make your hook API hard to use.) Different services have to be in different level of component tree in order to consume each other. To satisfy this requirement, you often end up in nested HOCs or provider hell.
  - Service providers(basically React context) are composited together and will be injected into a JSX subtree **at once**.
    - Traditionally(without `react-hook-svs`), we use React context to achieve service composition:`<Provider1> <Provider2> <Provider3> <App /> </Provider3> </Provider2> </Provider1>` (the inner ones can depend on the outer ones). If you get a lot of providers, you will end up in [provider hell](https://github.com/jamiebuilds/unstated-next/issues/35). But with `react-hook-svs`, you can achieve exactly the same with **chaining**(the latter ones can depend on the former ones).
  - This is one of the major advantages compared with [unstated-next](https://github.com/jamiebuilds/unstated-next). This will make your services more composable and your JSX tree cleaner.
  - [See this demo](https://codesandbox.io/s/github/csr632/react-hook-svs/tree/master/src?fontsize=14&hidenavigation=1&module=%2Fdemos%2Fcomposition.tsx&moduleview=1&theme=dark).
- **Service abstraction**.
  - Normal React hooks abstraction: the caller of a hook can't know whether the hook call other hooks in it. The nesting hook call is abstracted by the parent hook.
  - Beside normal React hooks abstraction, `react-hook-svs` gives you service abstraction: SvsA can run(instead of consume) SvsB inside it, but the user of SvsA will not feel the existance of SvsB: SvsB will not be visible in the scope and react context. SvsA can re-export and re-name the output of SvsB to make it visible.
  - [See this demo](https://codesandbox.io/s/github/csr632/react-hook-svs/tree/master/src?fontsize=14&hidenavigation=1&module=%2Fdemos%2Fabstraction.tsx&moduleview=1&theme=dark).
- **Precise control of service visibility**. You can make a scope(which contains some services' output) only visible to a portion of children. You can make two children consume same kind of service, but two independent outputs.
  - [unstated-next](https://github.com/jamiebuilds/unstated-next) can not do that while still consuming the service output in the host component.
  - [See this demo](https://codesandbox.io/s/github/csr632/react-hook-svs/tree/master/src?fontsize=14&hidenavigation=1&module=%2Fdemos%2Findependent-run.tsx&moduleview=1&theme=dark).

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
