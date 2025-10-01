"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);
import React, { ReactNode } from 'react';

type AnimationProps = {
    animationClass: "scroll" | "fade";
    componentName: "fiftyFifty" | "cardGallery";
    elementType: "image" | "video" | "text" | "box" | "headline-2" | "grid";
    effectFrom: "left" | "right" | "top" | "bottom";
    componentIndex?: number;
    children?: ReactNode;
};

export const AnimationComponent = ({
    animationClass,
    componentName,
    elementType,
    effectFrom,
    children,
    componentIndex = 0,
    }: AnimationProps) => {
    const animationComponentRef = useRef<HTMLDivElement>(this) as any;

    const effectDirection = (num:number, effectFrom:string) => {
        if (effectFrom == "left" || effectFrom == "bottom") {
            return num = Math.abs(num);
        } else if (effectFrom == "right" || effectFrom == "top") {
            return num = -(Math.abs(num));
        }
    }

    const animationStart = () => {
        if (componentIndex < 2) {
            return "top 100%";
        } else {
            return "top 85%"
        }
    }

    useGSAP(() => {
        if (animationComponentRef.current) {
            const container = animationComponentRef.current.children

            if (animationClass == "scroll" && componentName == "fiftyFifty" && elementType == "box") {
                const element = animationComponentRef.current.querySelectorAll("div");
                gsap.from(element, {
                    x: effectDirection(-1000, effectFrom),
                    scrollTrigger: {
                    trigger: element[0],
                    pin: false,
                    start: animationStart(),
                    end: 'center bottom',
                    snap: {
                        snapTo: 'labels',
                        duration: { min: 0.05, max: 3 },
                        delay: 0.05,
                        ease: 'power1.inOut'
                    },
                    // markers: true
                    },
                });
            }
            if (animationClass == "scroll" && componentName == "cardGallery" && elementType == "box") {
                gsap.from(container, {
                    y: effectDirection(300, effectFrom),
                    scrollTrigger: {
                    trigger: animationComponentRef.current,
                    pin: false,
                    start: animationStart(),
                    end: 'center bottom',
                    snap: {
                        snapTo: 'labels',
                        duration: { min: 0, max: 2 },
                        delay: 0,
                        ease: 'power1.inOut'
                    },
                    // markers: true
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
