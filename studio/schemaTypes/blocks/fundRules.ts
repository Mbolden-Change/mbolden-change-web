/**
 * Rules for the funds in a Fund Cards block. Plain functions with no Sanity
 * imports, so `npm test` can run them on their own.
 */

export type FundRuleInput = {
  _key?: string
  linkId?: string
  showOnDonatePage?: boolean
}

export const MAX_SHOWN_FUNDS = 3

/** A fund shows as a card unless its switch is off. No value counts as on. */
export const isShown = (fund: FundRuleInput) => fund.showOnDonatePage !== false

type FundError = {message: string; path?: Array<{_key: string} | string | number>}

/** Each broken rule once, pointing at the fund and field to fix where there is one. */
export function fundsErrors(funds: FundRuleInput[] | undefined): FundError[] {
  const list = funds ?? []
  const errors: FundError[] = []
  const at = (fund: FundRuleInput, index: number, field: string) => [
    fund._key ? {_key: fund._key} : index,
    field,
  ]

  const ids = list.map((fund) => fund.linkId).filter(Boolean)
  if (new Set(ids).size !== ids.length) errors.push({message: 'Link IDs must be unique in this block.'})

  if (list[0] && !isShown(list[0])) {
    errors.push({
      message: "The first fund (Where it's needed most) always shows.",
      path: at(list[0], 0, 'showOnDonatePage'),
    })
  }

  if (list.filter(isShown).length > MAX_SHOWN_FUNDS) {
    errors.push({message: 'Only 3 funds can show on the Donate page. Turn one off first.'})
  }

  list.forEach((fund, index) => {
    if (!isShown(fund) && !fund.linkId?.trim()) {
      errors.push({message: 'A hidden fund needs a link ID.', path: at(fund, index, 'linkId')})
    }
  })

  return errors
}
