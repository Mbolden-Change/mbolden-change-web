import Headline from '../atoms/Headline';
import { PortableTextBlock } from '@portabletext/types';
import PortableTextComponent from '../PortableTextComponent';
import Grid from '../Grid';
import GridItem from '../GridItem';


type RichTextProps = {
  title: string;
  text: PortableTextBlock[];
  hasPadding?: boolean;
};

export default function RichText({ title, text, hasPadding = true }: RichTextProps) {
  const content = <PortableTextComponent value={text} />;
  return hasPadding ? (
    <Grid>
      <GridItem desktopSpan={12} mobileSpan={12}>
        {title && <Headline tag='h2' text={title} />}
        <PortableTextComponent value={text} />
      </GridItem>
    </Grid>
  ) : (
    content
  );
}
