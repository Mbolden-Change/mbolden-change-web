import { PageBuilder as PageBuilderType } from '@/sanity/types';
import componentMap from '@/components/componentMap';

type PageBuilderProps = {
  content: PageBuilderType;
};

export function PageBuilder({ content }: PageBuilderProps) {
  if (!Array.isArray(content)) {
    return null;
  }

  return (
    <main id="as-main">
      {content.map((block, index) => {
        const Component =
          componentMap[block._type] || (() => <div>Block not found</div>);
        return <Component key={block._key} {...block} componentIndex={index}/>;
      })}
    </main>
  );
}
