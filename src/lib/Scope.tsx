import React from "react";
import { ISvs, ISvsInternal, NOT_FOUND } from "./createSvs";

export type Wrapper = (children?: React.ReactNode) => React.ReactNode;

export interface IScope {
  createChild(): IScope;
  injectTo: Wrapper;
  useProvideSvs<Input extends any[], Output>(
    _svs: ISvs<Input, Output>,
    ...input: Input
  ): Output;
  useConsumeSvs<Input extends any[], Output>(svs: ISvs<Input, Output>): Output;
  useConsumeSvs<Input extends any[], Output>(
    svs: ISvs<Input, Output>,
    optional: boolean
  ): Output | typeof NOT_FOUND;
}

export class ScopeInternal implements IScope {
  private readonly parent: ScopeInternal | undefined;
  private readonly loaded: Map<ISvs<any, any>, any> = new Map();
  private _wrapper: Wrapper = c => c;

  constructor(parent?: ScopeInternal) {
    this.parent = parent;
  }

  useProvideSvs<Input extends any[], Output>(
    _svs: ISvs<Input, Output>,
    ...input: Input
  ): Output {
    const svs = _svs as ISvsInternal<Input, Output>;
    if (this.loaded.has(svs)) {
      throw new Error(`svs is already provided in this scope.
      You should create a child scope to run it.`);
    }
    const [output, wrapper] = svs.__useRun(this, ...input);
    const oldWrapper = this._wrapper;
    this._wrapper = c => oldWrapper(wrapper(c));
    this.loaded.set(svs, output);
    return output;
  }

  useConsumeSvs<Input extends any[], Output>(svs: ISvs<Input, Output>): Output;
  useConsumeSvs<Input extends any[], Output>(
    svs: ISvs<Input, Output>,
    optional: boolean
  ): Output | typeof NOT_FOUND;
  useConsumeSvs<Input extends any[], Output>(
    svs: ISvs<Input, Output>,
    optional?: boolean
  ): Output | typeof NOT_FOUND {
    const ctxVal = svs.useCtxConsume(true);
    // This find can be optimised
    // based on the fact that
    // hooks are are called with the same order in every render
    const scopeVal = this.find(svs);
    if (scopeVal !== NOT_FOUND) return scopeVal;
    if (ctxVal !== NOT_FOUND) return ctxVal;
    if (optional) return NOT_FOUND;
    throw new Error(`This service is not available in neither scope or react context.
      You should provide it in current scope or ancester component.`);
  }

  private find<Input extends any[], Output>(
    svs: ISvs<Input, Output>
  ): Output | typeof NOT_FOUND {
    if (this.loaded.has(svs)) return this.loaded.get(svs);
    if (this.parent) return this.parent.find(svs);
    return NOT_FOUND;
  }

  createChild() {
    return new ScopeInternal(this);
  }

  get injectTo() {
    return this._wrapper;
  }
}

export function useScope(): IScope {
  return new ScopeInternal();
}
