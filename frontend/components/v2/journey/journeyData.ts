// Generated from journey-photo-collage/assets/journey.json (copy, camera, layer positions and alt text)
// with each image's pixel size. Layers are listed back to front; x, y, w and h are percentages
// of the artboard. The image files live in public/journey/v2: the folder name is the version,
// so a new set of artwork gets a new folder and browsers never show a stale picture.

export type JourneyImage = {src: string; width: number; height: number}
export type JourneyLayer = JourneyImage & {x: number; y: number; w: number; h: number; depth: number; drift: number}
/** A later moment of the same stop: one full-frame image that the stop's layers cross-fade into. */
export type JourneySecondScene = {
  image: JourneyImage
  alt: string
  /** Where in the stop's progress (0 to 1) the cross-fade starts and ends. */
  fadeStart: number
  fadeEnd: number
}
export type JourneyStop = {
  number: string
  name: string
  line: string
  focus: [number, number]
  zoom: [number, number]
  phonePan: [number, number]
  shadow: 'teal' | 'yellow' | 'fuchsia'
  longLine: boolean
  captionTop: boolean
  /** On the front layer; the other layers are decorative. */
  alt: string
  /** The flat image, used with reduced motion. */
  flat: JourneyImage
  layers: JourneyLayer[]
  secondScene?: JourneySecondScene
}

