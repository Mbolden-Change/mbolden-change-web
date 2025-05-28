import React from 'react';
import type { Card as CardType } from '@/sanity/types';
import SanityNextImage from '@/components/SanityNextImage';
import styles from './Card.module.css';
import Headline from '@/components/atoms/Headline';
import Link from 'next/link';
import { ReferenceType } from '@/components/atoms/Link';


type Props = {
  card: CardType;
};

const Card = ({ card }: Props) => {

  const cardContent = (
    <>

  return (
    <div className={styles.card}>

      {card.image && (
        <div className={styles.imageWrapper}>
          <SanityNextImage image={card.image} />
        </div>
      )}
      <Headline tag="h3" className={styles.title} text={card.title || ''} />
      <p className={styles.text}>{card.text}</p>

    </>
  );

  if (card.link) {
    const referenceWithSlug =
      card.link.reference && 'slug' in card.link.reference
        ? (card.link.reference as ReferenceType)
        : undefined;

  if (card.link.isExternalLink && card.link.url){
    return (
      <a
      href={card.link.url}
      target={card.link.target || '_self'}
      rel="noopener noreferrer"
      className={styles.card}
      aria-label={card.link.title || card.title || 'Card link'}
      >
        {cardContent}
      </a>
    );
  }

  if (referenceWithSlug?.slug?.current) {
    return (
      <Link
      href={`/${referenceWithSlug?.slug.current}`}
      className={styles.card}
      aria-label={card.link.title || card.title || 'Card link'}
      >
        {cardContent}
      </Link>
    );
  }
  }          
  
 
  return ( 
    <div className={styles.card}>
      {cardContent}
    </div>
  );

};




    </div>
  );
};


export default Card;
