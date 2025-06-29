/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_GOOGLE_DRIVE_CLIENT_ID: string
  readonly VITE_DROPBOX_APP_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}