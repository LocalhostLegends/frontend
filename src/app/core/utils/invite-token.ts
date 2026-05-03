const UUID_LOOSE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
export function isUuidLike(s: string): boolean {
    return UUID_LOOSE.test(s.trim());
}
export function normalizeInviteToken(raw: string): string {
    let t = raw.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        t = t.slice(1, -1).trim();
    }
    if (t.includes('%')) {
        try {
            t = decodeURIComponent(t);
        }
        catch {
        }
    }
    t = t.trim();
    if (UUID_LOOSE.test(t)) {
        return t.toLowerCase();
    }
    return t;
}
