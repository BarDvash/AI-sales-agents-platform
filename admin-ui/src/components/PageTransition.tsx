"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const isFirstMount = useRef(true);

  // Handle pathname changes only (not children updates)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Start fade out
    setIsVisible(false);

    // After fade out, update content and fade in
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]); // Only trigger on pathname changes

  // Update children without animation when pathname hasn't changed
  useEffect(() => {
    if (!isFirstMount.current) {
      setDisplayChildren(children);
    }
  }, [children]);

  // Initial mount - fade in immediately
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  return (
    <div
      className="transition-opacity duration-150 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        willChange: "opacity",
      }}
    >
      {displayChildren}
    </div>
  );
}
