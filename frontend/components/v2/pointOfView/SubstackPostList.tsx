import type {ResolvedSubstackPostList} from '@/lib/pointOfView'
import PostCards from './PostCards'

/** getPage adds `cards` from Substack; without them (e.g. Storybook) nothing shows. */
export type SubstackPostListProps = Partial<ResolvedSubstackPostList>

/** Every Substack post, newest first, 12 at a time unless Studio says otherwise. */
export default function SubstackPostList({cards = [], initialCount, buttonLabel}: SubstackPostListProps) {
  return (
    <PostCards cards={cards} label="All posts" initialCount={initialCount ?? 12} buttonLabel={buttonLabel?.trim() || undefined} />
  )
}
