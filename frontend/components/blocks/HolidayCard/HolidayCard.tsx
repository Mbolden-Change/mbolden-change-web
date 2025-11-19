import React from 'react';
import styles from './HolidayCard.module.css';
import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import SanityNextImage from '@/components/SanityNextImage';
import { PortableText } from 'next-sanity';
import PortableTextComponent from '@/components/PortableTextComponent';
import ButtonComponent from '@/components/atoms/ButtonComponent';

//@ts-ignore
const HolidayCard = ({ image, text, imageText, link }) => {
  return (
    <section className={styles['holiday-card']}>
      <Grid>
        <GridItem desktopSpan={6} mobileSpan={12}>
          <div className={styles['image-wrapper']}>
            <SanityNextImage className={styles.image} image={image} />
          </div>
          <PortableTextComponent
            className={styles['green-playfair']}
            value={imageText}
          />
        </GridItem>
        <GridItem desktopSpan={6} mobileSpan={12}>
          <PortableTextComponent
            className={styles['green-playfair']}
            value={text}
          />
          <ButtonComponent variant="primary" link={link} />
        </GridItem>
      </Grid>
    </section>
  );
};

export default HolidayCard;
