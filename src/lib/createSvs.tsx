import React, { useContext } from "react";
import { IScope, ScopeInternal, useScope } from "./Scope";

export const NOT_FOUND = "__nθt_found__" as const;

export interface ISvs<Input extends any[], Output> {
  useProvideNewScope: (...input: Input) => [Output, IScope];
  useProvide: (scope: IScope, ...input: Input) => Output;
  // function overload
  useConsume(): Output;
  useConsume(optional: boolean): Output | typeof NOT_FOUND;
  useConsume(scope: IScope): Output;
  useConsume(scope: IScope, optional: boolean): Output | typeof NOT_FOUND;
}

export interface ISvsInternal<Input extends any[], Output>
  extends ISvs<Input, Output> {
  __ctx: React.Context<Output | typeof NOT_FOUND>;
}

export function createSvs<Input extends any[], Output>(
  useHook: (scope: IScope, ...input: Input) => Output
): ISvs<Input, Output> {
  const ctx = React.createContext<Output | typeof NOT_FOUND>(NOT_FOUND);

  const svs: ISvsInternal<Input, Output> = {
    useProvideNewScope,
    useProvide,
    useConsume,
    __ctx: ctx
  };

  return svs;

  function useProvide(scope: IScope, ...input: Input) {
    const output = useHook(scope.createChild(), ...input);
    // only output are put in current scope
    // the hooks in 'useHooks' don't affect current scope
    // becaue we make useHooks run in a child scope
    (scope as ScopeInternal).provide(svs, output);
    return output;
  }

  function useProvideNewScope(...input: Input): [Output, IScope] {
    const scope = useScope();
    const output = useProvide(scope, ...input);
    return [output, scope];
  }

  function useConsume(): Output;
  function useConsume(optional: boolean): Output | typeof NOT_FOUND;
  function useConsume(scope: IScope): Output;
  function useConsume(
    scope: IScope,
    optional: boolean
  ): Output | typeof NOT_FOUND;
  function useConsume(
    scopeOrOptional?: IScope | boolean | undefined,
    _optional?: boolean
  ) {
    const [scope, optional] = (() => {
      if (typeof scopeOrOptional === "object" && scopeOrOptional !== null) {
        return [scopeOrOptional, !!_optional] as [IScope, boolean];
      }
      return [null, !!scopeOrOptional] as [null, boolean];
    })();
    const ctxVal = useContext(ctx);
    // This find can be optimised
    // based on the fact that
    // hooks are are called with the same order in every render
    const scopeVal = scope ? (scope as ScopeInternal).find(svs) : NOT_FOUND;
    if (scopeVal !== NOT_FOUND) return scopeVal;
    if (ctxVal !== NOT_FOUND) return ctxVal;
    if (optional) return NOT_FOUND;
    throw new Error(`There is no provider above the useConsumer.
      Did you forget to call useProvider or its wrapper?`);
  }
}
