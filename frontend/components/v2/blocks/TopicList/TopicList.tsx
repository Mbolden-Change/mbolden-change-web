"use client";

import { useRef } from "react";
import classNames from "classnames";
import Headline from "@/components/atoms/Headline";
import InitiativeCard from "./InitiativeCard";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TextLink from "@/components/atoms/TextLink";
import type { TopicList as TopicListType } from "@/sanity/types";
import {
  isRenderableInternalOrExternalLink,
} from "@/utils/internalOrExternalLink";
import styles from "./TopicList.module.scss";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type TopicListProps = TopicListType;

export default function TopicList({
  appearance = "plain",
  eyebrow,
  title,
  description,
  items,
  closingEyebrow,
  closingNote,
}: TopicListProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const closingRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || !items?.length) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) return;

      if (introRef.current) {
        gsap.from(introRef.current, {
          opacity: 0,
          y: 12,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: introRef.current,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const itemEls =
        listRef.current?.querySelectorAll<HTMLElement>("[data-topic-item]");
      if (itemEls?.length) {
        gsap.from(itemEls, {
          opacity: 0,
          y: 12,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      }

      if (closingRef.current) {
        gsap.from(closingRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: closingRef.current,
            start: "top 94%",
            toggleActions: "play none none reverse",
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [items, closingNote, closingEyebrow] },
  );

  if (!items?.length) return null;

  const hasIntro = Boolean(eyebrow || title || description);

  return (
    <section
      ref={sectionRef}
      className={classNames(
        styles.wrapper,
        appearance === "initiatives" && styles.initiatives,
        appearance === "focusIndex" && styles.focusIndex,
      )}
      aria-label={title || "Focus areas"}
    >
      <div className={styles.inner}>
        {hasIntro && (
          <div ref={introRef} className={styles.intro}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            {title && (
              <Headline tag="h2" text={title} className={styles.title} />
            )}
            {description && <p className={styles.description}>{description}</p>}
          </div>
        )}

        <ul ref={listRef} className={styles.list}>
          {items.map((item, index) => {
            const showLink = isRenderableInternalOrExternalLink(item.link);
            return (
              <li
                key={item._key || index}
                className={styles.item}
                data-topic-item
              >
                <Headline
                  tag={title ? "h3" : "h2"}
                  text={item.title}
                  className={styles.itemTitle}
                />
                {item.body && <p className={styles.body}>{item.body}</p>}
                {appearance !== "initiatives" && appearance !== "focusIndex" && !item.initiative?.title && showLink && item.link && (
                  <TextLink link={item.link} arrow className={styles.link} />
                )}
                {item.initiative && (
                  <InitiativeCard
                    initiative={item.initiative}
                    headingTag={title ? "h4" : "h3"}
                    paragraphs={appearance === "focusIndex"}
                  />
                )}
              </li>
            );
          })}
        </ul>

        {closingNote && (
          <aside ref={closingRef} className={styles.closing}>
            {closingEyebrow && (
              <p className={styles.closingEyebrow}>{closingEyebrow}</p>
            )}
            <p className={styles.closingText}>{closingNote}</p>
          </aside>
        )}
      </div>
    </section>
  );
}
