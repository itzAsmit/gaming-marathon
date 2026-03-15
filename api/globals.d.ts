declare const process: {
  env: Record<string, string | undefined>;
};

declare const Buffer: {
  from(data: string, encoding?: string): Uint8Array;
  from(data: ArrayBuffer): Uint8Array;
};

declare module "@supabase/supabase-js" {
  export function createClient(url: string, key: string, options?: any): any;
}

declare module "node:stream" {
  export const Readable: any;
}
