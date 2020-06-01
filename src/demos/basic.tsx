import React, { useState } from "react";
import { createSvs } from "../lib";

// Services often declare state and state-updating routines
const CounterSvs = createSvs((scope, initial) => {
  const [count, setCount] = useState(initial);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return { count, decrement, increment };
});

export default function Demo() {
  /**
   * Make App component be the host of CounterSvs.
   * You can get the service output immediately in the hosting component,
   * without need to wrap it in a HOC.
   */
  const [scope, { count, increment }] = CounterSvs.useProvideNewScope(10);
  // scope.injectTo make the service output available in this subtree
  return scope.injectTo(
    <div>
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
