const UUID_LOOSE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const UUID_ANYWHERE = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
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
    t = t.trim().replace(/^[{\[(<\s]+|[}\])>\s]+$/g, '');

    // If a full URL was pasted, try to extract common query keys.
    if (t.includes('?') || t.includes('token=')) {
        try {
            const parsed = new URL(t);
            const qToken = parsed.searchParams.get('token') ??
                parsed.searchParams.get('inviteToken') ??
                parsed.searchParams.get('t') ??
                parsed.searchParams.get('code') ??
                '';
            if (qToken.trim()) {
                t = qToken.trim();
            }
        }
        catch {
            const queryPart = t.split('?')[1] ?? t;
            const params = new URLSearchParams(queryPart);
            const qToken = params.get('token') ??
                params.get('inviteToken') ??
                params.get('t') ??
                params.get('code') ??
                '';
            if (qToken.trim()) {
                t = qToken.trim();
            }
        }
    }

    t = t.trim().replace(/^[{\[(<\s]+|[}\])>\s]+$/g, '');
    if (UUID_LOOSE.test(t)) {
        return t.toLowerCase();
    }
    const extracted = t.match(UUID_ANYWHERE)?.[0];
    if (extracted && UUID_LOOSE.test(extracted)) {
        return extracted.toLowerCase();
    }
    return t;
}
