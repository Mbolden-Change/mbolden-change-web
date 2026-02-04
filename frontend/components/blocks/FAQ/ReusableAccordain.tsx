import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type QuestionAnswer = {
  question: string;
  answer: string;
};

type AccordionProps = {
  items: QuestionAnswer[];
};

export default function FAQAccordion({ items }: AccordionProps) {
  return (
    <div>
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
