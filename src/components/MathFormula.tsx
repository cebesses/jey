/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ math, block = false, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
          strict: false,
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
        containerRef.current.textContent = math;
      }
    }
  }, [math, block]);

  return <span ref={containerRef} className={`${block ? 'block text-center my-2' : 'inline'} ${className}`} />;
};
