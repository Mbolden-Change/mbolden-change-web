import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import styles from './FAQ.module.css';

type QuestionAnswer = {
  question: string;
  answer: string;
};

type AccordionProps = {
  heading: string;
  subheading: string;
  items: QuestionAnswer[];
};

export default function ReusableAccordion({
  heading,
  subheading,
  items,
}: AccordionProps) {
  return (
    <div>
      <h2 className={styles.heading}>{heading}</h2>

      {subheading && (
        <h4 className={styles.subheading}>{subheading}</h4>
      )}

      {items.map((item, index) => (
        <Accordion
          key={index}
          defaultExpanded={index === 0}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${index}-content`}
            id={`panel-${index}-header`}
          >
            <Typography component="span">
              {item.question}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography>
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}

