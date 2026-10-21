import {Button, Select, Stack, Text} from '@sanity/ui'
import {set, setIfMissing, unset, useFormValue, type ObjectInputProps} from 'sanity'

export default function LinkDestinationInput(props: ObjectInputProps) {
  const documentType = useFormValue(['_type'])
  const value = props.value
  const mode =
    typeof value?.anchor === 'string' ? 'section' : value?.isExternalLink ? 'external' : 'page'
  return (
    <Stack space={4}>
      <Stack space={2}>
        <Text size={1} weight="semibold">
          Destination
        </Text>
        <Select
          aria-label="Link destination"
          value={mode}
          disabled={props.readOnly}
          onChange={(event) => {
            const next = event.currentTarget.value
            props.onChange([
              setIfMissing({_type: props.schemaType.name}),
              next === 'section' ? set('', ['anchor']) : unset(['anchor']),
              set(next === 'external', ['isExternalLink']),
            ])
          }}
        >
          <option value="page">Page</option>
          <option value="external">External URL</option>
          {(documentType === 'page' || mode === 'section') && <option value="section">Section on this page</option>}
        </Select>
      </Stack>
      {props.renderDefault(props)}
      {props.value && <Button text="Clear link" tone="critical" mode="ghost" disabled={props.readOnly}
        onClick={() => props.onChange(unset())} />}
    </Stack>
  )
}
