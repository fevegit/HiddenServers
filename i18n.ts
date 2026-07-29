/*
 * Shared Spanish/English localization helper
 * Copyright (c) 2026 feve
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LocaleStore } from "@webpack/common";

export type SupportedLanguage = "es" | "en";

interface DiscordLocaleStore {
    locale?: string;
    getLocale?: () => string;
}

function readDiscordLocale(): string {
    const store = LocaleStore as unknown as DiscordLocaleStore | undefined;

    return store?.locale
        ?? store?.getLocale?.()
        ?? "en-US";
}

export function getLanguage(): SupportedLanguage {
    return readDiscordLocale().toLowerCase().startsWith("es") ? "es" : "en";
}

export function t(spanish: string, english: string): string {
    return getLanguage() === "es" ? spanish : english;
}
