import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const displayValue = useTransform(spring, (current) =>
    current.toFixed(decimals)
  );
  const [formattedText, setFormattedText] = useState(value.toFixed(decimals));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = displayValue.on('change', (latest) => {
      setFormattedText(Number(latest).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }));
    });
    return () => unsubscribe();
  }, [displayValue, decimals]);

  return (
    <motion.span className={className}>
      {prefix}
      {formattedText}
      {suffix}
    </motion.span>
  );
};
