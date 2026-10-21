import Headline from "@/components/atoms/Headline";
import TextLink from "@/components/atoms/TextLink";
import type { TopicListItem } from "@/sanity/types";
import styles from "./TopicList.module.scss";

type InitiativeCardProps = {
  initiative: NonNullable<TopicListItem["initiative"]>;
  headingTag: "h3" | "h4";
};

export default function InitiativeCard({
  initiative,
  headingTag,
}: InitiativeCardProps) {
  if (!initiative.title) return null;
  const link = initiative.link;
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
      {initiative.summary && (
        <p className={styles.initiativeSummary}>{initiative.summary}</p>
      )}
      {link && (
        <TextLink link={link} ariaLabel={`${link.title}: ${initiative.title}`} className={styles.link} />
      )}
    </div>
  );
}
