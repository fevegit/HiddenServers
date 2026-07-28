/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Feve
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { findStoreLazy } from "@webpack";
import { GuildStore, Menu, React, showToast, Toasts } from "@webpack/common";

type HiddenItemType = "server" | "folder";

interface GuildLike {
    id: string;
    name?: string;
}

interface GuildFolderLike {
    folderId?: string | number | null;
    id?: string | number | null;
    guildIds?: string[];
    folderName?: string | null;
    name?: string | null;
}

interface GuildContextProps {
    guild?: GuildLike;
    folderId?: string | number | null;
}

interface HiddenItemsManagerProps {
    type: HiddenItemType;
}

const logger = new Logger("HiddenServers");
const SortedGuildStore = findStoreLazy("SortedGuildStore") as any;

const STYLE_ELEMENT_ID = "vc-hidden-servers-dynamic-style";
const CHANGE_EVENT = "vc-hidden-servers-data-change";

const settings = definePluginSettings({
    hiddenServerIds: {
        type: OptionType.STRING,
        description: "Internal list of individually hidden server IDs.",
        default: "[]",
        hidden: true
    },
    hiddenFolderIds: {
        type: OptionType.STRING,
        description: "Internal list of hidden folder IDs.",
        default: "[]",
        hidden: true
    },
    serverManager: {
        type: OptionType.COMPONENT,
        component: () => <HiddenItemsManager type="server" />
    },
    folderManager: {
        type: OptionType.COMPONENT,
        component: () => <HiddenItemsManager type="folder" />
    }
});

const styles: Record<string, React.CSSProperties> = {
    section: {
        marginBottom: "20px",
        padding: "14px",
        borderRadius: "8px",
        background: "var(--background-secondary)"
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "8px"
    },
    title: {
        margin: 0,
        color: "var(--text-default)",
        fontSize: "16px",
        fontWeight: 600
    },
    description: {
        margin: "0 0 12px",
        color: "var(--text-muted)",
        fontSize: "13px",
        lineHeight: 1.4
    },
    empty: {
        padding: "12px",
        borderRadius: "6px",
        background: "var(--background-mod-subtle)",
        color: "var(--text-muted)",
        textAlign: "center",
        fontSize: "13px"
    },
    row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 0",
        borderTop: "1px solid var(--border-subtle)"
    },
    info: {
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: "2px"
    },
    name: {
        overflow: "hidden",
        color: "var(--text-default)",
        fontSize: "14px",
        fontWeight: 500,
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    },
    id: {
        color: "var(--text-muted)",
        fontSize: "12px",
        wordBreak: "break-all"
    },
    button: {
        flexShrink: 0,
        padding: "7px 10px",
        border: 0,
        borderRadius: "4px",
        background: "var(--button-secondary-background)",
        color: "var(--button-secondary-text)",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500
    },
    dangerButton: {
        flexShrink: 0,
        padding: "7px 10px",
        border: 0,
        borderRadius: "4px",
        background: "var(--button-danger-background)",
        color: "var(--button-danger-text)",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500
    }
};

