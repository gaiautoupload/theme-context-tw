export interface SiteRuntimeEnv {
  DB?: D1Database;
  SYNC_TOKEN?: string;
}

let currentEnv: SiteRuntimeEnv = {};

export function setRuntimeEnv(env: SiteRuntimeEnv) {
  currentEnv = env;
}

export function getRuntimeEnv() {
  return currentEnv;
}
