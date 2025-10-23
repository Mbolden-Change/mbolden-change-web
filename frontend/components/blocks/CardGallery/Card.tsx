'use client'
import React from 'react';
import type { Card as CardType } from '@/sanity/types';
import SanityNextImage from '@/components/SanityNextImage';
import styles from './Card.module.css';
import Link from 'next/link';
import { useState } from 'react'
import { ReferenceType } from '@/components/atoms/Link';
import VideoModal from './VideoModal';


interface RefMapType {
  caseStudy: string;
  page: string;
  statement: string;
  report: string;
  [key: string]: string;
};

type Props = {
  card: CardType;
};

const Card = ({ card }: Props) => {
  const hasALink = () => {
    if (!card.link && !card.videoURL) return false;


    if (card.link?.isExternalLink && card.link.url) {
      return "hasExternalLink";
    }

    if (!card.link?.isExternalLink && card.link?.reference) {
      return "hasInternalLink";
    }

    if (card.videoURL) {
      return "hasVideoLink";
    }


    return false;
  };

  const getLinkText = (card: CardType) => {
    if (card.link && card.link.title) {
      return card.link.title;
    }
    if (card.videoURL && card.videoTitle) {
      return card.videoTitle;
    }
    return "Click"
  };

  const [isMountedModal, setIsMountedModal] = useState(false);

  const handleToggle = () => {
    if (card.videoURL) {
      setIsMountedModal(!isMountedModal);
    }
  }

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
      {/* Button to handle internal, external and video link. */}
      {(card.link?.isExternalLink || card.link?.reference || card.videoURL) && (
        <div className={styles.linkText}>
          {hasALink() && getLinkText(card)}
        </div>
      )}
    </>
  );

  if (card.link) {
    if (card.link?.isExternalLink && card.link.url) {
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

 if (!card.link?.isExternalLink && card.link?.reference) {
      const refType = card.link.reference._type;
      const refMap: RefMapType = {
        caseStudy: "case-study",
        page: "",
        statement: "statement",
        report: "report"
      }


  const slug =
        card.link.reference && 'slug' in card.link.reference
          ? `${(refMap[refType])}/${(card.link.reference as ReferenceType).slug?.current}`
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
    (!card.link?.isExternalLink && !card.link?.reference && !card.videoURL) ? (
      <div
          className={styles.unstyledCard}
          >
          {cardContent}
        </div>
    ): (
        <div className={styles.card} onClick={handleToggle}>
          {cardContent}
          {isMountedModal && (
            // @ts-ignore
            <VideoModal url={card.videoURL} title={card.videoTitle || ""}/>
          )}
        </div>
    )
  );
};



export default Card;
