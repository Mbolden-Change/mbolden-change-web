import Headline from '../atoms/Headline';
import { PortableTextBlock } from '@portabletext/types';
import PortableTextComponent from '../PortableTextComponent';
import Grid from '../Grid';
import GridItem from '../GridItem';
import styles from './RichText.module.css';

type RichTextProps = {
  title: string;
  text: PortableTextBlock[];
  variant?: 'standalone' | 'nested';
};

export default function RichText({ title, text, variant = 'standalone' }: RichTextProps) {
  const variantClass = variant === 'standalone'? styles.standalone: styles.nested;

    const content = (
      <div className={variantClass}>
        {title && <Headline tag='h2' text={title} className={styles.headline}/>}
        {<PortableTextComponent value={text} />}
      </div>
    );

  return (
    <Grid>
      <GridItem desktopSpan={12} mobileSpan={12}>
        {content}
      </GridItem>
    </Grid>
  );
}
