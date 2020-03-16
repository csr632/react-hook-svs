# rfc

## Motivation

**I hope remote communication can be done thoroughly and consistently.**

Currently, hooks cannot provide a context. And hooks cannot consume sibling hook with context.
The only way to communicate between sibling hooks are "hookA return value -> hookB parameter". But that require us to broaden API of hookB and make it less reusable.
**We are forced to lift things up to make it consumable by `useContext`**, which often lead to "nested HOCs" or "provider hell".
What's worse, this make hooks less composable. There should be a **consistent way** to commuicate with between components/hooks:

- components/hooks consume ancestor components' providing value. (context already achieve that)
- hooks consume current component's providing value.
- hooks consume _former sibling hook_'s providing value.
- nested hook consume parent hook's providing value. (even it is deeeeeeeeeeply nested)

Most of the above communication can not be achieved by context currently.

What I mean by "consistent way": if a hook do `const val = useBetterContext(Context)`, the value can come from ancestor component, or current component, or former sibling hook, or ancestor hook. But the hook can't tell which it come from(and it don't care). This kind of context communication will make hooks more composable.

I don't think this will introduce more coupling in user code, because current context is already doing remote communication. But current context is not doing it thoroughly. **I hope remote communication can be done thoroughly and consistently.**

## Proposal

Introduce a scope object:

- hooks/components can add context provider to a scope object
- hooks/components can consume context provider from scope
- inject all the context provider into JSX tree at once.

```tsx
const ctx1 = React.createContext();
const ctx2 = React.createContext();

const useScopedHook1 = React.createScopedHook(function useHook1(
  scope,
  ...otherArgs
) {
  scope.provide(ctx1, "any value1");
});

const useScopedHook2 = React.createScopedHook(function useHook2(
  scope,
  ...otherArgs
) {
  const val = scope.consume(ctx1);
  console.log(val === "any value1"); // true
});

const useScopedHook3 = React.createScopedHook(function useHook3(
  scope,
  ...otherArgs
) {
  const val = scope.consume(ctx1);
  console.log(val === "any value1"); // true
  // scope.
});

function App() {
  const scope = useScope();
  useHook1(scope);
  const val = scope.consume(ctx1);
  console.log(val === "any value1"); // true
  // make the ctx1 visible to children
  return scope.inject(
    <div>
      <Child />
    </div>
  );
  // or:
  // return <div>{scope.inject(<Child />)}</div>;
}
```
