// Starts a parked nexa-motion timeline the first time its section enters
// the viewport. The component owns both observation and timeline lifetime.

import { useEffect, useRef } from "/dist/nexa.js";

export function useInViewTimeline(timeline, threshold = 0.22) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        timeline.play();
        observer.disconnect();
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [timeline]);

  return sectionRef;
}
