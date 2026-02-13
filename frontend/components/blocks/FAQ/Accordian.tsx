import data from './data';
import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import ReusableAccordion from './ReusableAccordain';



export default function Accordian() {
  return (
    <div>
      <Grid>
        <GridItem desktopSpan={12} mobileSpan={12}>
          <ReusableAccordion
            heading={data.heading}
            subheading={data.subheading}
            items={data.items}
          />
        </GridItem>
      </Grid>
    </div>
  );
}