function normaliseId(value: unknown): string | null {
    if (typeof value === "string" && value.length > 0) {
        return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return null;
}

function parseIdList(rawValue: unknown): string[] {
    if (typeof rawValue !== "string") {
        return [];
    }

    try {
        const parsed = JSON.parse(rawValue);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return Array.from(
            new Set(
                parsed
                    .map(normaliseId)
                    .filter((id): id is string => id !== null)
            )
        );
    } catch (error) {
        logger.error("Could not parse hidden item IDs:", error);
        return [];
    }
}

function getHiddenServerIds(): string[] {
    return parseIdList(settings.store.hiddenServerIds);
}

function getHiddenFolderIds(): string[] {
    return parseIdList(settings.store.hiddenFolderIds);
}

function writeIdList(type: HiddenItemType, ids: string[]) {
    const uniqueIds = Array.from(new Set(ids.map(String)));

    if (type === "server") {
        settings.store.hiddenServerIds = JSON.stringify(uniqueIds);
    } else {
        settings.store.hiddenFolderIds = JSON.stringify(uniqueIds);
    }

    applyHiddenStyles();
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

function getIds(type: HiddenItemType): string[] {
    return type === "server"
        ? getHiddenServerIds()
        : getHiddenFolderIds();
}

function toggleHiddenItem(type: HiddenItemType, rawId: unknown) {
    const id = normaliseId(rawId);
    if (!id) return;

    const currentIds = getIds(type);
    const alreadyHidden = currentIds.includes(id);

    const nextIds = alreadyHidden
        ? currentIds.filter(currentId => currentId !== id)
        : [...currentIds, id];

    writeIdList(type, nextIds);

    const itemLabel = type === "server" ? "server" : "folder";
    const actionLabel = alreadyHidden ? "shown" : "hidden";

    showToast(
        `${itemLabel[0].toUpperCase()}${itemLabel.slice(1)} ${actionLabel}.`,
        Toasts.Type.SUCCESS
    );
}

function clearHiddenItems(type: HiddenItemType) {
    const count = getIds(type).length;
    writeIdList(type, []);

    if (count > 0) {
        const label = type === "server" ? "servers" : "folders";
        showToast(`All hidden ${label} are visible again.`, Toasts.Type.SUCCESS);
    }
}

function clearEverything() {
    settings.store.hiddenServerIds = "[]";
    settings.store.hiddenFolderIds = "[]";

    applyHiddenStyles();
    window.dispatchEvent(new Event(CHANGE_EVENT));

    showToast("All hidden servers and folders are visible again.", Toasts.Type.SUCCESS);
}

function getGuildFolders(): GuildFolderLike[] {
    try {
        const folders = SortedGuildStore?.getGuildFolders?.();
        return Array.isArray(folders) ? folders : [];
    } catch (error) {
        logger.error("Could not read Discord guild folders:", error);
        return [];
    }
}

function getFolderId(folder: GuildFolderLike): string | null {
    return normaliseId(folder.folderId ?? folder.id);
}

function getFolderById(folderId: string): GuildFolderLike | null {
    return getGuildFolders().find(folder => getFolderId(folder) === folderId) ?? null;
}

function getFolderDisplayName(folderId: string): string {
    const folder = getFolderById(folderId);

    const explicitName =
        typeof folder?.folderName === "string" && folder.folderName.trim().length > 0
            ? folder.folderName.trim()
            : typeof folder?.name === "string" && folder.name.trim().length > 0
                ? folder.name.trim()
                : null;

    if (explicitName) {
        return explicitName;
    }

    const guildNames = (folder?.guildIds ?? [])
        .map(guildId => GuildStore.getGuild(guildId)?.name)
        .filter((name): name is string => typeof name === "string" && name.length > 0);

    if (guildNames.length === 0) {
        return "Unnamed folder";
    }

    const preview = guildNames.slice(0, 3).join(", ");
    return guildNames.length > 3 ? `${preview}…` : preview;
}

function cssString(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getGuildNavRootSelector(): string {
    // :is(...) keeps both possible Discord roots inside one selector.
    // Returning a comma-separated selector here would make the first root
    // an independent CSS rule and could hide the entire guild navigation.
    return ':is([data-list-id="guildsnav"], nav[class*="guilds"])';
}

function buildServerRules(serverId: string): string[] {
    const safeId = cssString(serverId);
    const root = getGuildNavRootSelector();

    return [
        `${root} [data-list-item-id="guildsnav___${safeId}"] { display: none !important; }`,
        `${root} [class*="listItem"]:has([data-list-item-id="guildsnav___${safeId}"]) { display: none !important; }`,
        `${root} [class*="folderPreviewGuildIcon"][style*="/icons/${safeId}/"] { display: none !important; }`,
        `${root} [class*="folderPreviewGuildIcon"][style*="${safeId}"] { display: none !important; }`
    ];
}

function buildFolderRules(folderId: string): string[] {
    const safeId = cssString(folderId);
    const root = getGuildNavRootSelector();

    return [
        `${root} [class*="folderGroup"]:has([data-list-item-id*="${safeId}"]) { display: none !important; }`,
        `${root} [class*="listItem"]:has([data-list-item-id*="${safeId}"]) { display: none !important; }`
    ];
}

function buildExpandedFolderHeightRules(hiddenServerIds: string[], hiddenFolderIds: string[]): string[] {
    const hiddenServerSet = new Set(hiddenServerIds);
    const hiddenFolderSet = new Set(hiddenFolderIds);
    const root = getGuildNavRootSelector();
    const rules: string[] = [];

    for (const folder of getGuildFolders()) {
        const folderId = getFolderId(folder);
        if (!folderId || hiddenFolderSet.has(folderId)) continue;

        const guildIds = Array.isArray(folder.guildIds) ? folder.guildIds : [];
        if (guildIds.length === 0) continue;

        const hiddenCount = guildIds.filter(guildId => hiddenServerSet.has(guildId)).length;
        if (hiddenCount === 0) continue;

        const visibleCount = guildIds.length - hiddenCount;
        const safeFolderId = cssString(folderId);

        rules.push(
            `${root} [class*="folderGroup"][class*="isExpanded"]:has([data-list-item-id*="${safeFolderId}"]) { height: calc((${Math.max(visibleCount, 0)} * var(--guildbar-folder-size)) + var(--guildbar-folder-size)) !important; }`
        );
    }

    return rules;
}

function applyHiddenStyles() {
    let styleElement = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;

    if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = STYLE_ELEMENT_ID;
        document.head.appendChild(styleElement);
    }

    const hiddenServerIds = getHiddenServerIds();
    const hiddenFolderIds = getHiddenFolderIds();
    const rules: string[] = [];

    for (const serverId of hiddenServerIds) {
        rules.push(...buildServerRules(serverId));
    }

    for (const folderId of hiddenFolderIds) {
        rules.push(...buildFolderRules(folderId));
    }

    rules.push(...buildExpandedFolderHeightRules(hiddenServerIds, hiddenFolderIds));

    const unsafeRule = rules.find(rule =>
        /^\s*(?:\[data-list-id="guildsnav"\]|nav\[class\*="guilds"\])\s*\{/.test(rule)
    );

    if (unsafeRule) {
        logger.error("Refusing to apply an unsafe guild navigation rule:", unsafeRule);
        styleElement.textContent = "";
        return;
    }

    styleElement.textContent = rules.join("\n");
}

function removeHiddenStyles() {
    document.getElementById(STYLE_ELEMENT_ID)?.remove();
}

function getItemName(type: HiddenItemType, id: string): string {
    if (type === "server") {
        return GuildStore.getGuild(id)?.name ?? "Unknown server";
    }

    return getFolderDisplayName(id);
}

function HiddenItemsManager({ type }: HiddenItemsManagerProps) {
    const [, forceRefresh] = React.useReducer((value: number) => value + 1, 0);

    React.useEffect(() => {
        const refresh = () => forceRefresh();
        window.addEventListener(CHANGE_EVENT, refresh);

        return () => {
            window.removeEventListener(CHANGE_EVENT, refresh);
        };
    }, []);

    const ids = getIds(type);
    const pluralLabel = type === "server" ? "servers" : "folders";
    const title = type === "server" ? "Hidden servers" : "Hidden folders";

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={styles.title}>{title}</h3>

                <button
                    type="button"
                    style={styles.dangerButton}
                    disabled={ids.length === 0}
                    onClick={() => clearHiddenItems(type)}
                >
                    Unhide all
                </button>
            </div>

            <p style={styles.description}>
                {type === "server"
                    ? "Only servers hidden individually appear here. Hiding a folder never adds its servers to this list."
                    : "Only folders hidden as complete folders appear here. Their server IDs remain separate."}
            </p>

            {ids.length === 0
                ? (
                    <div style={styles.empty}>
                        No hidden {pluralLabel}.
                    </div>
                )
                : ids.map(id => (
                    <div key={id} style={styles.row}>
                        <div style={styles.info}>
                            <span style={styles.name}>{getItemName(type, id)}</span>
                            <span style={styles.id}>ID: {id}</span>
                        </div>

                        <button
                            type="button"
                            style={styles.button}
                            onClick={() => toggleHiddenItem(type, id)}
                        >
                            Show
                        </button>
                    </div>
                ))}
        </section>
    );
}

function patchGuildContextMenu(children: any[], props: GuildContextProps) {
    const guildId = normaliseId(props?.guild?.id);
    const folderId = normaliseId(props?.folderId);

    if (!guildId && !folderId) {
        return;
    }

    const type: HiddenItemType = guildId ? "server" : "folder";
    const id = guildId ?? folderId;

    if (!id) return;

    const isHidden = getIds(type).includes(id);
    const label = isHidden
        ? type === "server" ? "Unhide server" : "Unhide folder"
        : type === "server" ? "Hide server" : "Hide folder";

    children.push(
        <Menu.MenuSeparator key="hidden-servers-separator" />,
        <Menu.MenuItem
            key="hidden-servers-toggle"
            id="hidden-servers-toggle"
            label={label}
            action={() => toggleHiddenItem(type, id)}
        />
    );
}

function handleGuildFolderStoreChange() {
    applyHiddenStyles();
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

export default definePlugin({
    name: "HiddenServers",
    description: "Hide individual servers or complete server folders from the guild list.",
    authors: [{ name: "feve", id: 0n }],
    tags: ["Servers", "Organisation", "Privacy"],
    settings,
    requiresRestart: false,

    contextMenus: {
        "guild-context": patchGuildContextMenu
    },

    toolboxActions: {
        "Unhide every server and folder": clearEverything
    },

    start() {
        applyHiddenStyles();

        try {
            SortedGuildStore?.addChangeListener?.(handleGuildFolderStoreChange);
        } catch (error) {
            logger.error("Could not subscribe to folder changes:", error);
        }
    },

    stop() {
        try {
            SortedGuildStore?.removeChangeListener?.(handleGuildFolderStoreChange);
        } catch (error) {
            logger.error("Could not unsubscribe from folder changes:", error);
        }

        removeHiddenStyles();
    }
});
