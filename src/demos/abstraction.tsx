import React, { useState } from "react";
import { createSvs, NOT_FOUND } from "../lib";

const ConfigSvs = createSvs(() => {
  return {
    INITIAL_STEP: 10,
    INITIAL_SUM: 0,
  };
});

const SumSvs = createSvs((scope) => {
  const { INITIAL_SUM } = scope.useConsumeSvs(ConfigSvs);
  const [sum, setSum] = useState(INITIAL_SUM);
  const { step, increment } = scope.useProvideSvs(StepSvs);
  // One service can run another service.
  // Parent service can re-export and re-name child service output.
  return {
    sum,
    addStepToSum: () => {
      setSum(sum + step);
    },
    step,
    incremenStep: increment,
  };
});

const StepSvs = createSvs((scope) => {
  // Nested service can consume things from its parent's scope.
  const { INITIAL_STEP } = scope.useConsumeSvs(ConfigSvs);
  const [step, setStep] = useState(INITIAL_STEP);
  return {
    step,
    increment: () => {
      setStep(step + 1);
    },
  };
});

export default function Demo() {
  const [scope] = ConfigSvs.useProvideNewScope();

  // The user of SumSvs will not feel the existance of StepSvs(abstraction).
  const { sum, addStepToSum, step, incremenStep } = scope.useProvideSvs(SumSvs);

  // The nested service will not pollute the current scope.
  // This make your code more predictable.
  const stepSvs = scope.useConsumeSvs(StepSvs, true);
  console.log(stepSvs === NOT_FOUND); // true

  return (
    <div>
      <p>
        step: {step}.<button onClick={incremenStep}>increment step</button>
      </p>
      <p>
        sum: {sum}.<button onClick={addStepToSum}>add step to it</button>
      </p>
    </div>
  );
}
