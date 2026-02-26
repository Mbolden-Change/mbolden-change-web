import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import ReusableAccordion from './ReusableAccordain';

type FAQItem = {
  _key?: string;
  question: string;
  answer: string;
};

type AccordianProps = {
  heading: string;
  subheading?: string;
  items: FAQItem[];
};


export default function Accordian({ heading, subheading, items }: AccordianProps) {
  
  console.log('FAQ Data:', { heading, subheading, items });
  
  return (
    <div>
      <Grid>
        <GridItem desktopSpan={12} mobileSpan={12}>
          <ReusableAccordion
            heading={heading}
            subheading={subheading}
            items={items}
          />
        </GridItem>
      </Grid>
    </div>
  );
}
