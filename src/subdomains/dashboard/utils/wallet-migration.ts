const WALLET_MIGRATION_VERSION = "v1";

const buildWalletMigrationStorageKey = (uid: string) =>
    `wallet-migration:${WALLET_MIGRATION_VERSION}:${uid}`;

export const hasCompletedWalletMigration = (uid: string): boolean => {
    if (!uid) {
        return false;
    }
    return localStorage.getItem(buildWalletMigrationStorageKey(uid)) === "done";
};

export const setWalletMigrationCompleted = (uid: string): void => {
    if (!uid) {
        return;
    }
    localStorage.setItem(buildWalletMigrationStorageKey(uid), "done");
};

export const clearWalletMigrationCompleted = (uid: string): void => {
    if (!uid) {
        return;
    }
    localStorage.removeItem(buildWalletMigrationStorageKey(uid));
};
