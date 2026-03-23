const { AsyncLocalStorage } = require('async_hooks');
const jwt = require('jsonwebtoken');

const tenantStorage = new AsyncLocalStorage();

const TENANT_HEADER = 'x-hotel-id';
const ALT_TENANT_HEADER = 'x-tenant-id';
const TENANT_DB_HEADER = 'x-tenant-db';

const normalizeTenantId = (value) => {
    if (!value) return null;
    return String(value).trim() || null;
};

const readTenantIdFromHeaders = (headers = {}) => {
    return normalizeTenantId(headers[TENANT_HEADER] || headers[ALT_TENANT_HEADER]);
};

const attachTenantContextToRequest = (req, context = {}) => {
    req.tenantId = context.hotelId || null;
    req.tenantDbName = context.dbName || null;
    req.tenantContext = {
        hotelId: req.tenantId,
        dbName: req.tenantDbName,
        role: context.role || null,
        userId: context.userId || null
    };
};

const runTenantContext = (req, res, next) => {
    const headerTenantId = readTenantIdFromHeaders(req.headers);
    const headerDbName = normalizeTenantId(req.headers[TENANT_DB_HEADER]);
    const defaultHotelId = normalizeTenantId(process.env.DEFAULT_HOTEL_ID);
    const defaultDbName = normalizeTenantId(process.env.DEFAULT_TENANT_DB);

    tenantStorage.run(
        {
            hotelId: headerTenantId || defaultHotelId,
            dbName: headerDbName || defaultDbName,
            role: null,
            userId: null
        },
        () => {
            const store = tenantStorage.getStore();

            // If auth token is present, hydrate role/hotelId early even on non-protected routes.
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    if (store) {
                        store.userId = decoded.id || null;
                        store.role = decoded.role || null;
                        if (!store.dbName) {
                            store.dbName = normalizeTenantId(decoded.dbName);
                        }
                        if (!store.hotelId) {
                            store.hotelId = normalizeTenantId(decoded.hotelId);
                        }
                    }
                } catch (error) {
                    // Ignore invalid token here; auth middleware handles auth errors.
                }
            }

            attachTenantContextToRequest(req, store || {});

            next();
        }
    );
};

const setTenantContextFromUser = (user) => {
    const store = tenantStorage.getStore();
    if (!store || !user) return;

    store.userId = user._id ? String(user._id) : null;
    store.role = user.role || null;
    if (user.role !== 'super_admin') {
        store.hotelId = normalizeTenantId(user.hotelId);
        if (user.dbName) {
            store.dbName = normalizeTenantId(user.dbName);
        }
    } else {
        store.hotelId = null;
        store.dbName = null;
    }
};

const getTenantContext = () => tenantStorage.getStore() || null;

module.exports = {
    runTenantContext,
    setTenantContextFromUser,
    getTenantContext,
    attachTenantContextToRequest,
    TENANT_HEADER,
    ALT_TENANT_HEADER,
    TENANT_DB_HEADER
};
