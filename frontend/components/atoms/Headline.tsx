import { JSX } from 'react';

type HeadlineType = {
  className?: string;
  text: string;
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  tabIndex?: number;
};

export default function Headline({
  className,
  text,
  tag = 'h2',
  tabIndex,
}: HeadlineType) {
  const Tag = tag as keyof JSX.IntrinsicElements;
  return (
    <Tag className={className} tabIndex={tabIndex}>
      {text}
    </Tag>
  );
}
