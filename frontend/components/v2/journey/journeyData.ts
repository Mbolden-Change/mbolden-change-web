// Generated from journey-build/assets/journey.json (copy, camera and layer positions)
// with each painting's pixel size, the spec's alt text and the vertical anchors
// (stops 2, 3, 4, 6 and 8 keep the top of the painting in view); stop 8 zooms to
// 1.06 rather than 1.14 so the girl's lantern stays in frame. Layers are listed back to front;
// x, y, w and h are percentages of the artboard.

export type JourneyImage = {src: string; width: number; height: number}
export type JourneyLayer = JourneyImage & {x: number; y: number; w: number; h: number; depth: number; drift: number}
export type JourneyStop = {
  number: string
  name: string
  line: string
  focus: [number, number]
  zoom: [number, number]
  phonePan: [number, number]
  /**
   * Where the artboard sits vertically when the stage is wider than the painting:
   * 0 keeps the top in view, 0.5 centers it, 1 keeps the bottom.
   */
  anchorY: number
  shadow: 'teal' | 'yellow' | 'fuchsia'
  longLine: boolean
  captionTop: boolean
  /** On the front layer; the other layers are decorative. */
  alt: string
  /** The flat painting, used with reduced motion. */
  flat: JourneyImage
  layers: JourneyLayer[]
}

export type Journey = {
  title: string
  eyebrow: string
  scrollCue: string
  endingEyebrow: string
  ending: string
  /** A tiny blurred copy of stop 1, shown until its paintings are ready. */
  placeholder: string
  artboard: {width: number; height: number}
  timing: {introScreens: number; screensPerStop: number; outroScreens: number}
  stops: JourneyStop[]
}

