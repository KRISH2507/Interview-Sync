import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(options = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    // once defaults to false so animations replay when scrolling back up
    const once = options.once ?? false;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.disconnect();
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            {
                threshold: options.threshold || 0.12,
                rootMargin: options.rootMargin || '0px 0px -40px 0px',
            }
        );

        const el = ref.current;
        if (el) observer.observe(el);

        return () => observer.disconnect();
    }, [once, options.threshold, options.rootMargin]);

    return [ref, isVisible];
}
