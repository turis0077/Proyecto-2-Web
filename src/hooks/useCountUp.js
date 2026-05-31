import { useState, useEffect, useRef } from 'react';

export function useCountUp(targetValue, duration = 800) {
  const [count, setCount] = useState(targetValue);
  const prevValueRef = useRef(targetValue);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = targetValue;
    if (start === end) return;

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(start + progress * (end - start));

      setCount(currentValue);

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        prevValueRef.current = end;
        setCount(end);
      }
    };

    window.requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return count;
}
