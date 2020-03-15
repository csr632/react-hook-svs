# react-hook-svs

Implement shared services using React hooks. Organize your data layer clearly and concisely. `react-hook-svs` aims to be your last state management library.

What I mean by state management(or data layer, or data model):

- You can declare a state store to host shared state. This store lives somewhere in the component tree and can be accessed by its descendants.
- The state store should contain some routines(functions) to update the state. The update routines can be sync or async. Consumer should trigger data update by calling the routines, instead of set data fields by hand.
  - This practice makes your data model well-encapsulated, and lead to better code reuse and less bugs.
- The descendant components(consumers) can read the shared state. When the shared state is updated, consumers should re-render. This is called reactive.

## Features

- Typescript first. Get full power of intellisense and type-checking. No string-based action type dispatch like redux.
- Better logic reuse & code organization & logic composition. This is benefit from the composability of React hooks.
- Easy to learn. We embrace the mind model of React and hooks, with only two new concept(Service and Scope). The library source code is **only 100 lines of code**, and many of them are just Typescript type notation.
- **Compose multiple service providers** together and inject them into a JSX subtree **at once**.
  - Formerly, if you have many services to provide, you need to write provider hell in JSX like this:`<Provider1> <Provider2> <Provider3> <App /> </Provider3> </Provider2> </Provider1>` (the inner one can depend on the outer one). But with `react-hook-svs`, you can achieve exactly the same with **chaining**(the latter one can depend on the former one).
  - This is one of the major advantages compared to [unstated-next](https://github.com/jamiebuilds/unstated-next).
- Get service output immediately in the hosting component. You **never need to wrap your top component with HOC** to get service output in it.
  - Formerly, if you want to get service output in the top component, you have to wrap your top component with Provider HOC, then use `useContext(ServiceCtx)` in your top compoent to get the service output. But with `react-hook-svs`, you never need to wrap your service hosting component with HOC.
  - This is one of the major advantages compared to [unstated-next](https://github.com/jamiebuilds/unstated-next).
