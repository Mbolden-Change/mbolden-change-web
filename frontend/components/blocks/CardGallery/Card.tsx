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
  const hasLink = (() => {
    if (!card.link) return false;

    if (card.link.isExternalLink && card.link.url) {
      return true;
    }

    if (!card.link.isExternalLink && card.link.reference && 'slug' in card.link.reference) {
      return true;
    }
    return false;
  })

  const getLinkText = (card: CardType) => {
    if (card.link?.title) {
    return card.link.title;
  }
    return "Click"
  }
  
  const cardContent = (
    <>
    <div className={styles.tooltipContainer}>
        <div className={styles.tooltip}>
          {card.link?.title || card.title}
        </div>
      </div>
      {card.image && (
        <div className={styles.imageWrapper}>
          <SanityNextImage image={card.image} />
        </div>
      )}
      
      <Headline tag="h3" className={styles.title} text={card.title || ''} />
      <p className={styles.text}>{card.text}</p>
    
    {hasLink() && (
      <div className={styles.linkText}>
        {getLinkText(card)}
      </div>
    )}
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



export default Card;
