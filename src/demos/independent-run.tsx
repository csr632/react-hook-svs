import React, { useState } from "react";
import { createSvs } from "../lib";

const CounterSvs = createSvs((scope, initial) => {
  const [count, setCount] = useState(initial);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return { count, decrement, increment };
});

export default function Demo() {
  /**
const [scope, output] = Svs.useProvideNewScope()
   * is a shorthand for:
const scope = useScope()
const output = scope.useProvideSvs(Svs)
   * 
   * Same kind of service, but two independent outputs. They lives in different scope.
   */
  const [scope1, counter1] = CounterSvs.useProvideNewScope(10);
  const [scope2, counter2] = CounterSvs.useProvideNewScope(66);

  // Error: Service is already provided in this scope.
  // scope1.useProvideSvs(CounterSvs)

  return (
    <div className="App">
      <p>Counter1: {counter1.count}</p>
      {scope1.injectTo(<OperationButtons />)}
      <hr />
      <p>Counter2: {counter2.count}</p>
      {scope2.injectTo(<OperationButtons />)}
    </div>
  );
}

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
