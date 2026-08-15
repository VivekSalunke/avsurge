import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mobile & Tech Glossary — Phone, Tablet & Laptop Terms Explained | AVSurge',
  alternates: { canonical: 'https://avsurge.com/glossary' },
  description: 'A plain-English glossary of phone, tablet, and laptop specification terms — display, camera, performance, battery, and connectivity explained.',
  robots: 'index, follow',
}

interface GlossaryEntry {
  term: string
  definition: string
}

interface GlossarySection {
  letter: string
  entries: GlossaryEntry[]
}

const GLOSSARY: GlossarySection[] = [
  {
    letter: 'A',
    entries: [
      { term: 'AMOLED', definition: 'A display type where each pixel emits its own light, allowing true blacks and high contrast. Common in mid-range and flagship phones.' },
      { term: 'AnTuTu', definition: 'A popular benchmarking app that produces a single score representing a device\u2019s overall performance across CPU, GPU, and memory.' },
      { term: 'Aperture (f/number)', definition: 'Describes how much light a camera lens lets in. A lower f-number (like f/1.8) lets in more light, which helps in low-light photography.' },
      { term: 'AI NPU (Neural Processing Unit)', definition: 'A dedicated chip component built to accelerate AI and machine-learning tasks like camera scene detection, voice processing, and on-device translation.' },
    ],
  },
  {
    letter: 'B',
    entries: [
      { term: 'Bezel', definition: 'The border of unused screen area around a display\u2019s edges. Thinner bezels generally mean a higher screen-to-body ratio.' },
      { term: 'Bluetooth', definition: 'A short-range wireless standard used for connecting headphones, smartwatches, and other accessories. Newer versions (5.2, 5.3) offer better range and lower power use.' },
    ],
  },
  {
    letter: 'C',
    entries: [
      { term: 'Chipset (SoC)', definition: 'Short for System on Chip — the main processor that combines the CPU, GPU, and other components on a single chip. It\u2019s the biggest factor in a device\u2019s overall performance.' },
      { term: 'CPU Cores', definition: 'The number of independent processing units inside a chipset. More cores can help with multitasking, but core speed and efficiency matter just as much as core count.' },
    ],
  },
  {
    letter: 'D',
    entries: [
      { term: 'Dolby Vision', definition: 'A premium HDR video format that dynamically adjusts brightness and color scene-by-scene for a more realistic picture, mostly relevant on higher-end phone and tablet displays.' },
      { term: 'DDR RAM (LPDDR4X / LPDDR5)', definition: 'The type and generation of memory a device uses. Newer generations (LPDDR5, LPDDR5X) are faster and more power-efficient than older ones.' },
    ],
  },
  {
    letter: 'E',
    entries: [
      { term: 'eSIM', definition: 'A digital SIM built into the device that can be activated without a physical SIM card, often used alongside or instead of a traditional SIM slot.' },
    ],
  },
  {
    letter: 'F',
    entries: [
      { term: 'Fast Charging (Wattage)', definition: 'The maximum charging speed a device supports, measured in watts (W). Higher wattage generally means less time spent charging, though actual speed also depends on the charger and cable.' },
      { term: 'Fingerprint Sensor (In-display vs. Side-mounted)', definition: 'In-display sensors sit under the screen itself, while side-mounted sensors are built into the power button. Both are common; in-display tends to appear on higher-end devices.' },
    ],
  },
  {
    letter: 'G',
    entries: [
      { term: 'Gorilla Glass', definition: 'A brand of toughened glass from Corning used to protect phone and tablet screens from scratches and drops. Newer versions (Victus, Victus 2) offer better drop resistance.' },
      { term: 'GPU (Graphics Processing Unit)', definition: 'The component responsible for rendering graphics, most relevant for gaming performance and smooth UI animations.' },
    ],
  },
  {
    letter: 'H',
    entries: [
      { term: 'HDR (High Dynamic Range)', definition: 'A display and video feature that expands the range between the darkest and brightest parts of an image, resulting in more realistic contrast and color.' },
      { term: 'Hertz (Hz) / Refresh Rate', definition: 'How many times per second a display refreshes its image. Higher refresh rates (90Hz, 120Hz) make scrolling and animations look noticeably smoother than standard 60Hz.' },
    ],
  },
  {
    letter: 'I',
    entries: [
      { term: 'IP Rating', definition: 'A standardized rating (like IP68) for dust and water resistance. The first digit rates dust protection (0\u20136), the second rates water protection (0\u20139).' },
      { term: 'IPS LCD', definition: 'A common LCD display technology known for good color accuracy and viewing angles, though it typically can\u2019t produce true blacks like AMOLED can.' },
      { term: 'ISP (Image Signal Processor)', definition: 'A specialized part of the chipset that processes raw camera sensor data into a finished photo — it plays a large role in a phone\u2019s actual camera quality, beyond just megapixels.' },
    ],
  },
  {
    letter: 'M',
    entries: [
      { term: 'mAh (Milliamp Hour)', definition: 'The unit used to measure battery capacity. A higher mAh figure generally means longer battery life, though actual usage time also depends on the chipset, display, and software efficiency.' },
      { term: 'MicroSD Card Slot', definition: 'A slot that lets you expand a device\u2019s storage using a removable memory card — increasingly rare on flagship phones but still common on budget devices and tablets.' },
      { term: 'Megapixel (MP)', definition: 'A measure of camera resolution — the number of pixels a sensor captures. Higher megapixels don\u2019t automatically mean better photos; sensor size and image processing matter just as much.' },
    ],
  },
  {
    letter: 'N',
    entries: [
      { term: 'NFC (Near-Field Communication)', definition: 'A short-range wireless technology used for contactless payments, quick pairing with accessories, and tap-to-share features.' },
      { term: 'Notch', definition: 'A cutout at the top of a display that houses the front camera and sensors, an older alternative to the punch-hole design.' },
    ],
  },
  {
    letter: 'O',
    entries: [
      { term: 'OIS (Optical Image Stabilization)', definition: 'A physical stabilization mechanism inside the camera module that reduces blur from hand shake, especially useful in low light and video recording.' },
      { term: 'OLED', definition: 'A display technology where each pixel produces its own light independently, enabling true blacks, high contrast, and thinner panels compared to LCD.' },
    ],
  },
  {
    letter: 'P',
    entries: [
      { term: 'PPI (Pixels Per Inch)', definition: 'A measure of display sharpness — how densely packed the pixels are. Higher PPI generally means a crisper image, especially noticeable up close.' },
      { term: 'Punch-hole Display', definition: 'A display design where the front camera sits inside a small circular cutout within the screen itself, rather than in a notch or bezel.' },
      { term: 'PWM Dimming', definition: 'A method some displays use to control brightness by rapidly flickering the screen on and off. At low brightness, this can cause eye strain for some people; higher PWM frequencies are generally easier on the eyes.' },
    ],
  },
  {
    letter: 'R',
    entries: [
      { term: 'RAM (Random Access Memory)', definition: 'Temporary memory used to run apps and multitask. More RAM generally allows more apps to stay open in the background without reloading.' },
      { term: 'Resolution', definition: 'The number of pixels a display or camera can show or capture, usually written as width x height (e.g. 1080x2400).' },
    ],
  },
  {
    letter: 'S',
    entries: [
      { term: 'SAR Value', definition: 'A measurement of the radio frequency energy absorbed by the body when using a phone. Regulatory bodies set maximum allowed limits that all sold devices must meet.' },
      { term: 'SSD (Solid State Drive)', definition: 'A fast, flash-based storage type used in most modern laptops, replacing traditional spinning hard drives (HDDs) for quicker boot times and file access.' },
    ],
  },
  {
    letter: 'T',
    entries: [
      { term: 'Thunderbolt', definition: 'A high-speed data and display connection standard, mostly found on premium laptops, capable of much faster transfer speeds than standard USB.' },
      { term: 'TFT', definition: 'An older, more budget-friendly LCD display technology, typically found on entry-level devices, with lower color accuracy and viewing angles than IPS LCD.' },
    ],
  },
  {
    letter: 'U',
    entries: [
      { term: 'USB-C', definition: 'A reversible, widely-adopted port standard used for charging and data transfer on most modern phones, tablets, and laptops.' },
    ],
  },
  {
    letter: 'V',
    entries: [
      { term: 'VRR (Variable Refresh Rate)', definition: 'A display feature that adjusts the refresh rate dynamically based on content, helping save battery during static screens while still allowing smooth motion when needed.' },
    ],
  },
  {
    letter: 'W',
    entries: [
      { term: 'Wi-Fi 6 / Wi-Fi 6E', definition: 'Newer Wi-Fi standards that offer faster speeds and better performance in crowded networks compared to older Wi-Fi 5 devices.' },
    ],
  },
]

