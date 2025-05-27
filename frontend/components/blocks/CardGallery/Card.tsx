import React from 'react';
import type { Card as CardType } from '@/sanity/types';
import SanityNextImage from '@/components/SanityNextImage';
import styles from './Card.module.css';
import Headline from '@/components/atoms/Headline';

type Props = {
  card: CardType;
};

const Card = ({ card }: Props) => {
  return (
    <div className={styles.card}>
      {card.image && (
        <div className={styles.imageWrapper}>
          <SanityNextImage image={card.image} />
        </div>
      )}
      <Headline tag="h3" className={styles.title} text={card.title || ''} />
      <p className={styles.text}>{card.text}</p>
    </div>
  );
};

export default Card;
