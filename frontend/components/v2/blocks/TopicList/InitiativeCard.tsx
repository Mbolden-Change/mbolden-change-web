import Headline from "@/components/atoms/Headline";
import TextLink from "@/components/atoms/TextLink";
import type { TopicListItem } from "@/sanity/types";
import styles from "./TopicList.module.scss";

type InitiativeCardProps = {
  initiative: NonNullable<TopicListItem["initiative"]>;
  headingTag: "h3" | "h4";
  /** Split the summary on blank lines into separate paragraphs. */
  paragraphs?: boolean;
};

export default function InitiativeCard({
  initiative,
  headingTag,
  paragraphs = false,
}: InitiativeCardProps) {
  if (!initiative.title) return null;
  const link = initiative.link;
  const summary = paragraphs
    ? initiative.summary?.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean)
    : undefined;
  return (
    <div className={styles.initiative}>
      {initiative.label && (
        <p className={styles.initiativeLabel}>{initiative.label}</p>
      )}
      <Headline
        tag={headingTag}
        text={initiative.title}
        className={styles.initiativeTitle}
      />
      {summary
        ? summary.map((text, index) => (
            <p key={index} className={styles.initiativeSummary}>
              {text}
            </p>
          ))
        : initiative.summary && (
            <p className={styles.initiativeSummary}>{initiative.summary}</p>
          )}
      {link && (
        <TextLink link={link} ariaLabel={`${link.title}: ${initiative.title}`} className={styles.link} />
      )}
    </div>
  );
}