export default function GlossaryPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-[var(--text)]">
      <div className="text-sm text-[rgba(255,255,255,0.4)] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-neon-cyan">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-[rgba(255,255,255,0.65)]">Glossary</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Mobile &amp; Tech Glossary</h1>
      <p className="text-dim leading-relaxed mb-8">
        Confused by a spec on a device page? Here&apos;s a plain-English explanation of the most common terms you&apos;ll come across when comparing phones, tablets, and laptops on AVSurge.
      </p>

      <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-[rgba(255,255,255,0.04)]">
        {GLOSSARY.map(section => (
          
            <a
              key={section.letter}
            href={`#${section.letter}`}
            className="w-8 h-8 flex items-center justify-center text-sm font-medium text-neon-cyan bg-[rgba(6,182,212,0.06)] rounded-lg hover:bg-[rgba(6,182,212,0.1)] hover:text-white transition"
          >
            {section.letter}
          </a>
        ))}
      </div>

      <div className="space-y-10">
        {GLOSSARY.map(section => (
          <section key={section.letter} id={section.letter} className="scroll-mt-20">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-[rgba(255,255,255,0.04)]">
              {section.letter}
            </h2>
            <dl className="space-y-5">
              {section.entries.map(entry => (
                <div key={entry.term}>
                  <dt className="font-semibold text-white text-sm mb-1">{entry.term}</dt>
                  <dd className="text-[rgba(255,255,255,0.65)] text-sm leading-relaxed">{entry.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="mt-12 pt-6 border-t border-[rgba(255,255,255,0.04)] text-sm text-[rgba(255,255,255,0.4)]">
        Missing a term you think should be here?{' '}
        <Link href="/contact" className="text-neon-cyan hover:underline">Let us know</Link>.
      </p>
    </main>
  )
}