export const JOURNEY: Journey = {
  "title": "Building the Road to Systemic Equity",
  "eyebrow": "About mBOLDen Change",
  "scrollCue": "Scroll to walk the road",
  "endingEyebrow": "Systemic Equity",
  "ending": "Join us.",
  "placeholder": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAbADADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDZurko8yR73YLhGGSC3ep7cLcQB8lXXhtxAyazZiTqRggeb95GVUfdGQ2c1aMBSdWlkwj5LBRnoBjBNTdp6se60RbFpI/zJJuHqG/wpRZOGOZOPbOahs4GghU72Q5yTux+dW7p7mKKSWWQw20UJdpnJxkeoHPShTT2DlaIJLAtEc7ww6HGaZBp0iSAs5yenamLLHd6ebu1laUMjGPezLvxVHw3e/b7ma2v7fy7m3YHgkqynvnPrRzoORlq5uGkv2ljynlgorOexPPFPtBJdOXtk8yRW2mWXoPpRaWsEuvyLJGGAycE966OQCG2XygEzgcVlGPMaOXKUrW2jinzKryzjnLjAX6DtUuuxmfw/eRlsF4SDtHUHt+PT8auQovynHPXNQauAdKuM98Z/MVo/di7ErV6nN2eo2sGkJE1vM1vG5/fJj5PQc98cVgC8xqKNExBkmI6YO3qOK2NUAj8MTFOP9IQ/oa5WwAe+tmYDLEZwMUqSvBNlOVpWP/Z",
  "artboard": {
    "width": 2752,
    "height": 1536
  },
  "timing": {
    "introScreens": 1,
    "screensPerStop": 1.8,
    "outroScreens": 1.1
  },
  "stops": [
    {
      "number": "01",
      "name": "Where We Are",
      "line": "Our systems give some people a head start and help them stay ahead.",
      "focus": [
        60,
        58
      ],
      "zoom": [
        1,
        1.12
      ],
      "phonePan": [
        8,
        78
      ],
      "anchorY": 0.5,
      "shadow": "teal",
      "longLine": false,
      "captionTop": false,
      "alt": "A mother kneels to talk with her daughter on a cracked road while people in suits walk a raised glass walkway toward glowing towers.",
      "flat": {
        "src": "/journey/flat/stop-1.webp",
        "width": 1920,
        "height": 1072
      },
      "layers": [
        {
          "src": "/journey/stop-1/back.webp",
          "width": 1920,
          "height": 1072,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/stop-1/sky.webp",
          "width": 2288,
          "height": 458,
          "x": -10.465,
          "y": -4.622,
          "w": 119.19,
          "h": 42.71,
          "depth": 0.2,
          "drift": -5
        },
        {
          "src": "/journey/stop-1/middle.webp",
          "width": 1920,
          "height": 459,
          "x": 0,
          "y": 4.492,
          "w": 100,
          "h": 42.84,
          "depth": 0.6,
          "drift": 0
        },
        {
          "src": "/journey/stop-1/front.webp",
          "width": 1920,
          "height": 792,
          "x": 0,
          "y": 26.107,
          "w": 100,
          "h": 73.893,
          "depth": 1.2,
          "drift": 0
        }
      ]
    },
    {
      "number": "02",
      "name": "Building a Sustainable Safety Net",
      "line": "No one pulls themselves up by their own bootstraps. Neighbors helping neighbors can’t replace a safety net.",
      "focus": [
        50,
        30
      ],
      "zoom": [
        1,
        1.1
      ],
      "phonePan": [
        25,
        72
      ],
      "anchorY": 0,
      "shadow": "yellow",
      "longLine": true,
      "captionTop": false,
      "alt": "A young woman with a backpack and work apron is handed groceries and a coat by neighbors under a yellow SUPPORT banner. Ahead, a torn net hangs over a hole in the road.",
      "flat": {
        "src": "/journey/flat/stop-2.webp",
        "width": 1920,
        "height": 1072
      },
      "layers": [
        {
          "src": "/journey/stop-2/back.webp",
          "width": 1920,
          "height": 1072,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/stop-2/layer-1.webp",
          "width": 1920,
          "height": 650,
          "x": -0.008,
          "y": 0.067,
          "w": 99.984,
          "h": 60.668,
          "depth": 0.2,
          "drift": 0
        },
        {
          "src": "/journey/stop-2/layer-2.webp",
          "width": 1920,
          "height": 594,
          "x": -0.002,
          "y": 44.547,
          "w": 100.003,
          "h": 55.463,
          "depth": 0.65,
          "drift": 0
        },
        {
          "src": "/journey/stop-2/layer-3.webp",
          "width": 1825,
          "height": 1012,
          "x": 2.175,
          "y": 1.824,
          "w": 95.026,
          "h": 94.471,
          "depth": 1.1,
          "drift": 0
        }
      ]
    },
    {
      "number": "03",
      "name": "Changing What We Value",
      "line": "Our society continues to protect and prioritize some lives over others.",
      "focus": [
        58,
        42
      ],
      "zoom": [
        1,
        1.1
      ],
      "phonePan": [
        18,
        72
      ],
      "anchorY": 0,
      "shadow": "fuchsia",
      "longLine": false,
      "captionTop": true,
      "alt": "A street painted with giant yellow letters reading BLACK LIVES MATTER. A Black mother holds her son's framed photo as neighbors of every age and race stand with her. A candlelit memorial lines the curb and a raised-fist monument rises at the end of the street.",
      "flat": {
        "src": "/journey/flat/stop-3.webp",
        "width": 1920,
        "height": 1072
      },
      "layers": [
        {
          "src": "/journey/stop-3/back.webp",
          "width": 1920,
          "height": 1072,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/stop-3/layer-1.webp",
          "width": 1920,
          "height": 247,
          "x": 0.0,
          "y": 0.0,
          "w": 100.0,
          "h": 23.083,
          "depth": 0.2,
          "drift": 0
        },
        {
          "src": "/journey/stop-3/layer-2.webp",
          "width": 1920,
          "height": 574,
          "x": -0.002,
          "y": 0.004,
          "w": 99.994,
          "h": 53.567,
          "depth": 0.65,
          "drift": 0
        },
        {
          "src": "/journey/stop-3/layer-3.webp",
          "width": 1920,
          "height": 768,
          "x": -0.005,
          "y": 28.318,
          "w": 100.007,
          "h": 71.684,
          "depth": 1.1,
          "drift": 0
        }
      ]
    },
    {
      "number": "04",
      "name": "Taking Collective Action",
      "line": "Change doesn’t come on its own. We have to fight for it.",
      "focus": [
        28,
        40
      ],
      "zoom": [
        1,
        1.12
      ],
      "phonePan": [
        14,
        40
      ],
      "anchorY": 0,
      "shadow": "yellow",
      "longLine": false,
      "captionTop": false,
      "alt": "On a rainy road, a woman in a yellow raincoat speaks through a megaphone as neighbors raise signs, one reading COMMUNITY.",
      "flat": {
        "src": "/journey/flat/stop-4.webp",
        "width": 1920,
        "height": 1072
      },
      "layers": [
        {
          "src": "/journey/stop-4/back.webp",
          "width": 1920,
          "height": 1072,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/stop-4/layer-1.webp",
          "width": 1921,
          "height": 491,
          "x": -0.02,
          "y": -0.007,
          "w": 100.055,
          "h": 45.788,
          "depth": 0.2,
          "drift": 0
        },
        {
          "src": "/journey/stop-4/layer-2.webp",
          "width": 1822,
          "height": 664,
          "x": 5.118,
          "y": 38.025,
          "w": 94.878,
          "h": 61.976,
          "depth": 0.65,
          "drift": 0
        },
        {
          "src": "/journey/stop-4/layer-3.webp",
          "width": 1800,
          "height": 991,
          "x": -0.003,
          "y": 7.551,
          "w": 93.752,
          "h": 92.45,
          "depth": 1.1,
          "drift": 0
        }
      ]
    },
    {
      "number": "05",
      "name": "Casting Our Votes",
      "line": "Who and what we vote for is a reflection of our values.",
      "focus": [
        50,
        72
      ],
      "zoom": [
        1,
        1.13
      ],
      "phonePan": [
        30,
        52
      ],
      "anchorY": 0.5,
      "shadow": "teal",
      "longLine": false,
      "captionTop": false,
      "alt": "A line of voters waits outside a school gym. In front, a hand drops a ballot marked for a candidate and a measure into a box beside a VOTE sign.",
      "flat": {
        "src": "/journey/flat/stop-5.webp",
        "width": 1920,
        "height": 1072
      },
      "layers": [
        {
          "src": "/journey/stop-5/back.webp",
          "width": 1920,
          "height": 1072,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/stop-5/layer-1.webp",
          "width": 1773,
          "height": 643,
          "x": 7.558,
          "y": 0.0,
          "w": 92.369,
          "h": 59.961,
          "depth": 0.2,
          "drift": 0
        },
        {
          "src": "/journey/stop-5/layer-2.webp",
          "width": 1813,
          "height": 1071,
          "x": 0.004,
          "y": 0.004,
          "w": 94.425,
          "h": 99.983,
          "depth": 0.65,
          "drift": 0
        },
        {
          "src": "/journey/stop-5/layer-3.webp",
          "width": 1920,
          "height": 801,
          "x": -0.001,
          "y": 25.263,
          "w": 99.999,
          "h": 74.739,
          "depth": 1.1,
          "drift": 0
        }
      ]
    },
    {
      "number": "06",
      "name": "Rewriting the Rules",
      "line": "Together we can rewrite the rules that shape our lives.",
      "focus": [
        36,
        28
      ],
      "zoom": [
        1,
        1.11
      ],
      "phonePan": [
        24,
        80
      ],
      "anchorY": 0,
      "shadow": "fuchsia",
      "longLine": false,
      "captionTop": false,
      "alt": "A wooden gate topped with scales of justice opens onto the road as crews lower a ramp from a raised glass walkway so people can walk down to the road.",
      "flat": {
        "src": "/journey/flat/stop-6.webp",
        "width": 1920,
        "height": 1072
      },
      "layers": [
        {
          "src": "/journey/stop-6/back.webp",
          "width": 1920,
          "height": 1072,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/stop-6/layer-1.webp",
          "width": 1920,
          "height": 545,
          "x": -0.017,
          "y": 0.024,
          "w": 99.988,
          "h": 50.871,
          "depth": 0.2,
          "drift": 0
        },
        {
          "src": "/journey/stop-6/layer-2.webp",
          "width": 1875,
          "height": 796,
          "x": 2.324,
          "y": -0.008,
          "w": 97.673,
          "h": 74.283,
          "depth": 0.65,
          "drift": 0
        },
        {
          "src": "/journey/stop-6/layer-3.webp",
          "width": 1920,
          "height": 857,
          "x": -0.005,
          "y": 20.06,
          "w": 100.002,
          "h": 79.936,
          "depth": 1.1,
          "drift": 0
        }
      ]
    },
    {
      "number": "07",
      "name": "What We’re Building",
      "line": "A future where every person has the resources, dignity and real opportunity to thrive, no matter their zip code, income or immigration status.",
      "focus": [
        50,
        42
      ],
      "zoom": [
        1,
        1.1
      ],
      "phonePan": [
        16,
        86
      ],
      "anchorY": 0.5,
      "shadow": "teal",
      "longLine": true,
      "captionTop": false,
      "alt": "Neighbors of different races and jobs wave to each other as they leave side-by-side homes with their children in the morning: a lawyer, a doctor, a grocery worker, a teacher and a contractor.",
      "flat": {
        "src": "/journey/flat/stop-7.webp",
        "width": 1920,
        "height": 1072
      },
      "layers": [
        {
          "src": "/journey/stop-7/back.webp",
          "width": 1920,
          "height": 1072,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/stop-7/layer-1.webp",
          "width": 1920,
          "height": 520,
          "x": -0.006,
          "y": 0.004,
          "w": 99.976,
          "h": 48.549,
          "depth": 0.2,
          "drift": 0
        },
        {
          "src": "/journey/stop-7/layer-2.webp",
          "width": 1767,
          "height": 692,
          "x": -0.003,
          "y": 5.845,
          "w": 92.052,
          "h": 64.534,
          "depth": 0.65,
          "drift": 0
        },
        {
          "src": "/journey/stop-7/layer-3.webp",
          "width": 1920,
          "height": 637,
          "x": -0.0,
          "y": 40.578,
          "w": 100.001,
          "h": 59.415,
          "depth": 1.1,
          "drift": 0
        }
      ]
    },
    {
      "number": "08",
      "name": "Systemic Equity",
      "line": "Every stretch of this road gets built by people who show up.",
      "focus": [
        47,
        72
      ],
      "zoom": [
        1,
        1.06
      ],
      "phonePan": [
        34,
        58
      ],
      "anchorY": 0,
      "shadow": "yellow",
      "longLine": false,
      "captionTop": true,
      "alt": "At dusk, people of every age line the teal road holding glowing lanterns beneath a faint Lady Justice. A little girl holds a lantern out toward the viewer.",
      "flat": {
        "src": "/journey/flat/stop-8.webp",
        "width": 1920,
        "height": 1072
      },
      "layers": [
        {
          "src": "/journey/stop-8/back.webp",
          "width": 1920,
          "height": 1072,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/stop-8/layer-1.webp",
          "width": 1920,
          "height": 767,
          "x": 0.0,
          "y": 28.385,
          "w": 100.0,
          "h": 71.549,
          "depth": 0.65,
          "drift": 0
        },
        {
          "src": "/journey/stop-8/layer-2.webp",
          "width": 1923,
          "height": 315,
          "x": -0.085,
          "y": 0.043,
          "w": 100.146,
          "h": 29.378,
          "depth": 0.2,
          "drift": 0
        },
        {
          "src": "/journey/stop-8/layer-3.webp",
          "width": 1762,
          "height": 836,
          "x": 4.43,
          "y": 22.006,
          "w": 91.759,
          "h": 78.001,
          "depth": 1.1,
          "drift": 0
        }
      ]
    }
  ]
}
