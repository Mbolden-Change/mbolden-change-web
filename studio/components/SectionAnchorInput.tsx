import {Select, Stack, Text} from '@sanity/ui'
import {set, useFormValue, type StringInputProps} from 'sanity'

type Section = {_type?: string; sectionId?: string; headline?: string}
export default function SectionAnchorInput(props: StringInputProps) {
  const content = useFormValue(['content']) as Section[] | undefined
  const sections = (content ?? []).filter((block) => block._type === 'textMedia' && block.sectionId)
  const missing = props.value && !sections.some((block) => block.sectionId === props.value)
  return (
    <Stack space={3}>
      <Select
        ref={props.elementProps.ref}
        id={props.elementProps.id}
        value={props.value ?? ''}
        disabled={props.readOnly}
        onFocus={props.elementProps.onFocus}
        onBlur={props.elementProps.onBlur}
        onChange={(event) =>
          props.onChange(event.currentTarget.value ? set(event.currentTarget.value) : set(''))
        }
      >
        <option value="">Choose a section</option>
        {missing && <option value={props.value}>Missing section: {props.value}</option>}
        {sections.map((section, index) => (
          <option key={`${section.sectionId}-${index}`} value={section.sectionId}>
            {section.headline || section.sectionId} ({section.sectionId})
          </option>
        ))}
      </Select>
      {!sections.length && (
        <Text size={1}>Add a Section ID to a Text &amp; Media block on this page first.</Text>
      )}
      <Text size={1}>
        Choose the destination heading. Changing or removing its Section ID requires updating this
        link.
      </Text>
    </Stack>
  )
}
