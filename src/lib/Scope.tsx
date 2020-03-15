import React from "react";
import { ISvs, ISvsInternal, NOT_FOUND } from "./createSvs";

export type Wrapper = (children?: React.ReactNode) => React.ReactNode;

export interface IScope {
  createChild(): IScope;
  injectTo: Wrapper;
}

export class ScopeInternal implements IScope {
  private readonly parent: ScopeInternal | undefined;
  private readonly loaded: Map<ISvs<any, any>, any> = new Map();
  private _wrapper: Wrapper = c => c;

  constructor(parent?: ScopeInternal) {
    this.parent = parent;
  }

  provide<Input extends any[], Output>(
    svs: ISvs<Input, Output>,
    output: Output
  ): void {
    if (this.loaded.has(svs)) {
      throw new Error(`svs is already provided in this scope.
      You should create a child scope to run it.`);
    }
    const CtxProvider = (svs as ISvsInternal<Input, Output>).__ctx.Provider;
    const wrapper: Wrapper = (children?: React.ReactNode) => {
      return <CtxProvider value={output}>{children}</CtxProvider>;
    };
    const oldWrapper = this._wrapper;
    this._wrapper = c => oldWrapper(wrapper(c));
    this.loaded.set(svs, output);
  }

  find<Input extends any[], Output>(
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
