import React, { useState, useEffect, useMemo } from 'react';

interface TypewriterEffectProps {
  text: string;
  highlightWords: string[];
  className?: string;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ text, highlightWords, className }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [text]);

  const highlightText = useMemo(() => {
    const words = text.split(' ');
    const highlightIndices = words.reduce((acc, word, index) => {
      if (highlightWords.includes(word.trim())) {
        acc.push(index);
      }
      return acc;
    }, [] as number[]);

    return (currentText: string) => {
      const currentWords = currentText.split(' ');
      return currentWords.map((word, index) => (
        <React.Fragment key={index}>
          <span className={highlightIndices.includes(index) ? 'text-blue-600 font-bold' : ''}>
            {word}
          </span>
          {index < currentWords.length - 1 && ' '}
        </React.Fragment>
      ));
    };
  }, [text, highlightWords]);

  return <p className={className}>{highlightText(displayText)}</p>;
};

export default TypewriterEffect;