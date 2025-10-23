import React from 'react';
import type { Card as CardType } from '@/sanity/types';
import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import Card from './Card';
import Headline from '@/components/atoms/Headline';
import styles from './CardGallery.module.css';
import { AnimationComponent } from '@/components/atoms/AnimationComponent';

interface CardGalleryProps {
  title: string;
  text: string;
  cards: CardType[];
}

const CardGallery = ({ title, text, cards }: CardGalleryProps) => {
  return (
        <AnimationComponent
          animationClass="scroll"
          componentName="cardGallery"
          elementType= "box"
          effectFrom="bottom"
        >
    <Grid className={styles.cardGallery}>
      {/* Header block */}
        <GridItem desktopSpan={12} mobileSpan={6}>
          <div className={styles.galleryHeader}>
            <Headline className={styles.galleryTitle} tag="h2" text={title} />
            <p className={styles.galleryIntro}>{text}</p>
          </div>
        </GridItem>

      {cards.map((card, index) => (

        <GridItem
          key={index}
          className="card-item"
          desktopSpan={4}
          mobileSpan={6}
          >
            <Card card={card} />
          </GridItem>
      ))}
    </Grid>
      </AnimationComponent>
  );
};

export default CardGallery;
