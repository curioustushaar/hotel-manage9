# RBAC Implementation Guide for Bireena Atithi

## Overview

This document provides a comprehensive guide to the Role-Based Access Control (RBAC) system implemented in Bireena Atithi Hotel Management System.

## Quick Start

### Testing Different Roles

1. Navigate to `/login`
2. Use the **Quick Login** buttons to test any role instantly
3. Each role will see different menu items and have different permissions

### Test Credentials

For manual login testing:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@bireena.com | super123 |
| Admin | admin@bireena.com | admin123 |
| Manager | manager@bireena.com | manager123 |
| Receptionist | receptionist@bireena.com | reception123 |
| Accountant | accountant@bireena.com | account123 |
| Waiter | waiter@bireena.com | waiter123 |
| Staff | staff@bireena.com | staff123 |

## Architecture

### Core Components

#### 1. RBAC Configuration (`src/config/rbac.js`)

Defines the entire permission structure:

- **7 Roles**: Super Admin, Admin, Manager, Receptionist, Accountant, Waiter, Staff
- **Access Matrix**: Maps each role to module permissions
- **Helper Functions**: `hasPermission()`, `hasModuleAccess()`, `canAccess()`

#### 2. Authentication Context (`src/context/AuthContext.jsx`)

Manages user authentication state:

- `login(email, password)` - Authenticate user
- `logout()` - Clear session
- `quickLogin(role)` - Dev mode quick login
- `isAuthenticated()` - Check auth status
- `getUserRole()` - Get current user role

#### 3. Protected Routes (`src/components/ProtectedRoute.jsx`)

Wraps routes that require authentication and specific module access.

### File Structure

```
src/
├── config/
│   └── rbac.js                 # RBAC configuration
├── context/
│   └── AuthContext.jsx         # Authentication context
├── components/
│   ├── ProtectedRoute.jsx      # Route protection
│   ├── ActivityLog.jsx         # Activity log viewer
│   └── Sidebar.jsx             # Dynamic sidebar (role-filtered)
├── data/
│   ├── mockUsers.js            # Test user data
│   └── mockActivityLogs.js     # Sample activity logs
├── utils/
│   ├── activityLogger.js       # Activity logging utilities
│   └── subscriptionCheck.js    # Subscription utilities
└── pages/
    └── Login/Login.jsx         # Enhanced login with quick access

```

## Permission Levels

### Permission Types

- **VIEW**: Can see the module
- **CREATE**: Can create new items
- **EDIT**: Can modify existing items  
- **DELETE**: Can remove items
- **FULL**: All of the above

## Role Capabilities

### Super Admin
**Full system access including:**
- All modules with FULL permission
- Subscription management  
- Multi-hotel control
- System-wide activity logs

**Sidebar Items**: ALL

### Admin
**Hotel-level full control:**
- All operational modules with FULL permission
- Staff management
- All reports and logs
- Property configuration

**Sidebar Items**: Dashboard, Rooms, Reservations, Cashier, Table View, Food Menu, Property Setup, Property Config, Customers, Staff Management, Reports

### Manager
**Operational management:**
- Dashboard (VIEW)
- Rooms (VIEW, EDIT)
- Reservations (FULL)
- KOT/Table View (FULL)
- Reports (VIEW)

**Sidebar Items**: Dashboard, Rooms, Reservations, Cashier, Table View, Food Menu, Customers, Reports

### Receptionist
**Front desk operations:**
- Dashboard (VIEW)
- Reservations (CREATE, EDIT, VIEW)
- Customers (CREATE, EDIT, VIEW)
- Cashier (VIEW, CREATE)

**Sidebar Items**: Dashboard, Reservations, Cashier, Customers

### Accountant
**Financial operations:**
- Dashboard (VIEW)
- Cashier Section (FULL)
- Reports (FULL)
- Reservations (VIEW only)

**Sidebar Items**: Dashboard, Cashier, Cashier Logs, Payment Logs

### Waiter
**KOT and table service:**
- Table View / Guest Meal Service (FULL)
- Food Menu (VIEW)

