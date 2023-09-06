/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ID?: string;
    readonly VITE_APP_URI?: string;
    readonly VITE_HTTPS_KEY?: string;
    readonly VITE_HTTPS_CERT?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}