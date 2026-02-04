"use client";

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';
import CoryHeroSlide from './coryHeroSlide';
import { Hero as HeroType } from '@/sanity/types';
import ButtonComponent from '../../atoms/ButtonComponent';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import styles from './Hero.module.css';


type SlideWithKey = HeroType & { _key?: string };

type HeroCarouselProps = {
    slides: SlideWithKey[];
};

export default function HeroCarousel({ slides }: HeroCarouselProps) {
    const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true  }));
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay.current]);

    return (
        <section className={styles.carouselWrapper}>
            <div className={styles.embla} ref={emblaRef}>
                <div className={styles.emblaContainer}>
                    {slides.map((slide, index) => (
                        <div className={styles.emblaSlide} key={slide._key || index}>
                            <CoryHeroSlide {...slide} />
                        </div>
                    ))}
                </div>

                {slides.length > 1 && (
                    <div className={styles.arrowButtonsContainer}>
                    <ButtonComponent
                        variant='icon'
                        className={styles.arrowButtons}
                        onClick={() => emblaApi?.scrollPrev()}
                        aria-label="Previous slide"
                        >
                        <IoIosArrowBack />
                    </ButtonComponent>
                    <ButtonComponent
                        variant='icon'
                        className={styles.arrowButtons}
                        onClick={() => emblaApi?.scrollNext()}
                        aria-label="Next slide"
                        >
                        <IoIosArrowForward />
                    </ButtonComponent>
                </div>
                )}
            </div>

        </section>
    );
}
