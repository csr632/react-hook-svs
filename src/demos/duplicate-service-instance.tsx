import React, { useState } from "react";
import { createSvs } from "../lib";

const CounterSvs = createSvs((scope, initial) => {
  const [count, setCount] = useState(initial);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return { count, decrement, increment };
});

export default () => {
  // Same service, but two independent instances
  const [counter1, scope1] = CounterSvs.useProvideNewScope(10);
  const [counter2, scope2] = CounterSvs.useProvideNewScope(66);

  return (
    <div className="App">
      <p>Counter1: {counter1.count}</p>
      {scope1.injectTo(<OperationButtons />)}
      <hr />
      <p>Counter2: {counter2.count}</p>
      {scope2.injectTo(<OperationButtons />)}
    </div>
  );
};

function OperationButtons() {
  const { increment, decrement } = CounterSvs.useCtxConsume();
  return (
    <div>
      Operations:
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </div>
  );
}
