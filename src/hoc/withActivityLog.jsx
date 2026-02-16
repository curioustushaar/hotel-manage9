import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../utils/activityLogger';

/**
 * Higher-Order Component for Auto Activity Logging
 * Wraps components and automatically logs actions based on props
 * 
 * Usage:
 * const MyComponent = withActivityLog(BaseComponent, {
 *   onMount: 'Component Viewed',
 *   onUpdate: 'Component Updated',
 *   module: 'Dashboard'
 * });
 */
const withActivityLog = (Component, config = {}) => {
    return function ActivityLoggedComponent(props) {
        const { user } = useAuth();
        const {
            onMount,
            onUpdate,
            onUnmount,
            module = 'System',
            getDescription = () => 'Action performed'
        } = config;

        useEffect(() => {
            // Log when component mounts
            if (onMount && user) {
                logActivity(
                    onMount,
                    typeof getDescription === 'function' ? getDescription(props) : getDescription,
                    module
                );
            }

            // Cleanup: log when component unmounts
            return () => {
                if (onUnmount && user) {
                    logActivity(
                        onUnmount,
                        typeof getDescription === 'function' ? getDescription(props) : getDescription,
                        module
                    );
                }
            };
        }, []); // Only on mount/unmount

        useEffect(() => {
            // Log when component updates
            if (onUpdate && user) {
                logActivity(
                    onUpdate,
                    typeof getDescription === 'function' ? getDescription(props) : getDescription,
                    module
                );
            }
        }, [props]); // When props change

        return <Component {...props} />;
    };
};

/**
 * Hook for Manual Activity Logging
 * Use this hook in components for fine-grained control
 * 
 * Usage:
 * const { logSuccess, logError, logInfo } = useActivityLog('Reservations');
 * logSuccess('Reservation Created', 'Created reservation for Room 101');
 */
export const useActivityLog = (module = 'System') => {
    const { user } = useAuth();

    const log = (action, description, details = null) => {
        if (user) {
            logActivity(action, description, module, details);
        }
    };

    return {
        log,
        logSuccess: (description, details) => log('Success', description, details),
        logError: (description, details) => log('Error', description, details),
        logInfo: (description, details) => log('Info', description, details),
        logWarning: (description, details) => log('Warning', description, details),
        logCreate: (description, details) => log('Created', description, details),
        logUpdate: (description, details) => log('Updated', description, details),
        logDelete: (description, details) => log('Deleted', description, details),
        logView: (description, details) => log('Viewed', description, details),
    };
};

/**
 * Auto-log decorator for async functions
 * Automatically logs success/error for async operations
 * 
 * Usage:
 * const saveReservation = autoLogAsync(
 *   async (data) => { /* save logic */ },
 * { action: 'Reservation Created', module: 'Reservations' }
    * );
 */
export const autoLogAsync = (fn, config = {}) => {
    const { action, module = 'System', onSuccess, onError } = config;

    return async function (...args) {
        try {
            const result = await fn(...args);

            if (onSuccess) {
                logActivity(
                    action || 'Operation Successful',
                    onSuccess(result, args),
                    module,
                    { result, args }
                );
            }

            return result;
        } catch (error) {
            if (onError) {
                logActivity(
                    action || 'Operation Failed',
                    onError(error, args),
                    module,
                    { error: error.message, args }
                );
            }

            throw error;
        }
    };
};

export default withActivityLog;
