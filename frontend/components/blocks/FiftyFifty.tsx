"use client";
import { PortableTextBlock } from "next-sanity";
import PortableTextComponent from "../PortableTextComponent";
import Headline from "../atoms/Headline";
import { FiftyFifty as FiftyFiftyType } from "@/sanity/types";
import SanityNextImage from "../SanityNextImage";
import Grid from '../Grid'
import GridItem from "../GridItem";
import styles from './FiftyFifty.module.css'

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useEffect } from "react";
import { AnimationComponent } from "../atoms/AnimationComponent";
import { GiDuration } from "react-icons/gi";
gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

export default function FiftyFifty({
    mobileLayout,
    leftTitle,
    leftText,
    leftImage,
    rightTitle,
    rightText,
    rightImage,
    leftVideoUrl,
    rightVideoUrl,
    mediaType,
    imageAspectRatio,
    videoTitle,
  }: FiftyFiftyType) {
    const isImageOnTop = mobileLayout === 'imageTop'

    const getAspectRatioClass = () => {
      if (!imageAspectRatio || imageAspectRatio === 'original') return '';

      switch (imageAspectRatio) {
        case '16:9': return styles['aspectRatio-16-9'];
        case '4:3': return styles['aspectRatio-4-3'];
        case '1:1': return styles['aspectRatio-1-1'];
        case '9:16': return styles['aspectRatio-9-16'];
        default: return '';
      }
    }

    const getGoogleDriveUrl = (url: string) => {
      if (!url) return '';
      const fileId = url.split('/')[5];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    const VideoPlayer = ({ url, title }: { url: string, title: string }) => (
      <div className={styles.videoWrapper}>
        {videoTitle && <Headline tag='h2' text={videoTitle} className={styles.videoTitle} />}
        <iframe
        src={getGoogleDriveUrl(url)}
        className={styles.video}
        title={title}
        allow='autoplay; encrypted-media'
        allowFullScreen
      />
      </div>
    )



  const fiftyFiftyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // if (fiftyFiftyRef.current) {
    //   const elements = [fiftyFiftyRef.current.querySelectorAll("h2"), fiftyFiftyRef.current.querySelectorAll("p")];
    //   console.log("Elements: ", elements);

    //   gsap.from(elements[0], {
    //     x: 1000,
    //     scrollTrigger: {
    //       trigger: elements[0],
    //       pin: false,
    //       start: 'top center',
    //       end: '+300',
    //       scrub: 1,
    //       snap: {
    //         snapTo: 'labels',
    //         duration: { min: 0, max: 3 },
    //         delay: 0,
    //         ease: 'power1.inOut'
    //       },
    //       markers: true
    //     },
    //   }),
    //   gsap.from(elements[1], {
    //     x: 1000,
    //     scrollTrigger: {
    //       trigger: elements[1],
    //       pin: false,
    //       start: 'top center',
    //       end: '+300',
    //       scrub: 1,
    //       snap: {
    //         snapTo: 'labels',
    //         duration: { min: 0.05, max: 3 },
    //         delay: 0.05,
    //         ease: 'power1.inOut'
    //       },
    //       markers: true
    //     }
    //   });
    // }
  }, []);




    return (

      <section className={styles.section} ref={fiftyFiftyRef}>
      {/* Desktop View */}
      <div className={styles.desktopView}>

        <AnimationComponent
          animationClass="scroll"
          target="h2"
          horizontalAxis={700}
          start="top center"
          end="+=300"
          scrub={1}
          snapTo="labels"
          durationMin= {0.05}
          durationMax= {3}
          delay={0.05}
          ease='power1.inOut'
          markers={false}
          >
      <Grid>
      <GridItem desktopSpan={6}>

        <AnimationComponent
        animationClass="scroll"
        target="img"
        verticalAxis={300}
        start="top center"
        end="+300"
        scrub={1}
        snapTo="labels"
        durationMin= {0.05}
        durationMax= {3}
        delay={0.05}
        ease='power1.inOut'
        markers={false}
        >
        {mediaType === 'video' && leftVideoUrl
          ? <VideoPlayer url={leftVideoUrl} title="Left Google Drive Video" />
          : leftImage
          ? <div className={`${styles.imageWrapper} ${getAspectRatioClass()}`}>
              <SanityNextImage image={leftImage} fit="cover"/>
            </div>
          : null}
            {leftTitle && <Headline tag='h2' text={leftTitle} />}
            {leftText && <PortableTextComponent value={leftText as PortableTextBlock[]} />}
          </AnimationComponent>
        </GridItem>

        <GridItem desktopSpan={6}>
          {mediaType === 'video' && rightVideoUrl
            ? <VideoPlayer url={rightVideoUrl} title="Left Google Drive Video" />
            : rightImage
            ? <div className={`${styles.imageWrapper} ${getAspectRatioClass()}`}>
                <SanityNextImage image={rightImage} fit="cover"/>
              </div>
            : null}
          {rightTitle && <Headline tag='h2' text={rightTitle} />}
          {rightText && <PortableTextComponent value={rightText as PortableTextBlock[]} />}
        </GridItem>
      </Grid>
      </AnimationComponent>
      </div>



       {/* Mobile View */}
       <div className={styles.fiftyFiftyMobileView}>
        <div className={styles.fiftyFiftyMobileContent}>
          {isImageOnTop ? (
            <>
              <div className={styles.fiftyFiftyMobileImageContainer}>
                {mediaType === 'video' && leftVideoUrl
                ? <VideoPlayer url={leftVideoUrl} title="Left Mobile Video" />
                : leftImage
                ?  <div className={`${styles.imageWrapper} ${getAspectRatioClass()}`}>
                    <SanityNextImage image={leftImage} fit="cover" />
                  </div>
                : null}
                {mediaType === 'video' && rightVideoUrl
                ? <VideoPlayer url={rightVideoUrl} title="Right Mobile Video" />
                : rightImage
                ? <div className={`${styles.imageWrapper} ${getAspectRatioClass()}`}>
                    <SanityNextImage image={rightImage} fit="cover" />
                  </div>
                : null}
              </div>

              <div className={styles.fiftyFiftyMobileTextContainer}>
                {leftTitle && <Headline tag='h2' text={leftTitle} />}
                {leftText && <PortableTextComponent value={leftText as PortableTextBlock[]} />}
                {rightTitle && <Headline tag='h2' text={rightTitle} />}
                {rightText && <PortableTextComponent value={rightText as PortableTextBlock[]} />}
              </div>
            </>
          ) : (
            <>
              <div className={styles.fiftyFiftyMobileTextContainer}>
                {leftTitle && <Headline tag='h2' text={leftTitle} />}
                {leftText && <PortableTextComponent value={leftText as PortableTextBlock[]} />}
                {rightTitle && <Headline tag='h2' text={rightTitle} />}
                {rightText && <PortableTextComponent value={rightText as PortableTextBlock[]} />}
              </div>

              <div className={styles.fiftyFiftyMobileImageContainer}>
                {mediaType === 'video' && leftVideoUrl
                ? <VideoPlayer url={leftVideoUrl} title="Left Mobile Video" />
                : leftImage
                ?  <div className={`${styles.imageWrapper} ${getAspectRatioClass()}`}>
                    <SanityNextImage image={leftImage} fit="cover"/>
                  </div>
                : null}
                {mediaType === 'video' && rightVideoUrl
                ? <VideoPlayer url={rightVideoUrl} title="Right Mobile Video" />
                : rightImage
                ? <div className={`${styles.imageWrapper} ${getAspectRatioClass()}`}>
                  <SanityNextImage image={rightImage} fit="cover"  />
                  </div>
                : null}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
    )
}
