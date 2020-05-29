import React from "react";
import { ISvs, ISvsInternal, NOT_FOUND } from "./createSvs";

export type Wrapper = (children?: React.ReactNode) => React.ReactNode;

export interface IScope {
  /**
   * Create a **child scope** of **this scope**.
   * Run the service in the **child scope**.
   * Put the service output in **this scope**.
   * The output will be visible by following services in this scope and the component subtree wrapped by `injectTo`.
   *
   * The "parent scope - child scope" structure will form a "enviroment tree" to resolve context requests properly.
   * It just works like enviroment model of most programing languages.
   */
  useProvideSvs<Input extends any[], Output>(
    svs: ISvs<Input, Output>,
    ...input: Input
  ): Output;
  /**
   * Create a **child scope** of **this scope**.
   * Run the service in the **child scope**.
   * Don't put the service output in **this scope**.
   */
  useRunSvs<Input extends any[], Output>(
    _svs: ISvs<Input, Output>,
    ...input: Input
  ): Output;
  /**
   * Find a service output from this scope, or its ancestor scope, or React context.
   */
  useConsumeSvs<Input extends any[], Output>(svs: ISvs<Input, Output>): Output;
  useConsumeSvs<Input extends any[], Output>(
    svs: ISvs<Input, Output>,
    optional: boolean
  ): Output | typeof NOT_FOUND;
  /**
   * Make the service outputs in this scope be visible by the wrapped JSX subtree. So that descendant components can consume them.
   * It takes a JSX tree, wrap it with React context provider, and return a new JSX tree that you should render.
   */
  injectTo: Wrapper;
  /**
   * Create a child scope.
   * Finding a service output in a scope works like JS prototype chain.
   * You don't need to call this API manually in most cases.
   */
  createChild(): IScope;
}

export class ScopeInternal implements IScope {
  private readonly parent: ScopeInternal | undefined;
  private readonly loaded: Map<ISvs<any, any>, any> = new Map();
  private _wrapper: Wrapper = (c) => c;

  constructor(parent?: ScopeInternal) {
    this.parent = parent;
    if (parent) this._wrapper = parent._wrapper;
  }

  private _useRunSvs<Input extends any[], Output>(
    _svs: ISvs<Input, Output>,
    ...input: Input
  ): [Output, Wrapper] {
    const svs = _svs as ISvsInternal<Input, Output>;
    if (this.loaded.has(svs)) {
      throw new Error(`Service is already provided in this scope.
      You should create a child scope to run it.`);
    }
    // the hooks inside 'useHooks' shouldn't affect current scope
    const [output, wrapper] = svs.__useRun(this.createChild(), ...input);
    return [output, wrapper];
  }

  useRunSvs<Input extends any[], Output>(
    _svs: ISvs<Input, Output>,
    ...input: Input
  ): Output {
    return this._useRunSvs(_svs, ...input)[0];
  }

  useProvideSvs<Input extends any[], Output>(
    svs: ISvs<Input, Output>,
    ...input: Input
  ): Output {
    const [output, wrapper] = this._useRunSvs(svs, ...input);
    const oldWrapper = this._wrapper;
    this._wrapper = (c) => oldWrapper(wrapper(c));
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
    if (this.parent) {
      throw new Error(
        `You should avoid injecting a child scope. It will make things difficult.`
      );
    }
    return this._wrapper;
  }
}

export function useScope(): IScope {
  return new ScopeInternal();
}
