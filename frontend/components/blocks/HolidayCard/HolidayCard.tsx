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
         <GridItem desktopSpan={6} mobileSpan={12} className={styles['text-column']}>
          <div className={styles['cover']}>
            <img src="/og-image.png" alt="logo" className={styles.coverImage} />
          </div>
        </GridItem>
        <GridItem desktopSpan={6} mobileSpan={12} className={styles['image-column']}>
          <div className={styles['image-wrapper']}>
             <img src="/wreath.png" alt="Holiday wreath" className={styles.wreathImage} />
              <div className={styles['wreath-text']} aria-hidden>
              <span>The</span>
              <span>Season</span>
              <span>of</span>
              <span>Believing</span>
            </div>  
          </div>
        </GridItem>
       
      </Grid>
      <Grid>
         <GridItem desktopSpan={6} mobileSpan={12} className={styles['text-column']}>
          <PortableTextComponent
            className={styles['green-playfair']}
            value={text}
          />
          <ButtonComponent variant="primary" link={link} />
        </GridItem>
        <GridItem desktopSpan={6} mobileSpan={12} className={styles['image-column']}>
          <div className={styles['image-wrapper']}>
            <SanityNextImage className={styles.image} image={image} />
          </div>
          <PortableTextComponent
            className={styles['green-playfair']}
            value={imageText}
          />
        </GridItem>
       
      </Grid>
    </section>
  );
};

export default HolidayCard;