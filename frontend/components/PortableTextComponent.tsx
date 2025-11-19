import { PortableText, PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import SanityNextImage from './SanityNextImage';
import styles from './PortableTextComponent.module.css';

type PortableTextComponentProps = {
  value: PortableTextBlock[];
  className?: string;
};

const myPortableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value || !value.asset?._ref) {
        return null;
      }

      return (
        <div className={styles.image}>
          <SanityNextImage image={value} />
        </div>
      );
    },
  },
  block: {
    normal: ({ children }) => {
      return <p className={styles.paragraph}>{children}</p>;
    },
    h1: ({ children }) => {
      return <h1 className={styles['headline-1']}>{children}</h1>;
    },
    h2: ({ children }) => {
      return <h2 className={styles['headline-2']}>{children}</h2>;
    },
    h3: ({ children }) => {
      return <h3 className={styles['headline-3']}>{children}</h3>;
    },
    h4: ({ children }) => {
      return <h4 className={styles['headline-4']}>{children}</h4>;
    },
    h5: ({ children }) => {
      return <h5 className={styles['headline-5']}>{children}</h5>;
    },
    h6: ({ children }) => {
      return <h6 className={styles['headline-6']}>{children}</h6>;
    },
    blockquote: ({ children }) => {
      return <blockquote className={styles.blockquote}>{children}</blockquote>;
    },
  },
  marks: {
    strong: ({ children }) => {
      return <strong>{children}</strong>;
    },
    em: ({ children }) => {
      return <em>{children}</em>;
    },
    link: ({ children, value }) => {
      const target = value?.href?.startsWith('http') ? '_blank' : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => {
      return <ul className={styles['unordered-list']}>{children}</ul>;
    },
    number: ({ children }) => {
      return <ol className={styles['ordered-list']}>{children}</ol>;
    },
  },
  listItem: {
    bullet: ({ children }) => {
      return <li className={styles['list-item']}>{children}</li>;
    },
    number: ({ children }) => {
      return <li className={styles['list-item']}>{children}</li>;
    },
  },
};

const PortableTextComponent: React.FC<PortableTextComponentProps> = ({
  value,
  className,
}) => {
  return (
    <div className={className}>
      <PortableText value={value} components={myPortableTextComponents} />
    </div>
  );
};
export default PortableTextComponent;
