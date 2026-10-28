export const CATEGORIES = [
  { id: "vani", hi: "वाणी / सुविचार", en: "Vani / Teachings" },
  { id: "story", hi: "बाबा जी की कहानी / किस्से", en: "Baba Ji's Stories" },
  { id: "aughoreshwar", hi: "अघोरेश्वर भगवान राम", en: "Aghoreshwar Bhagwan Ram" },
  { id: "kinaram", hi: "बाबा कीनाराम", en: "Baba Kinaram" },
  { id: "ashram", hi: "आश्रम की जानकारी (बच्चे, सुविधाएँ)", en: "Ashram Info (children, facilities)" },
  { id: "donation", hi: "दान / Donation", en: "Donation" },
  { id: "aarti", hi: "आरती / भजन / पूजा विधि", en: "Aarti / Bhajan / Rituals" },
  { id: "events", hi: "उत्सव / कार्यक्रम", en: "Festivals & Events" },
  { id: "other", hi: "अन्य", en: "Other" },
] as const;
export const categoryIds = CATEGORIES.map((c) => c.id) as string[];
