import React, { useState } from "react";
import { createSvs } from "../lib";

// Services often declare state and state-updating routines
const CounterSvs = createSvs((scope, initial) => {
  const [count, setCount] = useState(initial);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return { count, decrement, increment };
});

export default () => {
  // Make App be the host of CounterSvs.
  // You can get the service output immediately in hosting component,
  // without need to wrap App in a HOC.
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
};

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
