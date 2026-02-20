import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    // Disable browser's automatic scroll restoration to ensure we always start at top
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    // Use useLayoutEffect to trigger scroll before paint
    useLayoutEffect(() => {
        const scrollToTop = () => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant' // Use 'instant' for immediate snap to top
            });
            // Fallback for some browsers/scenarios
            document.documentElement.scrollTo(0, 0);
            document.body.scrollTo(0, 0);
        };

        scrollToTop();

        // Extra insurance: scroll again after a short delay to handle late-rendering content
        const timeoutId = setTimeout(scrollToTop, 10);
        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
}
