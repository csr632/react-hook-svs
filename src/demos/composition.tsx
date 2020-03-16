import React, { useState } from "react";
import { createSvs, useScope } from "../lib";

const StepSvs = createSvs((scope, initVal) => {
  const [step, setStep] = useState(initVal);
  return {
    step,
    increment: () => {
      setStep(step + 1);
    }
  };
});

const SumSvs = createSvs((scope, initVal) => {
  const [sum, setSum] = useState(initVal);
  // Find StepSvs in scope and React context.
  // This allow services to consume(depend on) other services,
  // even they live in the same host component!
  const { step } = scope.useConsumeSvs(StepSvs);
  return {
    sum,
    add: () => {
      setSum(sum + step);
    }
  };
});

export default () => {
  // Service composition is achieved by running two services in same scope. So the latter ones can consume the output of the former ones.
  const [{ step, increment }, scope] = StepSvs.useProvideNewScope(1);
  const { sum, add } = scope.useProvideSvs(SumSvs, 0);
  // If you do this, they can not interact:
  // SumSvs.useProvideNewScope(0);

  // Inject two services Provider in scope at once.
  // Instead of writing provider hell like this:
  // <Provider1><Provider2>children</Provider2></Provider1>
  return scope.injectTo(
    <div>
      <p>
        step: {step}.<button onClick={increment}>increment step</button>
      </p>
      <p>
        sum: {sum}.<button onClick={add}>add step to it</button>
      </p>
      <Child />
    </div>
  );
};

const Child: React.FC = () => {
  const { step, increment } = StepSvs.useCtxConsume();
  // If requested service is not in the scope,
  // it will fallback to react context.
  const emptyScope = useScope();
  const { sum, add } = emptyScope.useConsumeSvs(SumSvs);
  return (
    <div>
      Access services in child component:
      <div>
        <p>
          step: {step}.<button onClick={increment}>increment step</button>
        </p>
        <p>
          sum: {sum}.<button onClick={add}>add step to it</button>
        </p>
      </div>
    </div>
  );
};
