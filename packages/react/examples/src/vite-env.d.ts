/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TREASURE_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
