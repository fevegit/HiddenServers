/*
 * Shared Spanish/English localization helper
 * Copyright (c) 2026 feve
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type SupportedLanguage = "es" | "en";

function readLocale(): string {
    const documentLocale = typeof document !== "undefined"
        ? document.documentElement?.lang ?? ""
        : "";

    const navigatorLocale = typeof navigator !== "undefined"
        ? navigator.language ?? ""
        : "";

    return documentLocale || navigatorLocale || "en";
}

export function getLanguage(): SupportedLanguage {
    return readLocale().toLowerCase().startsWith("es") ? "es" : "en";
}

export function t(spanish: string, english: string): string {
    return getLanguage() === "es" ? spanish : english;
}