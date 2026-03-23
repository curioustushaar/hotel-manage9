const TENANT_FETCH_PATCH_FLAG = '__tenantFetchPatched';

const parseAuthUser = () => {
    const raw = localStorage.getItem('authUser');
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error('Failed to parse authUser from localStorage:', error);
        return null;
    }
};

export const getTenantRequestHeaders = (initialHeaders = {}, authUserOverride = null) => {
    const authUser = authUserOverride || parseAuthUser();
    const token = authUser?.token || null;
    const hotelId = authUser?.hotelId ? String(authUser.hotelId) : null;
    const dbName = authUser?.dbName ? String(authUser.dbName) : null;

    const headers = { ...initialHeaders };

    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (hotelId && !headers['x-hotel-id']) {
        headers['x-hotel-id'] = hotelId;
    }

    if (dbName && !headers['x-tenant-db']) {
        headers['x-tenant-db'] = dbName;
    }

    return headers;
};

const shouldAttachTenantHeaders = (input) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (!url) return false;

    return url.startsWith('/api/') || url.includes('/api/');
};

const normalizeHeadersForFetch = (headers) => {
    if (!headers) return {};

    if (headers instanceof Headers) {
        const normalized = {};
        headers.forEach((value, key) => {
            normalized[key] = value;
        });
        return normalized;
    }

    if (Array.isArray(headers)) {
        return Object.fromEntries(headers);
    }

    return { ...headers };
};

export const setupTenantAwareFetch = () => {
    if (typeof window === 'undefined') return;
    if (window[TENANT_FETCH_PATCH_FLAG]) return;

    const originalFetch = window.fetch.bind(window);

    window.fetch = (input, init = {}) => {
        if (!shouldAttachTenantHeaders(input)) {
            return originalFetch(input, init);
        }

        const inputHeaders = input instanceof Request ? normalizeHeadersForFetch(input.headers) : {};
        const initHeaders = normalizeHeadersForFetch(init.headers);
        const mergedHeaders = getTenantRequestHeaders({ ...inputHeaders, ...initHeaders });

        const nextInit = {
            ...init,
            headers: mergedHeaders
        };

        return originalFetch(input, nextInit);
    };

    window[TENANT_FETCH_PATCH_FLAG] = true;
};
