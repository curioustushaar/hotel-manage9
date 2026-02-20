import { useEffect, useRef, useState } from "react";

const Reveal = ({ children, width = "fit-content" }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            },
            { threshold: 0.15 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{
                width,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0px)" : "translateY(60px)",
                transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
                willChange: "opacity, transform",
            }}
        >
            {children}
        </div>
    );
};

export default Reveal;
