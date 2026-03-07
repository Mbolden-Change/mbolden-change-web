"use client";

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useRef, useState } from 'react';
import CoryFullHeroSlide from './coryFullHeroSlide';
import CorySplitHeroSlide from './corySplitHeroSlide';
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
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [navigationDirection, setNavigationDirection] = useState<'prev' | 'next'>('next');

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);

        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    const handlePrevClick = useCallback(() => {
        setNavigationDirection('prev');
        emblaApi?.scrollPrev();
    }, [emblaApi]);

    const handleNextClick = useCallback(() => {
        setNavigationDirection('next');
        emblaApi?.scrollNext();
    }, [emblaApi]);

    return (
        <section className={styles.carouselWrapper}>
            <div className={styles.embla} ref={emblaRef}>
                <div className={styles.emblaContainer}>
                    {slides.map((slide, index) => (
                        <div className={styles.emblaSlide} key={slide._key || index}>
                          {slide.layout === 'full' ? (
                            <CoryFullHeroSlide
                                {...slide}
                                isActive={index === selectedIndex}
                                animationDirection={navigationDirection}
                            />
                            ) : (
                            <CorySplitHeroSlide
                                {...slide}
                                isActive={index === selectedIndex}
                                animationDirection={navigationDirection}
                            />
                            )}
  
                         </div>
                    ))}
                </div>

                {slides.length > 1 && (
                    <div className={styles.arrowButtonsContainer}>
                    <ButtonComponent
                        variant='icon'
                        className={styles.arrowButtons}
                        onClick={handlePrevClick}
                        aria-label="Previous slide"
                        >
                        <IoIosArrowBack />
                    </ButtonComponent>
                    <ButtonComponent
                        variant='icon'
                        className={styles.arrowButtons}
                        onClick={handleNextClick}
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
