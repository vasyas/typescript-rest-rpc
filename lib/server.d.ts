/// <reference types="koa" />
/// <reference types="koa-router" />
import * as Router from "koa-router";
import { Context } from "koa";
export declare type CreateContext = (ctx: Context) => any;
export declare function createServerRouter(prefix: string, impl: object, createContext?: CreateContext, middlewares?: any[]): Router;
