import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedNumber({ value }) {
  const [hasMounted, setHasMounted] = useState(false);
  const spring = useSpring(0, { bounce: 0, duration: 1200 });
  const display = useTransform(spring, (current) => current.toFixed(2));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      spring.set(value);
    }
  }, [value, spring, hasMounted]);

  return <motion.span>{display}</motion.span>;
}
