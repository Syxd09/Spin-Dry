export type ServiceFaq = { q: string; a: string };

export type Service = {
  slug: string;
  name: string;
  category: "Home Fabrics" | "Bedding & Linen" | "Upholstery" | "Commercial";
  summary: string;
  intro: string;
  turnaround: string;
  includes: string[];
  materials: string[];
  benefits: string[];
  process: { title: string; body: string }[];
  faqs: ServiceFaq[];
  image?: string;
  prices?: { name: string; prices: Record<string, string> }[];
};

const p = (
  a: string,
  b: string,
  c: string,
  d: string,
): { title: string; body: string }[] => [
  { title: "Inspection & tagging", body: a },
  { title: "Pre-treatment", body: b },
  { title: "Professional cleaning", body: c },
  { title: "Drying, finishing & QC", body: d },
];

export const services: Service[] = [
  {
    slug: "curtain-cleaning",
    name: "Curtain Cleaning",
    category: "Home Fabrics",
    summary:
      "Take-down, professional cleaning and re-hanging of drapes, sheers and blackout curtains without shrinkage or pleat loss.",
    intro:
      "Curtains hold more airborne dust than any other fabric in a room, yet they are the most easily damaged by the wrong cleaning method. We measure each panel before and after processing, treat linings and face fabrics according to their fibre, and return the drape hanging exactly as it did before.",
    turnaround: "72 hours standard",
    includes: [
      "Take-down from rails, tracks and eyelet rods",
      "Hook, ring and weight removal and refitting",
      "Separate handling of lining and face fabric",
      "Dust and allergen extraction before washing",
      "Steam finishing and pleat reforming",
      "Re-hanging at your home on delivery",
    ],
    materials: [
      "Cotton and cotton blends",
      "Polyester and sheer voile",
      "Linen and linen blends",
      "Velvet and jacquard drapes",
      "Blackout and thermal linings",
      "Eyelet, pinch-pleat and pencil-pleat headings",
    ],
    benefits: [
      "Removes embedded dust, pollen and cooking residue",
      "Restores drape and colour depth",
      "Controlled process guards against shrinkage",
      "No ladder work or refitting for you",
      "Extends the life of expensive window treatments",
    ],
    process: p(
      "Every panel is measured, photographed and tagged by room, with lining type and heading style recorded.",
      "Dust is extracted dry first, then hems, leading edges and sun-damaged areas receive targeted pre-treatment.",
      "Panels run on a low-agitation, fibre-matched programme with temperature and detergent chemistry set to the lining.",
      "Controlled drying to the recorded measurement, steam finishing, pleat reforming and a final light-box inspection.",
    ),
    faqs: [
      {
        q: "Will my curtains shrink?",
        a: "Each panel is measured before processing and dried to that recorded length under controlled temperature. Shrinkage risk is assessed at inspection, and if a lining cannot be cleaned safely we tell you before proceeding.",
      },
      {
        q: "Do you take the curtains down and re-hang them?",
        a: "Yes. Take-down at pickup and re-hanging at delivery are included within the 10 km service radius, including hooks, rings and weights.",
      },
      {
        q: "How often should curtains be cleaned?",
        a: "Every 6 to 12 months for most homes, and every 3 to 6 months for kitchens, ground-floor rooms on busy roads, or homes with pets or allergy sufferers.",
      },
    ],
  },
  {
    slug: "carpet-cleaning",
    name: "Carpet Cleaning",
    category: "Home Fabrics",
    summary:
      "Deep extraction cleaning for rugs and wall-to-wall carpet, with pile restoration and controlled drying.",
    intro:
      "Carpet holds grit deep in the pile that grinds fibres apart every time it is walked on. Our process removes that dry soil first, then lifts oils and stains with a fibre-matched chemistry, so the pile stands up again instead of matting flat.",
    turnaround: "72 hours standard",
    includes: [
      "Dry soil and grit extraction",
      "Fibre and colour-fastness testing",
      "Targeted stain and traffic-lane treatment",
      "Deep extraction cleaning",
      "Pile grooming and restoration",
      "Controlled drying and deodorising",
    ],
    materials: [
      "Wool and wool-blend rugs",
      "Synthetic pile and machine-made carpet",
      "Hand-knotted and hand-tufted rugs",
      "Jute, sisal and natural fibre mats",
      "Shag and high-pile carpet",
      "Runners and area rugs",
    ],
    benefits: [
      "Removes abrasive grit that shortens carpet life",
      "Lifts traffic lanes and dulled patches",
      "Reduces dust mites and trapped allergens",
      "Neutralises pet and damp odours",
      "Restores pile height and colour",
    ],
    process: p(
      "Fibre type, backing, dye stability and damage are recorded, and a colour-fastness test is run on a hidden section.",
      "Grit is extracted dry, then traffic lanes, spills and pet areas receive individual pre-spray treatment.",
      "Deep extraction with fibre-appropriate chemistry and controlled water volume, adjusted for wool versus synthetic pile.",
      "Rapid airflow drying, pile grooming to the correct direction, deodorising and a final inspection against the intake photos.",
    ),
    faqs: [
      {
        q: "Will every stain come out?",
        a: "No cleaner can promise that. Dye stains, bleach damage and long-set organic stains may be permanent. We assess your carpet at inspection and tell you exactly what will lift before you approve the quote.",
      },
      {
        q: "How long does the carpet take to dry?",
        a: "Carpets are dried at our studio under controlled airflow and returned dry, so there is no waiting or damp smell in your home.",
      },
      {
        q: "Can you clean wall-to-wall carpet on site?",
        a: "Yes, on-site deep extraction is available for fitted carpet. Book a consultation and we will schedule a site visit within the service area.",
      },
    ],
  },
  {
    slug: "blanket-cleaning",
    name: "Blanket Cleaning",
    category: "Bedding & Linen",
    summary:
      "Large-capacity washing for wool, fleece and mink blankets that restores softness without felting or pilling.",
    intro:
      "Domestic machines are too small to move a blanket freely, which is what causes felting, pilling and detergent residue. Our large-drum equipment lets the fabric circulate fully, so the fibres rinse clean and dry evenly.",
    turnaround: "48 hours standard",
    includes: [
      "Fibre identification and stain check",
      "Large-drum, low-agitation washing",
      "Hypoallergenic detergent options",
      "Full rinse cycle to remove residue",
      "Controlled temperature drying",
      "Folded delivery in breathable packaging",
    ],
    materials: [
      "Wool and merino blankets",
      "Fleece and polar fleece",
      "Mink and faux-fur blankets",
      "Cotton throws and dohars",
      "Acrylic and blended blankets",
      "Electric blanket covers (element removed)",
    ],
    benefits: [
      "Restores loft and softness",
      "Removes dust mites and body oils",
      "Prevents felting and pilling",
      "No detergent residue against your skin",
      "Neutral, non-perfumed finish available",
    ],
    process: p(
      "Fibre content, trims and binding are checked, and any thinning or existing damage is photographed.",
      "Stains and collar-edge soil are pre-treated by hand with a chemistry safe for the fibre.",
      "Washed in large-capacity drums at a temperature and speed matched to the fibre, with an extended rinse.",
      "Dried at a controlled temperature to protect loft, then brushed, inspected and folded into breathable covers.",
    ),
    faqs: [
      {
        q: "Can you clean wool blankets safely?",
        a: "Yes. Wool runs on a low-temperature, low-agitation programme with a wool-safe detergent and controlled drying to avoid felting.",
      },
      {
        q: "Will the blanket smell of perfume?",
        a: "Only if you want it to. We offer a neutral, fragrance-free finish for sensitive skin and infants.",
      },
      {
        q: "How often should blankets be cleaned?",
        a: "Twice a year for regular-use blankets, and before and after seasonal storage for winter bedding.",
      },
    ],
  },
  {
    slug: "sofa-cover-cleaning",
    name: "Sofa Cover Cleaning",
    category: "Upholstery",
    summary:
      "Removable upholstery covers cleaned, shape-controlled and refitted to your furniture on delivery.",
    intro:
      "A sofa cover that shrinks by even two percent will never fit the frame again. We treat covers as tailored pieces: measured, cleaned to fibre, dried to size, pressed and refitted onto the cushions for you.",
    turnaround: "72 hours standard",
    includes: [
      "Cover removal and cushion tagging",
      "Measurement recording per panel",
      "Zip, piping and trim protection",
      "Fibre-matched cleaning programme",
      "Press finishing to remove creasing",
      "Refitting onto cushions on delivery",
    ],
    materials: [
      "Cotton and cotton-linen covers",
      "Polyester and microfibre",
      "Chenille and jacquard weaves",
      "Velvet covers",
      "Slipcovers and loose covers",
      "Cushion and bolster covers",
    ],
    benefits: [
      "Removes body oils, food residue and pet hair",
      "Restores colour on sun-faded panels",
      "Shape and size controlled through drying",
      "No struggle refitting covers yourself",
      "Refreshes a room without reupholstering",
    ],
    process: p(
      "Each panel is labelled by seat and back position, measured and photographed with zips and piping noted.",
      "Headrest oils, armrest soil and spills are pre-treated individually before the wash.",
      "Cleaned on a low-agitation programme with chemistry set to the fibre and the trim materials.",
      "Dried to the recorded measurement, press finished, refitted checked against the photos and packed flat.",
    ),
    faqs: [
      {
        q: "Do you refit the covers?",
        a: "Yes. Our delivery team refits the covers onto the cushions and frame at your home within the service area.",
      },
      {
        q: "What if my covers are not removable?",
        a: "Fixed upholstery is handled through our on-site fabric care visit. Book a consultation and we will assess the piece at your home.",
      },
      {
        q: "Can velvet covers be cleaned?",
        a: "Yes. Velvet is processed with a dedicated low-friction programme and pile-safe finishing to avoid crushing the nap.",
      },
    ],
  },
  {
    slug: "bedsheet-cleaning",
    name: "Bedsheet Cleaning",
    category: "Bedding & Linen",
    summary:
      "Hotel-standard laundering, press finishing and folding for everyday and premium bed linen.",
    intro:
      "Bed linen is the fabric your skin spends a third of its life against. We wash at hygienic temperatures, rinse detergent out completely and press-finish every sheet so it goes back on the bed crisp and flat.",
    turnaround: "48 hours standard",
    includes: [
      "Sorting by colour, fibre and soil level",
      "Hygienic temperature laundering",
      "Stain pre-treatment on collars and hems",
      "Full residue rinse",
      "Roller press finishing",
      "Set-matched folding and packing",
    ],
    materials: [
      "Cotton and cotton percale",
      "Sateen and high thread count cotton",
      "Linen sheets",
      "Poly-cotton blends",
      "Fitted sheets with elastic",
      "Pillowcases and bolster covers",
    ],
    benefits: [
      "Crisp, press-finished, ready to use",
      "Removes body oils and dust mites",
      "Whites kept white without harsh bleaching",
      "Sets kept together and labelled",
      "Hypoallergenic detergent on request",
    ],
    process: p(
      "Sets are counted, matched and tagged, with fibre, colour and any existing damage recorded.",
      "Hem lines, body-oil zones and spot stains are pre-treated before the wash.",
      "Laundered at hygienic temperature with a colour-safe programme and an extended rinse.",
      "Dried, roller press finished, folded as matched sets and packed in breathable covers.",
    ),
    faqs: [
      {
        q: "Do you iron the sheets?",
        a: "Yes, sheets are roller press finished, which gives a flatter and more even result than domestic ironing.",
      },
      {
        q: "Will white linen be bleached?",
        a: "We use an oxygen-based brightening process rather than harsh chlorine bleach, which keeps whites bright without weakening the fibre.",
      },
      {
        q: "Can you handle a weekly household schedule?",
        a: "Yes. Recurring weekly or fortnightly collection slots can be arranged for households inside the 10 km radius.",
      },
    ],
  },
  {
    slug: "comforter-cleaning",
    name: "Comforter Cleaning",
    category: "Bedding & Linen",
    summary:
      "Deep cleaning for comforters with full-loft drying that keeps the filling evenly distributed.",
    intro:
      "The hard part of a comforter is not washing it, it is drying it. Wet filling clumps and stays damp inside, which is where odour and mildew start. We dry to core dryness with loft restoration so the fill sits evenly again.",
    turnaround: "72 hours standard",
    includes: [
      "Fill type and baffle construction check",
      "Seam and stitching inspection",
      "Large-drum washing",
      "Core-dry moisture verification",
      "Loft restoration and fill redistribution",
      "Breathable storage bag included",
    ],
    materials: [
      "Microfibre and polyester fill",
      "Down and feather fill",
      "Down-alternative comforters",
      "Cotton-shell comforters",
      "Silk-fill comforters",
      "King, queen and single sizes",
    ],
    benefits: [
      "Removes body oils, sweat and dust mites",
      "Restores loft and warmth",
      "No damp core or mildew odour",
      "Even fill distribution after drying",
      "Ready for seasonal storage",
    ],
    process: p(
      "Fill type, baffle box construction and seam condition are recorded, and weak stitching is flagged before washing.",
      "Perspiration zones and spot stains receive pre-treatment appropriate to the shell fabric.",
      "Washed in a large drum that lets the comforter move freely, with a detergent matched to down or synthetic fill.",
      "Dried to verified core dryness, agitated to redistribute fill, inspected for clumping and packed in a breathable bag.",
    ),
    faqs: [
      {
        q: "Can you clean down comforters?",
        a: "Yes. Down runs on a dedicated down-safe programme with a low-alkaline detergent and extended loft drying.",
      },
      {
        q: "How often should a comforter be cleaned?",
        a: "Two to three times a year with regular use, plus once before long-term seasonal storage.",
      },
      {
        q: "What if the fill has already clumped?",
        a: "In most cases washing and loft drying redistributes it. If the baffles are torn, we tell you at inspection because cleaning alone will not fix it.",
      },
    ],
  },
  {
    slug: "duvet-cleaning",
    name: "Duvet Cleaning",
    category: "Bedding & Linen",
    summary:
      "Duvets and duvet covers cleaned separately, dried to core and finished ready to re-dress the bed.",
    intro:
      "Duvets and their covers need different treatment: the cover is a laundered textile, the inner is a filled item that needs volume drying. We process them separately and return them as a matched, ready-to-dress set.",
    turnaround: "72 hours standard",
    includes: [
      "Separate handling of inner and cover",
      "Tog rating and fill type recorded",
      "Large-drum washing",
      "Core-dry verification for the inner",
      "Press finishing for the cover",
      "Matched set packing",
    ],
    materials: [
      "Down and feather duvets",
      "Microfibre and hollowfibre duvets",
      "Cotton and sateen covers",
      "Linen duvet covers",
      "Silk-blend duvets",
      "All tog ratings and sizes",
    ],
    benefits: [
      "Hygienic removal of mites and body oils",
      "Loft and warmth restored",
      "Cover returned press finished",
      "Inner and cover stay as a set",
      "Storage-ready packaging",
    ],
    process: p(
      "Inner and cover are separated, matched by tag, and fill type, tog and seam condition are recorded.",
      "Cover stains are pre-treated; the inner has perspiration zones treated with a fill-safe chemistry.",
      "The inner is washed in a large drum; the cover is laundered on a fibre-matched linen programme.",
      "Inner dried to verified core dryness with loft restoration, cover press finished, both reunited and packed.",
    ),
    faqs: [
      {
        q: "Should the cover come with the duvet?",
        a: "Yes, send both. We clean them separately and return them as a matched set, ready to re-dress the bed.",
      },
      {
        q: "Will washing reduce the tog rating?",
        a: "Not when the duvet is dried correctly. Loss of warmth comes from flattened, unevenly dried fill, which our loft drying stage prevents.",
      },
      {
        q: "Do you clean silk-filled duvets?",
        a: "Yes, on a dedicated gentle programme. Silk fill is inspected first because some manufacturers restrict full immersion washing.",
      },
    ],
  },
  {
    slug: "pillow-cleaning",
    name: "Pillow Cleaning",
    category: "Bedding & Linen",
    summary:
      "Sanitising wash and full-loft drying for pillows, with an honest assessment of which ones are worth keeping.",
    intro:
      "A used pillow carries years of perspiration, skin cells and dust mites. Cleaning restores most of them. Some are past saving, and we say so at inspection rather than returning something that should be replaced.",
    turnaround: "48 hours standard",
    includes: [
      "Fill inspection and replacement advice",
      "Sanitising temperature wash",
      "Extended rinse to clear residue",
      "Full-loft drying",
      "Fill redistribution and reshaping",
      "Sealed hygienic packing",
    ],
    materials: [
      "Polyester and microfibre fill",
      "Down and feather pillows",
      "Cotton-shell pillows",
      "Bolster and body pillows",
      "Decorative pillow inserts",
      "Hotel-grade pillows in bulk",
    ],
    benefits: [
      "Removes dust mites and allergens",
      "Eliminates yellowing and odour where possible",
      "Restores shape and support",
      "Honest replace-or-clean advice",
      "Hygienically sealed on return",
    ],
    process: p(
      "Each pillow is checked for fill type, seam integrity and irreversible staining, with replacement advised where cleaning will not help.",
      "Perspiration zones are pre-treated with an enzyme chemistry safe for the fill and shell.",
      "Washed at a sanitising temperature with a long rinse so no detergent stays inside the fill.",
      "Dried to full loft, reshaped, redistributed by hand and packed in sealed hygienic covers.",
    ),
    faqs: [
      {
        q: "Can yellow stains be removed?",
        a: "Light yellowing usually improves significantly. Deep, long-set perspiration staining is often permanent, and we tell you before processing.",
      },
      {
        q: "How often should pillows be cleaned?",
        a: "Every four to six months, and replaced every one to two years depending on fill type.",
      },
      {
        q: "Do you clean memory foam pillows?",
        a: "Foam cores cannot be immersion washed. We clean the covers and surface-sanitise the core, and we will confirm the approach at inspection.",
      },
    ],
  },
  {
    slug: "cushion-cover-cleaning",
    name: "Cushion Cover Cleaning",
    category: "Upholstery",
    summary:
      "Decorative cushion covers cleaned with trim, embroidery and zip protection, then press finished.",
    intro:
      "Cushion covers are small, but they carry the most delicate trims in a room: beading, embroidery, tassels and metallic thread. Each is assessed individually and processed on the gentlest programme its construction allows.",
    turnaround: "48 hours standard",
    includes: [
      "Trim, bead and embroidery assessment",
      "Colour-fastness testing",
      "Zip and piping protection",
      "Gentle fibre-matched cleaning",
      "Press finishing on corners and edges",
      "Set-matched packing",
    ],
    materials: [
      "Cotton and canvas covers",
      "Velvet cushion covers",
      "Silk and silk-blend covers",
      "Embroidered and beaded covers",
      "Jute and textured weaves",
      "Outdoor and water-resistant covers",
    ],
    benefits: [
      "Delicate trims kept intact",
      "Colours refreshed, not faded",
      "Corners press finished sharply",
      "Sets stay together",
      "Inexpensive way to refresh a living room",
    ],
    process: p(
      "Each cover is inspected for beading, embroidery, metallic thread and zips, and colour-fastness is spot tested.",
      "Hand-marks, food spills and headrest oils are pre-treated with a chemistry safe for the trim.",
      "Cleaned in protective mesh on a low-friction programme matched to the face fabric.",
      "Shaped, press finished on corners and seams, checked against the intake photos and packed as sets.",
    ),
    faqs: [
      {
        q: "Can beaded or embroidered covers be cleaned?",
        a: "Usually yes, in protective mesh on a low-friction programme. Loosely attached beadwork is flagged at inspection before we proceed.",
      },
      {
        q: "Do you clean the inserts too?",
        a: "Yes, cushion inserts can be added to the same booking and are washed and loft dried like pillows.",
      },
      {
        q: "Is there a minimum quantity?",
        a: "No minimum for cushion covers when combined with another service; standalone small orders may carry a minimum collection value.",
      },
    ],
  },
  {
    slug: "quilt-cleaning",
    name: "Quilt Cleaning",
    category: "Bedding & Linen",
    summary:
      "Careful cleaning for cotton quilts, razais and heirloom pieces, with stitching checked before and after.",
    intro:
      "Quilts are layered, stitched constructions, and heavier hand-made pieces can be decades old. We check every stitch line before processing and use a support-wash approach so the layers do not shift or tear.",
    turnaround: "72 hours standard",
    includes: [
      "Stitch line and binding inspection",
      "Colour-bleed testing on patchwork",
      "Support washing for layered construction",
      "Low-agitation programme",
      "Flat controlled drying",
      "Folded delivery in breathable covers",
    ],
    materials: [
      "Cotton quilts and razais",
      "Patchwork and appliqué quilts",
      "Hand-stitched and heirloom quilts",
      "Polyester-filled quilts",
      "Silk-cover quilts",
      "Kantha and block-printed quilts",
    ],
    benefits: [
      "Layers and stitching kept intact",
      "Colour bleed controlled on patchwork",
      "Musty storage odour removed",
      "Filling stays evenly distributed",
      "Safe handling of sentimental pieces",
    ],
    process: p(
      "Stitch lines, bindings, patch seams and any fabric fatigue are inspected and photographed.",
      "Multi-colour patchwork is dye-tested, and stains are treated individually with a chemistry safe for the weakest fabric present.",
      "Support washed at low agitation and low temperature so layers do not shift or stress the stitching.",
      "Dried flat under controlled conditions, inspected stitch line by stitch line and folded into breathable covers.",
    ),
    faqs: [
      {
        q: "Can you clean an old hand-stitched quilt?",
        a: "Often yes, but heirloom pieces are assessed individually. If the fabric is too fragile to wash safely, we will tell you rather than risk it.",
      },
      {
        q: "Will the colours run on a patchwork quilt?",
        a: "We dye-test before washing and use a dye-catching, low-temperature programme when there is any bleed risk.",
      },
      {
        q: "Can you remove musty storage smell?",
        a: "Yes. Storage odour normally clears completely after cleaning and controlled drying with deodorising.",
      },
    ],
  },
  {
    slug: "table-linen-cleaning",
    name: "Table Linen Cleaning",
    category: "Commercial",
    summary:
      "Tablecloths, runners and napkins with specialist food and beverage stain removal, press finished.",
    intro:
      "Table linen fails on stains: wine, turmeric, oil, candle wax and coffee. Each of those needs different chemistry and a different sequence. We treat them individually before the linen ever reaches the wash.",
    turnaround: "48 hours standard",
    includes: [
      "Individual food and beverage stain treatment",
      "Wax and grease removal",
      "Whites brightening without chlorine",
      "Press finishing with crease control",
      "Napkin folding to your specification",
      "Counted, itemised return manifests",
    ],
    materials: [
      "Cotton and cotton-blend tablecloths",
      "Linen table linen",
      "Damask and jacquard weaves",
      "Polyester banquet linen",
      "Table runners and placemats",
      "Napkins in bulk",
    ],
    benefits: [
      "Stain specialists for hospitality linen",
      "Consistent press finish across a set",
      "Whites stay white without fibre damage",
      "Itemised counts on every return",
      "Volume rates for restaurants and caterers",
    ],
    process: p(
      "Linen is counted, sorted by colour and grade, and stains are classified by type before treatment.",
      "Wine, turmeric, oil, wax and coffee are each treated with their own chemistry in the correct sequence.",
      "Laundered on a colour-safe programme with oxygen brightening for whites, and a full residue rinse.",
      "Roller press finished with crease control, folded to your standard and returned with an itemised manifest.",
    ),
    faqs: [
      {
        q: "Do you handle restaurant volumes?",
        a: "Yes. Scheduled daily or alternate-day collection with itemised manifests and contracted rates is available for hospitality clients.",
      },
      {
        q: "Can you remove red wine and turmeric?",
        a: "In most cases, yes, when linen reaches us within a reasonable time. Long-set turmeric and dye transfer can be permanent, and we grade every piece honestly.",
      },
      {
        q: "Can napkins be folded to our house style?",
        a: "Yes. Tell us the fold and we will standardise it across every delivery.",
      },
    ],
  },
  {
    slug: "home-linen-cleaning",
    name: "Home Linen Cleaning",
    category: "Bedding & Linen",
    summary:
      "One managed service for all household linen: bed, bath, kitchen and dining, on a schedule you set.",
    intro:
      "Most homes do not want to book six services separately. Home linen is a single managed programme covering everything textile in the house, collected on a repeating schedule and returned sorted by room.",
    turnaround: "48 hours standard",
    includes: [
      "Bed, bath, kitchen and dining linen",
      "Sorting by room and household member",
      "Hygienic temperature laundering",
      "Press finishing where applicable",
      "Room-labelled folding and packing",
      "Recurring weekly or fortnightly slots",
    ],
    materials: [
      "Bed sheets and pillowcases",
      "Towels and bath linen",
      "Kitchen and tea towels",
      "Table linen and napkins",
      "Throws and light covers",
      "Cotton, linen and blended fabrics",
    ],
    benefits: [
      "One booking covers the whole house",
      "Returned sorted and room labelled",
      "Predictable recurring collection slots",
      "Consistent hygiene standard",
      "Frees up an entire weekend chore",
    ],
    process: p(
      "Linen is counted into room categories at pickup and logged against your household profile.",
      "Soil grades are separated and spot stains are pre-treated by category.",
      "Each category runs on its correct programme, from hygienic bath linen to gentle bed linen.",
      "Press finished where applicable, folded, labelled by room and packed in reusable covers.",
    ),
    faqs: [
      {
        q: "Can I set up a recurring pickup?",
        a: "Yes. Weekly and fortnightly recurring slots are available inside the 10 km radius, with the same collection window each time.",
      },
      {
        q: "Is there a minimum order?",
        a: "Home linen is priced by weight or by piece depending on the category, with a modest minimum collection value.",
      },
      {
        q: "Can you use a specific detergent?",
        a: "Yes. Hypoallergenic and fragrance-free options are available and stay recorded on your household profile.",
      },
    ],
  },
  {
    slug: "commercial-linen-cleaning",
    name: "Commercial Linen Cleaning",
    category: "Commercial",
    summary:
      "Contract linen processing for businesses, with route collection, itemised manifests and agreed SLAs.",
    intro:
      "Commercial linen is an operations problem before it is a cleaning problem. We build a route, agree a turnaround SLA and track every piece on a manifest so your stock levels never surprise you.",
    turnaround: "24 – 48 hours by contract",
    includes: [
      "Scheduled route collection",
      "Piece-level counting and manifests",
      "Grading and rejection reporting",
      "Hygienic temperature processing",
      "Press finishing and standard folding",
      "Contracted rates and monthly invoicing",
    ],
    materials: [
      "Spa and salon towels",
      "Restaurant and cafe linen",
      "Clinic and wellness linen",
      "Gym and studio towels",
      "Uniform and apron fabric",
      "Bulk bedding and bath linen",
    ],
    benefits: [
      "Predictable turnaround under a written SLA",
      "Stock loss visibility through manifests",
      "Consistent presentation across every delivery",
      "Single point of contact for your account",
      "Scales with seasonal demand",
    ],
    process: p(
      "Route collection with piece-level counting at your premises and a signed digital manifest.",
      "Linen is graded, and heavily soiled or damaged stock is reported back rather than quietly returned.",
      "Processed at hygienic temperature on programmes matched to each linen category.",
      "Press finished, folded to your standard, packed by department and delivered on the contracted window.",
    ),
    faqs: [
      {
        q: "Do you work outside the 10 km radius for businesses?",
        a: "Yes. Free pickup and delivery applies within 10 km, but commercial contracts can extend beyond it. Contact us for a route assessment.",
      },
      {
        q: "How is commercial pricing structured?",
        a: "By piece or by weight under a contracted rate card, with monthly invoicing and volume tiers.",
      },
      {
        q: "Can you handle daily collection?",
        a: "Yes, daily and twice-daily routes are available depending on volume and location.",
      },
    ],
  },
  {
    slug: "hotel-linen-cleaning",
    name: "Hotel Linen Cleaning",
    category: "Commercial",
    summary:
      "Housekeeping-grade linen processing for hotels and serviced apartments, built around room-turn timings.",
    intro:
      "A hotel does not need clean linen, it needs clean linen at 11am. Our hotel programme is scheduled backwards from your room-turn window, with par-level tracking so housekeeping never runs short.",
    turnaround: "24 hours standard for contracts",
    includes: [
      "Room-turn aligned collection and delivery",
      "Par-level tracking and shortage alerts",
      "Hygienic temperature processing",
      "Crisp roller press finishing",
      "Stain grading and rejection reporting",
      "Department-wise packing",
    ],
    materials: [
      "Bed sheets, duvet covers and pillowcases",
      "Bath towels, hand towels and mats",
      "Bathrobes",
      "Restaurant and banquet linen",
      "Curtains and sheers for guest rooms",
      "Blankets, duvets and mattress protectors",
    ],
    benefits: [
      "Linen ready before room-turn deadlines",
      "Consistent guest-facing presentation",
      "Par-level visibility across departments",
      "Reduced in-house laundry overhead",
      "Scales with occupancy",
    ],
    process: p(
      "Collection scheduled against your room-turn window, counted by department with a signed manifest.",
      "Linen is graded, and stained or worn pieces are separated and reported for stock replacement.",
      "Hygienic temperature processing with programmes tuned for guest-facing whiteness and softness.",
      "Roller press finished, folded to hotel standard, packed by department and delivered before the turn window.",
    ),
    faqs: [
      {
        q: "Can you meet a fixed daily delivery time?",
        a: "Yes. Delivery times are written into the service agreement and scheduled around your housekeeping turn.",
      },
      {
        q: "Do you also clean guest room curtains and blankets?",
        a: "Yes, on a rotating deep-clean schedule so rooms come out of service only briefly.",
      },
      {
        q: "How do you handle stained or worn linen?",
        a: "It is graded, photographed and reported so you can plan replacement instead of discovering it at the bed.",
      },
    ],
  },
  {
    slug: "office-fabric-care",
    name: "Office Fabric Care",
    category: "Commercial",
    summary:
      "Workplace fabric maintenance: chair upholstery, partition panels, blinds, carpet tiles and breakout furniture.",
    intro:
      "Office fabric quietly degrades: chairs absorb oils, partition panels grey out, carpet tiles darken along walkways. We run scheduled maintenance out of hours so the workplace looks maintained without downtime.",
    turnaround: "Scheduled out of hours",
    includes: [
      "Task chair and breakout upholstery cleaning",
      "Acoustic and partition panel cleaning",
      "Carpet tile and walkway extraction",
      "Fabric blind and curtain cleaning",
      "Out-of-hours and weekend scheduling",
      "Facility condition reporting",
    ],
    materials: [
      "Task chair mesh and fabric",
      "Acoustic panel fabric",
      "Carpet tiles and broadloom",
      "Fabric roller and vertical blinds",
      "Breakout sofas and soft seating",
      "Reception and meeting room textiles",
    ],
    benefits: [
      "No workplace downtime",
      "Improves indoor air quality",
      "Extends furniture replacement cycles",
      "Consistent presentation for client-facing spaces",
      "Planned maintenance schedules for facilities teams",
    ],
    process: p(
      "Site walk-through with a photographed condition report per zone and an agreed out-of-hours schedule.",
      "Dry soil extraction first, then targeted treatment on walkways, armrests and headrest zones.",
      "On-site extraction cleaning for fixed items; removable textiles are processed at the studio.",
      "Controlled drying before opening hours, zone-by-zone quality check and an updated condition report.",
    ),
    faqs: [
      {
        q: "Will cleaning disrupt the working day?",
        a: "No. Office work is scheduled evenings, nights or weekends, and fabrics are dried before staff return.",
      },
      {
        q: "Do you offer maintenance contracts?",
        a: "Yes, quarterly and half-yearly planned maintenance programmes with fixed pricing for facilities teams.",
      },
      {
        q: "Can you work with property managers across multiple sites?",
        a: "Yes. Multi-site scheduling with consolidated reporting and invoicing is supported.",
      },
    ],
  },
  {
    slug: "general-laundry",
    name: "General Laundry Services",
    category: "Home Fabrics",
    summary:
      "Everyday wash, dry and press for daily wear and household textiles, collected and delivered to your door.",
    intro:
      "The everyday load, handled properly: sorted by colour and fibre, washed at the right temperature, pressed and folded, and back at your door in 48 hours.",
    turnaround: "48 hours standard",
    includes: [
      "Sorting by colour, fibre and soil level",
      "Wash, dry and fold",
      "Press finishing on request",
      "Stain pre-treatment",
      "Hypoallergenic detergent option",
      "Free pickup and delivery within 10 km",
    ],
    materials: [
      "Everyday cotton wear",
      "Denim and casual wear",
      "Activewear and synthetics",
      "Towels and household textiles",
      "Children's clothing",
      "Workwear and uniforms",
    ],
    benefits: [
      "Consistent 48-hour turnaround",
      "Correct temperature for each fabric",
      "Pressed and neatly folded",
      "No detergent residue",
      "Free doorstep pickup and delivery",
    ],
    process: p(
      "Items are counted, sorted by colour, fibre and soil level, and logged against your profile.",
      "Collars, cuffs and visible stains receive targeted pre-treatment.",
      "Washed at the correct temperature per category with a full residue rinse.",
      "Dried, press finished where requested, folded and packed for doorstep delivery.",
    ),
    faqs: [
      {
        q: "Is laundry priced by weight?",
        a: "Yes, general laundry is priced by weight, with press finishing charged per piece where requested.",
      },
      {
        q: "Do you provide wet cleaning?",
        a: "No. Spin & Dry does not offer wet cleaning. We use professional laundering with fabric-specific programmes and finishing.",
      },
      {
        q: "Can I request a specific detergent?",
        a: "Yes. Fragrance-free and hypoallergenic detergents are available and saved to your profile for future orders.",
      },
    ],
  },
];

