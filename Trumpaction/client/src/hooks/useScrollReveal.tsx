import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

type ScrollControls = "hidden" | "visible";

export function useScrollReveal(threshold = 0.2): [React.RefObject<HTMLDivElement>, ScrollControls] {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const [controls, setControls] = useState<ScrollControls>("hidden");

  useEffect(() => {
    if (isInView) {
      setControls("visible");
    }
  }, [isInView]);

  return [ref, controls];
}
