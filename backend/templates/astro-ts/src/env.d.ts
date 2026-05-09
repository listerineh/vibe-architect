/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_NAME: string
  readonly PUBLIC_APP_URL: string
  readonly PUBLIC_API_URL: string
  readonly PUBLIC_ENABLE_ANALYTICS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
