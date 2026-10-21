import {Button, Stack} from '@sanity/ui'
import {unset, type ObjectInputProps} from 'sanity'

export default function ClearableObjectInput(props: ObjectInputProps) {
  return <Stack space={3}>
    {props.renderDefault(props)}
    {props.value && <Button text="Clear content" tone="critical" mode="ghost" disabled={props.readOnly}
      onClick={() => props.onChange(unset())} />}
  </Stack>
}
