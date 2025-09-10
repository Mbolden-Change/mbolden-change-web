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

type AnimationProps = {
    animationClass: "scroll" | null;
    horizontalAxis?: number;
    verticalAxis?: number;
    target: string;
    start?: string;
    end?: string;
    scrub: number;
    snap?: {};
    snapTo?: string;
    durationMin?: number;
    durationMax?: number;
    delay?: number;
    ease?: string;
    markers?: boolean;
    children?: ReactNode;
};


export const AnimationComponent = ({
    animationClass = "scroll" as const,
    horizontalAxis,
    verticalAxis,
    target,
    start,
    end,
    scrub,
    snapTo,
    durationMin,
    durationMax,
    delay,
    ease,
    snap = {
        snapTo,
        duration: {min: durationMin, max: durationMax},
        delay,
        ease,
    },
    markers,
    children,
    }: AnimationProps) => {
    const animationComponentRef = useRef<HTMLDivElement>(this) as any;

    useEffect(() => {
        if (animationComponentRef.current) {
            const element = [animationComponentRef.current.querySelectorAll(`${target}`)];
            console.log("Test: ", animationComponentRef);
            console.log("Elements: ", element[0]);

            if (animationClass == "scroll") {
                gsap.from(element[0], {
                    x: horizontalAxis || undefined,
                    y: verticalAxis || undefined,
                    scrollTrigger: {
                        trigger: element[0],
                        pin: false,
                        start: start,
                        end: end,
                        scrub: scrub,
                        // @ts-ignore
                        snap: snap,
                        markers: markers
                    },
                });
            }
        }
    }, [target]);


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
