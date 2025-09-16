// "use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);
// import { ScrollSmoother } from "gsap/ScrollSmoother";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import React, { ReactNode } from 'react';

type AnimationProps = {
    animationClass: "scroll" | "fade";
    componentName: "fiftyFifty" | null;
    elementType: "image" | "video" | "text" | "box" | "headline-2";
    effectFrom: "left" | "right" | "top" | "bottom";
    children?: ReactNode;

};

export const AnimationComponent = ({
    animationClass,
    componentName,
    elementType,
    effectFrom,
    children,
    }: AnimationProps) => {
    const animationComponentRef = useRef<HTMLDivElement>(this) as any;

    const effectDirection = (num:number, effectFrom:string) => {
        if (effectFrom == "left" || "bottom") {
            return num = Math.abs(num);
        } else if (effectFrom == "right" || "top") {
            return num = -(Math.abs(num));
        }
    }

        useEffect(() => {
        if (animationComponentRef.current) {

            if (animationClass == "scroll" && componentName == "fiftyFifty" && elementType == "box") {
                const element = animationComponentRef.current.querySelectorAll("div");
                // console.log("Test: ", animationComponentRef);
                // console.log("Elements: ", element);
                gsap.from(element, {
                    x: effectDirection(-1000, effectFrom),
                    // y: effect
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
