/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DASHBOARD_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
