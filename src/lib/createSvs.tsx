import React, { useContext } from "react";
import { IScope, Wrapper, useScope } from "./Scope";

export const NOT_FOUND = "__nθt_found__" as const;

export interface ISvs<Input extends any[], Output> {
  /**
   * Shorthand for `const scope = useScope(); const output = scope.useProvideSvs(svs, ...input);`
   */
  useProvideNewScope(...input: Input): readonly [IScope, Output];
  /**
   * Find nearest service output from ancestor components.
   * When optional==true, return NOT_FOUND when service not found.
   * Otherwise, throw error when service not found.
   */
  useCtxConsume(): Output;
  useCtxConsume(optional: boolean): Output | typeof NOT_FOUND;
}

export interface ISvsInternal<Input extends any[], Output>
  extends ISvs<Input, Output> {
  __ctx: React.Context<Output | typeof NOT_FOUND>;
  __useRun: (scope: IScope, ...input: Input) => readonly [Output, Wrapper];
}

export function createSvs<Input extends any[], Output>(
  useHook: (scope: IScope, ...input: Input) => Output
): ISvs<Input, Output> {
  const ctx = React.createContext<Output | typeof NOT_FOUND>(NOT_FOUND);

  const svs: ISvsInternal<Input, Output> = {
    useCtxConsume,
    useProvideNewScope,
    __useRun,
    __ctx: ctx,
  };

  return svs;

  function __useRun(scope: IScope, ...input: Input) {
    const output = useHook(scope, ...input);
    const wrapper: Wrapper = (children?: React.ReactNode) => {
      return <ctx.Provider value={output}>{children}</ctx.Provider>;
    };
    return [output, wrapper] as const;
  }

  function useProvideNewScope(...input: Input) {
    const scope = useScope();
    const output = scope.useProvideSvs(svs, ...input);
    return [scope, output] as const;
  }

  function useCtxConsume(): Output;
  function useCtxConsume(optional: boolean): Output | typeof NOT_FOUND;
  function useCtxConsume(optional?: boolean) {
    const ctxVal = useContext(ctx);
    if (ctxVal !== NOT_FOUND) return ctxVal;
    if (optional) return NOT_FOUND;
    throw new Error(`This service is not available in react context.
      You should provide it in ancester component.`);
  }
}
