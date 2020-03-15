import React, { useState } from "react";
import { createSvs } from "../lib";

// 声明状态容器、状态更新逻辑
const CounterSvs = createSvs((scope, initial = 0) => {
  const [count, setCount] = useState(initial);
  let decrement = () => setCount(count - 1);
  let increment = () => setCount(count + 1);
  return { count, decrement, increment };
});

export default function App() {
  // 将一个组件作为宿主，实例化状态仓储
  // 宿主本身也可以读取状态、更新状态
  const [{ count, increment }, scope] = CounterSvs.useProvideNewScope(10);
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
  // 获取状态、状态更新方法
  let { count, decrement, increment } = CounterSvs.useConsume();
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
