// Type declarations for cors module
// This file ensures TypeScript can find types for cors even if @types/cors is not properly resolved
declare module 'cors' {
  import { RequestHandler } from 'express';
  
  interface CorsOptions {
    origin?: boolean | string | RegExp | (boolean | string | RegExp)[] | CorsOriginFunction;
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }
  
  type CorsOriginFunction = (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => void;
  
  function cors(options?: CorsOptions): RequestHandler;
  
  export = cors;
}