export const serviceCategories = [
  "Home Fabrics",
  "Bedding & Linen",
  "Upholstery",
  "Commercial",
] as const;

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export const servicePricingData: Record<string, { name: string; prices: Record<string, string> }[]> = {
  "curtain-cleaning": [
    { name: "Curtain W/o Lining (per sq. ft.)", prices: { "Premium Laundry": "9", "Dry Clean": "9", "Luxe Service": "10" } },
    { name: "Curtain W Lining (per sq. ft.)", prices: { "Premium Laundry": "12", "Dry Clean": "12", "Luxe Service": "15" } }
  ],
  "curtains-and-drapes": [
    { name: "Curtain W/o Lining (per sq. ft.)", prices: { "Premium Laundry": "9", "Dry Clean": "9", "Luxe Service": "10" } },
    { name: "Curtain W Lining (per sq. ft.)", prices: { "Premium Laundry": "12", "Dry Clean": "12", "Luxe Service": "15" } }
  ],
  "carpet-cleaning": [
    { name: "Carpet (per sq. ft.)", prices: { "Premium Laundry": "46", "Dry Clean": "46", "Luxe Service": "60", "Wash & Fold": "40", "Wash & Iron": "40" } }
  ],
  "carpets-and-area-rugs": [
    { name: "Carpet (per sq. ft.)", prices: { "Premium Laundry": "46", "Dry Clean": "46", "Luxe Service": "60", "Wash & Fold": "40", "Wash & Iron": "40" } }
  ],
  "blanket-cleaning": [
    { name: "Blanket Single", prices: { "Premium Laundry": "288", "Dry Clean": "288", "Premium Steam Press": "120", "Luxe Service": "460", "Regular Wash & Iron": "220", "Regular Wash & Fold": "200" } },
    { name: "Blanket Double", prices: { "Premium Laundry": "403", "Dry Clean": "403", "Premium Steam Press": "120", "Luxe Service": "645", "Regular Wash & Iron": "300", "Regular Wash & Fold": "250" } },
    { name: "Blanket King/Queen size", prices: { "Premium Laundry": "518", "Dry Clean": "518", "Premium Steam Press": "200", "Luxe Service": "830", "Regular Wash & Iron": "350", "Regular Wash & Fold": "300" } }
  ],
  "blankets-and-quilts": [
    { name: "Blanket Single", prices: { "Premium Laundry": "288", "Dry Clean": "288", "Premium Steam Press": "120", "Luxe Service": "460", "Regular Wash & Iron": "220", "Regular Wash & Fold": "200" } },
    { name: "Blanket Double", prices: { "Premium Laundry": "403", "Dry Clean": "403", "Premium Steam Press": "120", "Luxe Service": "645", "Regular Wash & Iron": "300", "Regular Wash & Fold": "250" } },
    { name: "Blanket King/Queen size", prices: { "Premium Laundry": "518", "Dry Clean": "518", "Premium Steam Press": "200", "Luxe Service": "830", "Regular Wash & Iron": "350", "Regular Wash & Fold": "300" } }
  ],
  "comforter-cleaning": [
    { name: "Quilt Single", prices: { "Premium Laundry": "288", "Dry Clean": "288", "Premium Steam Press": "120", "Luxe Service": "460", "Regular Wash & Iron": "220", "Regular Wash & Fold": "200" } },
    { name: "Quilt Double", prices: { "Premium Laundry": "403", "Dry Clean": "403", "Premium Steam Press": "120", "Luxe Service": "645", "Regular Wash & Iron": "300", "Regular Wash & Fold": "250" } },
    { name: "Blanket/Quilt King/Queen", prices: { "Premium Laundry": "518", "Dry Clean": "518", "Premium Steam Press": "200", "Luxe Service": "830", "Regular Wash & Iron": "350", "Regular Wash & Fold": "300" } }
  ],
  "duvet-cleaning": [
    { name: "Quilt Single", prices: { "Premium Laundry": "288", "Dry Clean": "288", "Premium Steam Press": "120", "Luxe Service": "460", "Regular Wash & Iron": "220", "Regular Wash & Fold": "200" } },
    { name: "Quilt Double", prices: { "Premium Laundry": "403", "Dry Clean": "403", "Premium Steam Press": "120", "Luxe Service": "645", "Regular Wash & Iron": "300", "Regular Wash & Fold": "250" } },
    { name: "Blanket/Quilt King/Queen", prices: { "Premium Laundry": "518", "Dry Clean": "518", "Premium Steam Press": "200", "Luxe Service": "830", "Regular Wash & Iron": "350", "Regular Wash & Fold": "300" } }
  ],
  "comforters-and-duvets": [
    { name: "Quilt Single", prices: { "Premium Laundry": "288", "Dry Clean": "288", "Premium Steam Press": "120", "Luxe Service": "460", "Regular Wash & Iron": "220", "Regular Wash & Fold": "200" } },
    { name: "Quilt Double", prices: { "Premium Laundry": "403", "Dry Clean": "403", "Premium Steam Press": "120", "Luxe Service": "645", "Regular Wash & Iron": "300", "Regular Wash & Fold": "250" } },
    { name: "Blanket/Quilt King/Queen", prices: { "Premium Laundry": "518", "Dry Clean": "518", "Premium Steam Press": "200", "Luxe Service": "830", "Regular Wash & Iron": "350", "Regular Wash & Fold": "300" } }
  ],
  "pillow-cleaning": [
    { name: "Pillow", prices: { "Premium Laundry": "230", "Dry Clean": "230", "Premium Steam Press": "30", "Luxe Service": "370", "Regular Wash & Iron": "150-300", "Regular Wash & Fold": "150-300" } },
    { name: "Cushion", prices: { "Premium Laundry": "115", "Dry Clean": "115", "Luxe Service": "185", "Regular Wash & Iron": "60-180", "Regular Wash & Fold": "60-180" } }
  ],
  "pillow-cleaning-and-sanitisation": [
    { name: "Pillow", prices: { "Premium Laundry": "230", "Dry Clean": "230", "Premium Steam Press": "30", "Luxe Service": "370", "Regular Wash & Iron": "150-300", "Regular Wash & Fold": "150-300" } },
    { name: "Cushion", prices: { "Premium Laundry": "115", "Dry Clean": "115", "Luxe Service": "185", "Regular Wash & Iron": "60-180", "Regular Wash & Fold": "60-180" } }
  ],
  "sofa-cover-cleaning": [
    { name: "Sofa Cover", prices: { "Premium Laundry": "81", "Dry Clean": "81", "Premium Steam Press": "30", "Luxe Service": "130", "Regular Wash & Iron": "42-390", "Regular Wash & Fold": "42-390" } },
    { name: "Cushion Cover", prices: { "Premium Laundry": "58", "Dry Clean": "58", "Premium Steam Press": "30", "Luxe Service": "95", "Regular Wash & Iron": "40-100", "Regular Wash & Fold": "30-100" } },
    { name: "Pillow Cover", prices: { "Premium Laundry": "58", "Dry Clean": "58", "Premium Steam Press": "30", "Luxe Service": "95", "Regular Wash & Iron": "30-100", "Regular Wash & Fold": "25-120" } }
  ],
  "sofa-and-cushion-covers": [
    { name: "Sofa Cover", prices: { "Premium Laundry": "81", "Dry Clean": "81", "Premium Steam Press": "30", "Luxe Service": "130", "Regular Wash & Iron": "42-390", "Regular Wash & Fold": "42-390" } },
    { name: "Cushion Cover", prices: { "Premium Laundry": "58", "Dry Clean": "58", "Premium Steam Press": "30", "Luxe Service": "95", "Regular Wash & Iron": "40-100", "Regular Wash & Fold": "30-100" } },
    { name: "Pillow Cover", prices: { "Premium Laundry": "58", "Dry Clean": "58", "Premium Steam Press": "30", "Luxe Service": "95", "Regular Wash & Iron": "30-100", "Regular Wash & Fold": "25-120" } }
  ],
  "cushion-cover-cleaning": [
    { name: "Cushion Cover", prices: { "Premium Laundry": "58", "Dry Clean": "58", "Premium Steam Press": "30", "Luxe Service": "95", "Regular Wash & Iron": "40-100", "Regular Wash & Fold": "30-100" } },
    { name: "Pillow Cover", prices: { "Premium Laundry": "58", "Dry Clean": "58", "Premium Steam Press": "30", "Luxe Service": "95", "Regular Wash & Iron": "30-100", "Regular Wash & Fold": "25-120" } }
  ],
  "bedsheet-cleaning": [
    { name: "Bed Sheet Single", prices: { "Premium Laundry": "138", "Dry Clean": "138", "Premium Steam Press": "40", "Luxe Service": "220", "Regular Wash & Iron": "70", "Regular Wash & Fold": "50" } },
    { name: "Bed Sheet Double", prices: { "Premium Laundry": "196", "Dry Clean": "196", "Premium Steam Press": "40", "Luxe Service": "315", "Regular Wash & Iron": "90", "Regular Wash & Fold": "70" } },
    { name: "Bed Cover Single", prices: { "Premium Laundry": "138", "Dry Clean": "138", "Premium Steam Press": "40", "Luxe Service": "220", "Regular Wash & Iron": "70", "Regular Wash & Fold": "50" } },
    { name: "Bed Cover Double", prices: { "Premium Laundry": "196", "Dry Clean": "196", "Premium Steam Press": "40", "Luxe Service": "315", "Regular Wash & Iron": "90", "Regular Wash & Fold": "70" } }
  ],
  "hotel-bed-linen": [
    { name: "Bed Sheet Single", prices: { "Premium Laundry": "138", "Dry Clean": "138", "Premium Steam Press": "40", "Luxe Service": "220", "Regular Wash & Iron": "70", "Regular Wash & Fold": "50" } },
    { name: "Bed Sheet Double", prices: { "Premium Laundry": "196", "Dry Clean": "196", "Premium Steam Press": "40", "Luxe Service": "315", "Regular Wash & Iron": "90", "Regular Wash & Fold": "70" } },
    { name: "Bed Cover Single", prices: { "Premium Laundry": "138", "Dry Clean": "138", "Premium Steam Press": "40", "Luxe Service": "220", "Regular Wash & Iron": "70", "Regular Wash & Fold": "50" } },
    { name: "Bed Cover Double", prices: { "Premium Laundry": "196", "Dry Clean": "196", "Premium Steam Press": "40", "Luxe Service": "315", "Regular Wash & Iron": "90", "Regular Wash & Fold": "70" } },
    { name: "Bed Cover/Sheet King/Queen", prices: { "Regular Wash & Iron": "110", "Regular Wash & Fold": "90" } }
  ],
  "spa-and-salon-towels": [
    { name: "Hand Towel", prices: { "Premium Laundry": "42", "Dry Clean": "42", "Luxe Service": "65", "Regular Wash & Iron": "25", "Regular Wash & Fold": "20" } },
    { name: "Bath Towel Medium", prices: { "Premium Laundry": "86", "Dry Clean": "86", "Premium Steam Press": "25", "Luxe Service": "140", "Regular Wash & Iron": "50", "Regular Wash & Fold": "40" } },
    { name: "Bath Towel Large", prices: { "Premium Laundry": "104", "Dry Clean": "104", "Premium Steam Press": "25", "Luxe Service": "165" } },
    { name: "Bath Robe", prices: { "Premium Laundry": "115", "Dry Clean": "115", "Premium Steam Press": "30", "Luxe Service": "185", "Regular Wash & Iron": "50", "Regular Wash & Fold": "40" } },
    { name: "Bath Mat", prices: { "Regular Wash & Iron": "50", "Regular Wash & Fold": "40" } }
  ],
  "table-and-banquet-linen": [
    { name: "Table Cloth", prices: { "Premium Laundry": "92", "Dry Clean": "92", "Premium Steam Press": "30", "Luxe Service": "145", "Regular Wash & Iron": "45", "Regular Wash & Fold": "30" } },
    { name: "Table Runner", prices: { "Premium Laundry": "40", "Dry Clean": "40", "Premium Steam Press": "25", "Luxe Service": "65" } },
    { name: "Table Napkin/Mat", prices: { "Regular Wash & Iron": "45", "Regular Wash & Fold": "30" } }
  ],
  "silk-saree-specialist": [
    { name: "Saree - Silk", prices: { "Roll press": "132", "Polish - Extra": "5", "Dry Clean": "265", "Starch - Extra": "5" } },
    { name: "Saree - Silk with Zari", prices: { "Roll press": "132", "Polish - Extra": "5", "Dry Clean": "299", "Starch - Extra": "5" } },
    { name: "Saree - Cotton", prices: { "Roll press": "88", "Polish - Extra": "5", "Dry Clean": "230", "Starch - Extra": "5" } },
    { name: "Saree - Chiffon/Crepe", prices: { "Roll press": "132", "Polish - Extra": "5", "Dry Clean": "250", "Starch - Extra": "5" } },
    { name: "Saree - Designer", prices: { "Roll press": "165", "Polish - Extra": "5", "Dry Clean": "345", "Starch - Extra": "5" } },
    { name: "Saree - Heavy work", prices: { "Roll press": "120", "Polish - Extra": "5", "Dry Clean": "460", "Starch - Extra": "5" } },
    { name: "Saree - Work", prices: { "Roll press": "120", "Polish - Extra": "5", "Dry Clean": "368", "Starch - Extra": "5" } },
    { name: "Saree - Jacket", prices: { "Roll press": "80", "Polish - Extra": "5", "Dry Clean": "175", "Starch - Extra": "5" } }
  ],
  "designer-wear-couture": [
    { name: "Wedding Dress", prices: { "Premium Laundry": "460", "Dry Clean": "460", "Premium Steam Press": "300", "Luxe Service": "735" } },
    { name: "Lehenga Designer", prices: { "Premium Laundry": "575", "Dry Clean": "575", "Premium Steam Press": "200", "Luxe Service": "920" } },
    { name: "Kameez Designer", prices: { "Premium Laundry": "229", "Dry Clean": "229", "Premium Steam Press": "100", "Luxe Service": "365" } },
    { name: "Anarkali", prices: { "Premium Laundry": "345", "Dry Clean": "345", "Premium Steam Press": "100", "Luxe Service": "550" } },
    { name: "Blouse Designer", prices: { "Premium Laundry": "173", "Dry Clean": "173", "Premium Steam Press": "40", "Luxe Service": "275" } },
    { name: "Lehenga Blouse", prices: { "Premium Laundry": "173", "Dry Clean": "173", "Premium Steam Press": "70", "Luxe Service": "275" } }
  ],
  "wool-winter-wear": [
    { name: "Sweater", prices: { "Premium Laundry": "196", "Dry Clean": "196", "Premium Steam Press": "40", "Luxe Service": "315", "Regular Wash & Iron": "120", "Regular Wash & Fold": "100" } },
    { name: "Jerkin", prices: { "Premium Laundry": "196", "Dry Clean": "196", "Premium Steam Press": "60", "Luxe Service": "315", "Regular Wash & Iron": "120", "Regular Wash & Fold": "90" } },
    { name: "Jacket", prices: { "Premium Laundry": "196", "Dry Clean": "196", "Premium Steam Press": "60", "Luxe Service": "315" } },
    { name: "Leather Jacket", prices: { "Premium Laundry": "460", "Dry Clean": "460", "Luxe Service": "735" } },
    { name: "Pullover", prices: { "Premium Laundry": "145", "Dry Clean": "145", "Premium Steam Press": "40", "Luxe Service": "230" } }
  ],
  "garments-and-silks": [
    { name: "Shirt / Pant", prices: { "Premium Laundry": "98", "Dry Clean": "98", "Premium Steam Press": "30", "Luxe Service": "155", "Regular Wash & Iron": "45", "Regular Wash & Fold": "30" } },
    { name: "T-Shirt", prices: { "Premium Laundry": "98", "Dry Clean": "98", "Premium Steam Press": "30", "Luxe Service": "155", "Regular Wash & Iron": "45", "Regular Wash & Fold": "30" } },
    { name: "Shirt Silk", prices: { "Premium Laundry": "144", "Dry Clean": "144", "Premium Steam Press": "40", "Luxe Service": "230" } },
    { name: "Dhothi Silk Single", prices: { "Premium Laundry": "196", "Dry Clean": "196", "Premium Steam Press": "60", "Luxe Service": "315" } },
    { name: "Dhothi Cotton Single", prices: { "Premium Laundry": "138", "Dry Clean": "138", "Premium Steam Press": "60", "Luxe Service": "220" } },
    { name: "Kurtha Cotton", prices: { "Premium Laundry": "98", "Dry Clean": "98", "Premium Steam Press": "40", "Luxe Service": "155", "Regular Wash & Iron": "50", "Regular Wash & Fold": "35" } },
    { name: "Kurtha Silk", prices: { "Premium Laundry": "138", "Dry Clean": "138", "Premium Steam Press": "50", "Luxe Service": "220" } },
    { name: "Pyjama Silk", prices: { "Premium Laundry": "104", "Dry Clean": "115", "Premium Steam Press": "60", "Luxe Service": "185" } },
    { name: "Pyjama Cotton", prices: { "Premium Laundry": "98", "Dry Clean": "98", "Premium Steam Press": "40", "Luxe Service": "155" } },
    { name: "Nehru Jacket", prices: { "Premium Laundry": "173", "Dry Clean": "173", "Premium Steam Press": "40", "Luxe Service": "275" } },
    { name: "Blazer", prices: { "Premium Laundry": "242-316", "Dry Clean": "242-316", "Premium Steam Press": "120", "Luxe Service": "385-505" } },
    { name: "Waist Coat", prices: { "Premium Laundry": "127", "Dry Clean": "127", "Premium Steam Press": "30", "Luxe Service": "205" } },
    { name: "Tie", prices: { "Premium Laundry": "58", "Dry Clean": "58", "Premium Steam Press": "30", "Luxe Service": "95" } },
    { name: "Safari Jacket", prices: { "Premium Laundry": "242", "Dry Clean": "242", "Premium Steam Press": "60", "Luxe Service": "385" } },
    { name: "Sherwani Top", prices: { "Premium Laundry": "403", "Dry Clean": "403", "Premium Steam Press": "120", "Luxe Service": "645" } },
    { name: "Sherwani Bottom", prices: { "Premium Laundry": "173", "Dry Clean": "173", "Premium Steam Press": "60", "Luxe Service": "275" } },
    { name: "Sherwani Shawl", prices: { "Premium Laundry": "138", "Dry Clean": "138", "Premium Steam Press": "40", "Luxe Service": "220" } },
    { name: "Top / Kurti", prices: { "Premium Laundry": "102", "Dry Clean": "102", "Premium Steam Press": "30", "Luxe Service": "165", "Regular Wash & Iron": "45", "Regular Wash & Fold": "30" } },
    { name: "Bottom/Salwar Regular", prices: { "Premium Laundry": "98", "Dry Clean": "98", "Premium Steam Press": "30", "Luxe Service": "155", "Regular Wash & Iron": "45", "Regular Wash & Fold": "30" } },
    { name: "Bottom Silk", prices: { "Premium Laundry": "115", "Dry Clean": "115", "Premium Steam Press": "40", "Luxe Service": "185" } },
    { name: "Kameez Regular", prices: { "Premium Laundry": "102", "Dry Clean": "102", "Premium Steam Press": "30", "Luxe Service": "165", "Regular Wash & Iron": "50", "Regular Wash & Fold": "35" } },
    { name: "Kameez Long", prices: { "Premium Laundry": "171", "Dry Clean": "171", "Premium Steam Press": "60", "Luxe Service": "275", "Regular Wash & Iron": "70", "Regular Wash & Fold": "50" } },
    { name: "Kameez Silk", prices: { "Premium Laundry": "171", "Dry Clean": "171", "Premium Steam Press": "60", "Luxe Service": "275" } },
    { name: "Blouse Cotton", prices: { "Premium Laundry": "86", "Dry Clean": "86", "Premium Steam Press": "30", "Luxe Service": "140", "Regular Wash & Iron": "45", "Regular Wash & Fold": "30" } },
    { name: "Dupatta Cotton", prices: { "Premium Laundry": "98", "Dry Clean": "98", "Premium Steam Press": "30", "Luxe Service": "155", "Regular Wash & Iron": "50", "Regular Wash & Fold": "35" } },
    { name: "Dupatta Silk", prices: { "Premium Laundry": "98", "Dry Clean": "140", "Premium Steam Press": "30", "Luxe Service": "225" } },
    { name: "Skirt Long", prices: { "Premium Laundry": "130", "Dry Clean": "130", "Premium Steam Press": "60", "Luxe Service": "210", "Regular Wash & Iron": "70", "Regular Wash & Fold": "60" } },
    { name: "Dress", prices: { "Premium Laundry": "144", "Dry Clean": "144", "Premium Steam Press": "40", "Luxe Service": "230" } },
    { name: "Shawl", prices: { "Premium Laundry": "138", "Dry Clean": "138", "Premium Steam Press": "40", "Luxe Service": "220", "Regular Wash & Iron": "80", "Regular Wash & Fold": "60" } }
  ]
};