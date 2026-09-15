import {
  collectFaqPairsFromPageBuilder,
  guardArticle,
  guardBreadcrumbList,
  guardFaqPage,
  guardWebSite,
  pickGuardedSchemas,
  portableTextToPlain,
  resolvePublishedDate,
} from '../index'

describe('jsonld edge guards', () => {
  describe('guardFaqPage', () => {
    it('emits FAQPage when pairs are valid', () => {
      const result = guardFaqPage([
        {question: 'What do you do?', answer: 'We fund and advocate.'},
      ])
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.data['@type']).toBe('FAQPage')
      expect(result.data.mainEntity).toHaveLength(1)
    })

    it('skips when questions or answers are empty', () => {
      expect(guardFaqPage([{question: 'Q?', answer: '  '}]).ok).toBe(false)
      expect(guardFaqPage([]).ok).toBe(false)
      expect(guardFaqPage(null).ok).toBe(false)
    })
  })

  describe('guardArticle', () => {
    it('emits Article when required fields exist', () => {
      const result = guardArticle({
        headline: 'Our statement',
        url: '/statement/example',
        datePublished: '2026-01-15',
        description: 'A short lead.',
      })
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.data['@type']).toBe('Article')
      expect(result.data.image).toEqual([
        'https://www.mboldenchange.org/og-image.png',
      ])
    })

    it('skips without headline or date', () => {
      expect(
        guardArticle({
          headline: '',
          url: '/statement/x',
          datePublished: '2026-01-01',
        }).ok,
      ).toBe(false)
      expect(
        guardArticle({
          headline: 'Title',
          url: '/statement/x',
          datePublished: null,
        }).ok,
      ).toBe(false)
    })
  })

  describe('guardBreadcrumbList', () => {
    it('requires at least two crumbs', () => {
      expect(guardBreadcrumbList([{name: 'Home', path: '/'}]).ok).toBe(false)
      const result = guardBreadcrumbList([
        {name: 'Home', path: '/'},
        {name: 'Reports', path: '/report/a'},
      ])
      expect(result.ok).toBe(true)
    })
  })

  describe('guardWebSite', () => {
    it('emits WebSite linked to the organization', () => {
      const result = guardWebSite('Nonprofit description')
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.data['@type']).toBe('WebSite')
      expect(result.data.publisher).toEqual({
        '@id': 'https://www.mboldenchange.org/#organization',
      })
    })
  })

  describe('pickGuardedSchemas', () => {
    it('drops failed guards', () => {
      const schemas = pickGuardedSchemas([
        guardFaqPage([]),
        guardWebSite(),
        guardBreadcrumbList([{name: 'Only one'}]),
      ])
      expect(schemas).toHaveLength(1)
      expect(schemas[0]?.['@type']).toBe('WebSite')
    })
  })

  describe('fromContent helpers', () => {
    it('collects FAQ pairs from page builder and tabs', () => {
      const pairs = collectFaqPairsFromPageBuilder([
        {
          _type: 'faq',
          items: [{question: 'A?', answer: '1'}],
        },
        {
          _type: 'tabsContainer',
          tabs: [
            {
              content: [
                {
                  _type: 'faq',
                  items: [{question: 'B?', answer: '2'}],
                },
              ],
            },
          ],
        },
      ])
      expect(pairs).toHaveLength(2)
    })

    it('flattens portable text and resolves dates', () => {
      expect(
        portableTextToPlain([
          {
            _type: 'block',
            children: [{text: 'Hello '}, {text: 'world'}],
          },
        ]),
      ).toBe('Hello world')
      expect(
        resolvePublishedDate({
          date: '2026-03-01',
          _createdAt: '2026-01-01',
        }),
      ).toBe('2026-03-01')
    })
  })
})