**Sidebar Items**: Table View, Food Menu

### Staff
**Limited access:**
- Dashboard (VIEW)
- Reservations (VIEW)
- Guest Meal Service (VIEW)

**Sidebar Items**: Dashboard, Table View

## Usage Examples

### Checking Permissions in Code

```javascript
import { hasPermission, PERMISSIONS, MODULES } from '../config/rbac';
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  // Check if user can edit rooms
  const canEditRooms = hasPermission(user.role, MODULES.ROOMS, PERMISSIONS.EDIT);
  
  return (
    <div>
      {canEditRooms && (
        <button>Edit Room</button>
      )}
    </div>
  );
}
```

### Adding a Protected Route

```javascript
import ProtectedRoute from './components/ProtectedRoute';
import { MODULES } from './config/rbac';

<Route path="/admin/new-feature" element={
  <ProtectedRoute module={MODULES.DASHBOARD}>
    <NewFeatureComponent />
  </ProtectedRoute>
} />
```

### Logging Activities

```javascript
import { logActivity } from '../utils/activityLogger';
import { ACTION_TYPES } from '../data/mockActivityLogs';

// Log a reservation creation
logActivity(
  ACTION_TYPES.RESERVATION_CREATED,
  'Created reservation for Room 101',
  'Reservations',
  { roomNumber: '101', guestName: 'John Doe' }
);
```

## Subscription Tiers

### Basic (₹999/month)
- Max 20 rooms
- Max 5 staff
- Basic reports
- QR generation
- KOT system

### Pro (₹2,999/month) - **Most Popular**
- Max 100 rooms
- Max 20 staff
- Advanced reports
- Activity logs  
- Analytics dashboard

### Enterprise (Custom Pricing)
- Unlimited rooms & staff
- Multi-hotel management
- Custom integrations
- API access
- Dedicated support

##Backend Integration Guide

The current implementation is frontend-only. For production:

### Required Backend Changes

1. **JWT Token Structure**:
```json
{
  "userId": "user_123",
  "role": "Admin",
  "hotelId": "hotel_001",
  "subscriptionTier": "Pro",
  "permissions": ["dashboard.view", "rooms.full"],
  "exp": 1234567890
}
```

2. **Authentication Endpoint**:
```javascript
POST /api/auth/login
{
  "email": "admin@bireena.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "jwt-token-here",
  "user": { /* user data */ }
}
```

3. **Permission Middleware**:
```javascript
// Example Express middleware
const checkPermission = (module, permission) => {
  return (req, res, next) => {
    const user = req.user; // From JWT
    if (hasPermission(user.role, module, permission)) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  };
};

app.get('/api/rooms', 
  authenticate, 
  checkPermission(MODULES.ROOMS, PERMISSIONS.VIEW),
  getRooms
);
```

4. **Activity Logging**:
```javascript
// Log to database instead of localStorage
const logActivity = async (userId, action, description, module, details) => {
  await ActivityLog.create({
    userId,
    action,
    description,
    module,
    details,
    timestamp: new Date(),
    ipAddress: req.ip
  });
};
```

## Troubleshooting

### Issue: All menu items showing regardless of role
**Solution**: Check that `useAuth()` is returning the correct user object and that the Sidebar component is using `canAccessModule()` correctly.

### Issue: "Access Denied" even with correct permissions
**Solution**: Verify module IDs in routes match MODULES constants in `rbac.js`.

### Issue: Activity logs not persisting
**Solution**: Check localStorage is enabled. For production, implement backend logging.

## Future Enhancements

- [ ] Permission templates for common role combinations
- [ ] Time-based access (shift scheduling)
- [ ] IP-based restrictions  
- [ ] Two-factor authentication
- [ ] Audit log export formats (CSV, PDF)
- [ ] Role inheritance system
- [ ] Custom permissions builder UI

## Support

For implementation questions or issues, refer to the main walkthrough document or contact the development team.

---

**Last Updated**: February 14, 2026  
**Version**: 1.0.0  
**Author**: Development Team
