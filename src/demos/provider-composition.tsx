import React, { useState } from "react";
import { createSvs } from "../lib";

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
  /**
const [output, scope] = Svs.useProvideNewScope()
   * is a shorthand of:
const scope = useScope()
const output = scope.useProvideSvs(Svs)
   */
  const [{ step, increment }, scope] = StepSvs.useProvideNewScope(1);
  const { sum, add } = scope.useProvideSvs(SumSvs, 0);
  // inject these services into this subtree at once.
  // no provider hell like this:
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
  const { sum, add } = SumSvs.useCtxConsume();
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
