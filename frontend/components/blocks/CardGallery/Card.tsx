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
  const hasLink = () => {
    if (!card.link) return false;

    if (card.link.isExternalLink && card.link.url) {
      return true;
    }

    if (!card.link.isExternalLink && card.link.reference) {
      return true;
    }
    return false;
  };

  const getLinkText = (card: CardType) => {
    if (card.link?.title) {
    return card.link.title;
  }
    return "Click"
  };
  
  const cardContent = (
    <>
      {card.image && (
        <div className={styles.imageWrapper}>
          <SanityNextImage image={card.image} />
        </div>
      )}
      
      {(card.titleLine1 || card.titleLine2) && (
      <div className={`${styles.titleContainer} ${styles.hasTitles}`}>
        {card.titleLine1 && card.titleLine2 ? (
          <h3 className={`${styles.title} ${!card.image ? styles.largeTitle : ''}`}>
            {card.titleLine1}
            <br />
            {card.titleLine2}
          </h3>
        ) : (
          <h3 className={`${styles.title} ${!card.image ? styles.largeTitle : ''}`}>
            {card.titleLine1 || card.titleLine2 || ''}
          </h3>
        )}
      </div>
    )}
    
    <p className={`${styles.text} ${!card.image ? styles.largeText : ''}`}>
      {card.text}
    </p>


    {hasLink() && (
      <div className={styles.linkText}>
        {getLinkText(card)}
      </div>
    )}
    </>
  );

  if (card.link) {
    if (card.link.isExternalLink && card.link.url) {
      return (
        <a
          href={card.link.url}
          target={card.link.target || '_self'}
          rel="noopener noreferrer"
          className={styles.card}
          aria-label={card.link.title || `${card.titleLine1} ${card.titleLine2 || ''}`.trim() || 'Card link'}
        >
          {cardContent}
        </a>
      );
    }

 if (!card.link.isExternalLink && card.link.reference) {
  
  const slug =
    card.link.reference && 'slug' in card.link.reference
      ? (card.link.reference as ReferenceType).slug?.current
      : undefined;


  if (slug) {
    return (
      <Link
        href={`/${slug}`}
        className={styles.card}
        aria-label={card.link.title || `${card.titleLine1} ${card.titleLine2 || ''}`.trim() || 'Card link'}
      >
        {cardContent}
      </Link>
        );
      }
    }
  }      
  
 
  return ( 
    <div className={`${styles.card} ${!card.image ? styles.noImage : ''}`}>
      {cardContent}
    </div>
  );

};



export default Card;