export type Journey = {
  title: string
  eyebrow: string
  scrollCue: string
  endingEyebrow: string
  ending: string
  /** A tiny blurred copy of stop 1, shown until its images are ready. */
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
  "placeholder": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAAAAAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAbADADASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAABAYCAwUHAf/EAC4QAAIBAwICCAYDAAAAAAAAAAECAwAEEQUhEhMGFBUxQVFhkRYiMkJx8SNDgf/EABcBAQEBAQAAAAAAAAAAAAAAAAIDAAH/xAAhEQACAgEDBQEAAAAAAAAAAAABAgARAxMhMRIiMnGB8P/aAAwDAQACEQMRAD8AZbzVb+z1CSMiB4Wm5cYzhvp4se2aJh1lWOJo2iYAMdwcA0nao013qxa547d3l5qxt9uEwfDb5fH1oZoIi4bmiQuAjYbI4QDv7Ctp1zUIzdXiD+9zoE2q20MJkaUEAgbd+/pU7S+W6iLxlcg4YA5wf1SBBb9YwyRDBzgkbDyH6o9dLZI4hFcojk/yAJhWPpvtRIEoCTzHM3O5HNiGO/5hmq4b6JrxYWuYi77KgYEmk3s9Y8SySTXcZmL7xD5B4L6AVHolKj6paNLMZJA7JxKAqnY4yABg4oKyutrHRBozzXI5viPUWMaCN8qru3mgGQKCiWCIAqnNkH3ONh+B3Vs9MMLqwCqozGGJCgEn1Pj3UxaRpdh2XbObSJmdAzFlyST+atQVQxl9EIgdt74iisvDhmkBYZ4mJwAPIUcsNwzRNDEzY+ry7+6mzsvTwMCygGDn6BV3V4R/WvtUMjZCOyvsjsTbRAue0ZdNu5LSDmqsrjDy8vAUnJBBznOTvWb0CQSa+YHuFZ1Imyu4JXw9ia6V2VYNFLbtao0M5JkQ7hs7mpQadZW3B1e0gi5WeDgQDhyMHH+UcYZAROlrYET/2Q==",
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
      "shadow": "teal",
      "longLine": false,
      "captionTop": false,
      "alt": "A mother kneels to talk with her young daughter in a yellow raincoat on a cracked road while people with briefcases walk a raised glass walkway toward distant towers.",
      "flat": {
        "src": "/journey/v2/flat/stop-1.webp",
        "width": 2752,
        "height": 1536
      },
      "layers": [
        {
          "src": "/journey/v2/flat/stop-1.webp",
          "width": 2752,
          "height": 1536,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 1,
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
        50
      ],
      "zoom": [
        1,
        1.1
      ],
      "phonePan": [
        25,
        72
      ],
      "shadow": "yellow",
      "longLine": true,
      "captionTop": false,
      "alt": "On a broken road an older neighbor and a mother help a little girl in a yellow raincoat cross a hole on a rope net while two children hold the net steady.",
      "flat": {
        "src": "/journey/v2/flat/stop-2.webp",
        "width": 2752,
        "height": 1536
      },
      "layers": [
        {
          "src": "/journey/v2/flat/stop-2.webp",
          "width": 2752,
          "height": 1536,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 1,
          "drift": 0
        }
      ]
    },
    {
      "number": "03",
      "name": "Changing What We Value",
      "line": "Our society continues to protect and prioritize some lives over others.",
      "focus": [
        50,
        55
      ],
      "zoom": [
        1,
        1.1
      ],
      "phonePan": [
        18,
        72
      ],
      "shadow": "fuchsia",
      "longLine": false,
      "captionTop": true,
      "alt": "Marchers fill a city street behind a long black banner reading BLACK LIVES MATTER. They carry candles and sunflowers and signs reading I CAN'T BREATHE, IT COULD HAVE BEEN MY SON and ICE OUT, along with raised-fist signs.",
      "flat": {
        "src": "/journey/v2/flat/stop-3.webp",
        "width": 2752,
        "height": 1536
      },
      "layers": [
        {
          "src": "/journey/v2/flat/stop-3.webp",
          "width": 2752,
          "height": 1536,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 1,
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
      "shadow": "yellow",
      "longLine": false,
      "captionTop": false,
      "alt": "On a rainy road a woman in a yellow raincoat speaks through a megaphone. Neighbors hold sunflowers and signs reading CARE CAN'T WAIT, HOUSING IS A RIGHT, FUND OUR SCHOOLS, LIVING WAGES NOW and KEEP FAMILIES TOGETHER. A woman in a wheelchair holds up an I Voted sign and two hands pass a petition toward the viewer.",
      "flat": {
        "src": "/journey/v2/flat/stop-4.webp",
        "width": 2752,
        "height": 1536
      },
      "layers": [
        {
          "src": "/journey/v2/flat/stop-4.webp",
          "width": 2752,
          "height": 1536,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 1,
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
      "shadow": "teal",
      "longLine": false,
      "captionTop": false,
      "alt": "A line of voters of every age waits along a brick building beside a VOTE HERE sign as a hand drops a ballot into a clear box.",
      "flat": {
        "src": "/journey/v2/flat/stop-5.webp",
        "width": 2752,
        "height": 1536
      },
      "layers": [
        {
          "src": "/journey/v2/flat/stop-5.webp",
          "width": 2752,
          "height": 1536,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 1,
          "drift": 0
        }
      ]
    },
    {
      "number": "06",
      "name": "Rewriting the Rules",
      "line": "Together we can rewrite the rules that shape our lives.",
      "focus": [
        68,
        62
      ],
      "zoom": [
        1,
        1.12
      ],
      "phonePan": [
        24,
        80
      ],
      "shadow": "fuchsia",
      "longLine": false,
      "captionTop": false,
      "alt": "Under a blue sky people ride an escalator through open glass doors marked with the scales of justice up to a raised walkway. At the bottom a woman in teal greets an older neighbor.",
      "flat": {
        "src": "/journey/v2/flat/stop-6.webp",
        "width": 2752,
        "height": 1536
      },
      "layers": [
        {
          "src": "/journey/v2/stop-6/back.webp",
          "width": 2752,
          "height": 1536,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/v2/stop-6/front.webp",
          "width": 1214,
          "height": 861,
          "x": 55.887,
          "y": 43.945,
          "w": 44.113,
          "h": 56.055,
          "depth": 1.15,
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
        62
      ],
      "zoom": [
        1,
        1.12
      ],
      "phonePan": [
        16,
        86
      ],
      "shadow": "teal",
      "longLine": true,
      "captionTop": false,
      "alt": "On a sunny street of small homes neighbors head out for the day: a lawyer, a teacher with books, a doctor, a grocery worker, a schoolboy and a construction worker.",
      "flat": {
        "src": "/journey/v2/flat/stop-7.webp",
        "width": 2752,
        "height": 1536
      },
      "layers": [
        {
          "src": "/journey/v2/stop-7/back.webp",
          "width": 2752,
          "height": 1536,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/v2/stop-7/front.webp",
          "width": 2309,
          "height": 816,
          "x": 10.102,
          "y": 33.659,
          "w": 83.903,
          "h": 53.125,
          "depth": 1.15,
          "drift": 0
        }
      ],
      "secondScene": {
        "image": {
          "src": "/journey/v2/stop-7/second-scene.webp",
          "width": 2752,
          "height": 1536
        },
        "alt": "The same street a moment later: a woman kneels to bump fists with a schoolboy, an elder takes a neighbor's hands at her door and two workers carry a ladder past flower boxes.",
        "fadeStart": 0.5,
        "fadeEnd": 0.72
      }
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
        1.14
      ],
      "phonePan": [
        34,
        58
      ],
      "shadow": "yellow",
      "longLine": false,
      "captionTop": false,
      "alt": "At dawn neighbors with glowing lanterns line a teal road toward the sunrise beneath a faint Lady Justice. A mother and her daughter walk up the road hand in hand and the daughter looks back over her shoulder.",
      "flat": {
        "src": "/journey/v2/flat/stop-8.webp",
        "width": 2752,
        "height": 1536
      },
      "layers": [
        {
          "src": "/journey/v2/stop-8/back.webp",
          "width": 2752,
          "height": 1536,
          "x": 0,
          "y": 0,
          "w": 100,
          "h": 100,
          "depth": 0.4,
          "drift": 0
        },
        {
          "src": "/journey/v2/stop-8/front.webp",
          "width": 2625,
          "height": 970,
          "x": 3.27,
          "y": 29.492,
          "w": 95.385,
          "h": 63.151,
          "depth": 1.15,
          "drift": 0
        }
      ]
    }
  ]
}
