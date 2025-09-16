// "use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);
// import { ScrollSmoother } from "gsap/ScrollSmoother";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import React, { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

// type AnimationProps = {
//     animationClass: "scroll" | "hover" | null;
//     horizontalAxis?: number;
//     verticalAxis?: number;
//     target: string;
//     start?: string;
//     end?: string;
//     scrub: number;
//     snap?: {};
//     snapTo?: string;
//     durationMin?: number;
//     durationMax?: number;
//     delay?: number;
//     ease?: string;
//     markers?: boolean;
//     children?: ReactNode;
//     Scroll?: {}
//     Hover?: {}
// };

type AnimationProps = {
    animationClass: "scroll";
    componentName: "fiftyFifty" | null;
    elementType: "image" | "text" | "box" | "headline-2" ;
    children?: ReactNode;

};

export const AnimationComponent = ({
    // animationClass = "scroll" as const,
    // horizontalAxis,
    // verticalAxis,
    // target,
    // start,
    // end,
    // scrub,
    // snapTo,
    // durationMin,
    // durationMax,
    // delay,
    // ease,
    // snap = {
    //     snapTo,
    //     duration: {min: durationMin, max: durationMax},
    //     delay,
    //     ease,
    // },
    // markers,
    // children,
    animationClass,
    componentName,
    elementType,
    children,
    }: AnimationProps) => {
    const animationComponentRef = useRef<HTMLDivElement>(this) as any;

    // useEffect(() => {
    //     if (animationComponentRef.current) {
    //         const element = [animationComponentRef.current.querySelectorAll(`${target}`)];
    //         console.log("Test: ", animationComponentRef);
    //         console.log("Elements: ", element[0]);

    //         if (animationClass == "scroll") {
    //             gsap.from(element[0], {
    //                 x: horizontalAxis || undefined,
    //                 y: verticalAxis || undefined,
    //                 scrollTrigger: {
    //                     trigger: element[0],
    //                     pin: false,
    //                     start: start,
    //                     end: end,
    //                     scrub: scrub,
    //                     // @ts-ignore
    //                     snap: snap,
    //                     markers: markers
    //                 },
    //             });
    //         }
    //     }
    // }, [target]);

        useEffect(() => {
        if (animationComponentRef.current) {

            if (animationClass == "scroll" && componentName == "fiftyFifty" && elementType == "image") {
                const element = animationComponentRef.current.querySelectorAll("img");
                // console.log("Test: ", animationComponentRef);
                // console.log("Elements: ", element);
                gsap.from(element, {
                    x: 1000,
                    scrollTrigger: {
                    trigger: element[0],
                    pin: false,
                    start: 'top center',
                    end: '+300',
                    scrub: 1,
                    snap: {
                        snapTo: 'labels',
                        duration: { min: 0.05, max: 3 },
                        delay: 0.05,
                        ease: 'power1.inOut'
                    },
                    markers: true
                    },
                });
            }
            if (animationClass == "scroll" && componentName == "fiftyFifty" && elementType == "text") {
                const element = animationComponentRef.current.querySelectorAll("p");
                gsap.from(element, {
                    x: 1000,
                    scrollTrigger: {
                    trigger: element[0],
                    pin: false,
                    start: 'top center',
                    end: '+300',
                    scrub: 1,
                    snap: {
                        snapTo: 'labels',
                        duration: { min: 0.05, max: 3 },
                        delay: 0.05,
                        ease: 'power1.inOut'
                    },
                    markers: true
                    },
                });
            }
            if (animationClass == "scroll" && componentName == "fiftyFifty" && elementType == "headline-2") {
                const element = animationComponentRef.current.querySelectorAll("h2");
                gsap.from(element, {
                    x: 1000,
                    scrollTrigger: {
                    trigger: element[0],
                    pin: false,
                    start: 'top center',
                    end: '+300',
                    scrub: 1,
                    snap: {
                        snapTo: 'labels',
                        duration: { min: 0.05, max: 3 },
                        delay: 0.05,
                        ease: 'power1.inOut'
                    },
                    markers: true
                    },
                });
            }
        }
    }, []);


    return (
        <div ref={animationComponentRef}>
            {children}
        </div>
    );
}


        // Example

        // <AnimationComponent
        //   animationClass="scroll"
        //   target="h2"
        //   horizontalAxis={700}
        //   start="top center"
        //   end="+=300"
        //   scrub={1}
        //   snapTo="labels"
        //   durationMin= {0.05}
        //   durationMax= {3}
        //   delay={0.05}
        //   ease='power1.inOut'
        //   markers={false}
        //   >
        // </AnimationComponent>
