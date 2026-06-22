import { PageBuilder as PageBuilderType } from '@/sanity/types';
import componentMap from '@/components/componentMap';
import type { PageBuilderBlockLayoutProps } from '@/lib/pageBuilderLayout';

type PageBuilderProps = {
  content: PageBuilderType;
};

export function PageBuilder({ content }: PageBuilderProps) {
  if (!Array.isArray(content)) {
    return null;
  }

  const lastIndex = content.length - 1;

  return (
    <main id="as-main">
      {content.map((block, index) => {
        const Component =
          componentMap[block._type] || (() => <div>Block not found</div>);

        const layout: PageBuilderBlockLayoutProps = {
          prevBlockType: content[index - 1]?._type,
          nextBlockType: content[index + 1]?._type,
          isFirstBlock: index === 0,
          isLastBlock: index === lastIndex,
        };

        return (
          <Component
            key={block._key}
            {...block}
            componentIndex={index}
            {...layout}
          />
        );
      })}
    </main>
  );
}
