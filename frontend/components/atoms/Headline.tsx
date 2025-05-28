import { JSX } from 'react';

type HeadlineType = {
  className?: string;
  text: string;
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

export default function Headline({
  className,
  text,
  tag = 'h2',
}: HeadlineType) {
  const Tag = tag as keyof JSX.IntrinsicElements;
  return <Tag className={className}>{text}</Tag>;
}
