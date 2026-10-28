import { Festival, GalleryImage, Initiative, NavLink, NewsArticle, Quote, Service } from './models';

export const NAV: NavLink[] = [
  { label: 'Home', path: '/', exact: true },
  { label: 'About', path: '/about' },
  { label: 'Aghorvani', path: '/aghorvani' },
  { label: 'Initiatives', path: '/initiatives' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'News', path: '/news' },
  { label: 'Contact', path: '/contact' },
];
export const MORE: NavLink[] = [
  { label: 'School', path: '/school' },
  { label: 'Hospital', path: '/hospital' },
  { label: 'Organic Farming', path: '/organic-farming' },
];

// Only news items with no reference to the removed names are kept.
export const NEWS: NewsArticle[] = [
  { slug: 'happiness-of-the-guru-righteous-conduct-of-disciples',
    title: 'The happiness of the guru lies in the righteous conduct of the disciples',
    excerpt: 'Pujyapad Gurudev said in his benediction that life does not change merely by praising the…', excerptIncomplete: true },
  { slug: 'families-breaking-apart-greed-ego-communication',
    title: 'Families are breaking apart due to greed, ego, and lack of communication.',
    excerpt: 'Pujyapad Gurudev stated that the primary reasons for the disintegration of families, rising tensions in…', excerptIncomplete: true },
  { slug: 'guru-purnima-devotees-guru-darshan-aghor-peeth', category: 'Guru Purnima 2026',
    title: 'Guru Purnima: Overwhelming Crowd of Devotees for Guru Darshan at Aghor Peeth',
    date: 'Wednesday, July 29, 2026',
    excerpt: 'On the auspicious occasion of Guru Purnima today, devotees gathered for Guru Darshan at Aghor Peeth. The supplied report begins with the program starting at 7:30…', excerptIncomplete: true },
];

export const SERVICES: Service[] = [
  { tag: 'Education', title: 'Our School', path: '/school', image: 'assets/school.png',
    text: 'There are talented children in rural areas who deserve opportunities to learn, grow, and build a brighter future.' },
  { tag: 'Healthcare', title: 'Our Hospital', path: '/hospital', image: 'assets/hospital.png',
    text: 'Aghor Hospital is operated by Aghor Peeth Janseva Abhed Ashram Trust.' },
  { tag: 'Organic Farming', title: 'Organic Farming', path: '/organic-farming', image: 'assets/farming.png',
    text: 'Our organization has established a Gaushala to support its organic farming initiatives.' },
];
/**
 * Detail pages. Replace `image`, and fill `highlights`, `sections` and `gallery` whenever real details are ready —
 * empty lists automatically show a neat "coming soon" block, so nothing else needs to change.
 */
export const INITIATIVES: Initiative[] = [
  { slug: 'school', path: '/school', image: 'assets/school.png', imageAlt: 'Our School',
    tag: { en: 'Education', hi: 'शिक्षा' }, title: { en: 'Our School', hi: 'हमारा विद्यालय' },
    tagline: { en: 'Learning, growth and a brighter future for rural children.', hi: 'ग्रामीण बच्चों के लिए शिक्षा, विकास और उज्ज्वल भविष्य।' },
    intro: { en: 'There are talented children in rural areas who deserve opportunities to learn, grow, and build a brighter future.', hi: 'ग्रामीण क्षेत्रों में प्रतिभाशाली बच्चे हैं, जो सीखने, आगे बढ़ने और अपना उज्ज्वल भविष्य बनाने के अवसर के हक़दार हैं।' },
    donateLabel: { en: 'Support Our School', hi: 'हमारे विद्यालय को सहयोग दें' },
    highlights: [], sections: [], gallery: [] },
  { slug: 'hospital', path: '/hospital', image: 'assets/hospital.png', imageAlt: 'Aghor Hospital',
    tag: { en: 'Healthcare', hi: 'स्वास्थ्य सेवा' }, title: { en: 'Our Hospital', hi: 'हमारा अस्पताल' },
    tagline: { en: 'Care and healing, offered as seva.', hi: 'सेवा भाव से उपचार और स्वास्थ्य-लाभ।' },
    intro: { en: 'Aghor Hospital is operated by Aghor Peeth Janseva Abhed Ashram Trust.', hi: 'अघोर हॉस्पिटल का संचालन अघोर पीठ जनसेवा अभेद आश्रम ट्रस्ट द्वारा किया जाता है।' },
    donateLabel: { en: 'Support Our Hospital', hi: 'हमारे अस्पताल को सहयोग दें' },
    highlights: [
      { en: 'Operated by Aghor Peeth Janseva Abhed Ashram Trust', hi: 'अघोर पीठ जनसेवा अभेद आश्रम ट्रस्ट द्वारा संचालित' },
      { en: 'Health camp held during Guru Purnima', hi: 'गुरु पूर्णिमा के अवसर पर स्वास्थ्य शिविर' },
      { en: '1,600+ people treated at this year\u2019s camp', hi: 'इस वर्ष के शिविर में 1,600 से अधिक लोगों का उपचार' },
    ], sections: [], gallery: [] },
  { slug: 'organic-farming', path: '/organic-farming', image: 'assets/farming.png', imageAlt: 'Organic Farming and Gaushala',
    tag: { en: 'Organic Farming', hi: 'जैविक खेती' }, title: { en: 'Organic Farming', hi: 'जैविक खेती' },
    tagline: { en: 'Where tradition meets technology.', hi: 'जहाँ परंपरा और तकनीक साथ चलती हैं।' },
    intro: { en: 'Our organization has established a Gaushala to support its organic farming initiatives.', hi: 'हमारी संस्था ने जैविक खेती की पहल को सहारा देने के लिए एक गौशाला की स्थापना की है।' },
    donateLabel: { en: 'Support Organic Farming', hi: 'जैविक खेती को सहयोग दें' },
    highlights: [
      { en: 'Mat nursery trays for even, healthy seedlings', hi: 'समान और स्वस्थ पौध के लिए मैट नर्सरी ट्रे' },
      { en: 'Machine transplanting in neat rows', hi: 'सीधी कतारों में मशीन से रोपाई' },
      { en: 'Drone spraying across the field', hi: 'खेत में ड्रोन से छिड़काव' },
      { en: 'A Gaushala supporting organic farming', hi: 'जैविक खेती को सहारा देती गौशाला' },
    ], sections: [], gallery: [] },
];
/** Photo categories offered in the admin dashboard and used as filters on the Gallery page. */
export const PHOTO_CATEGORIES = ['Ashram', 'Guru Darshan', 'Festival', 'Seva', 'School', 'Hospital', 'Organic Farming', 'Other'];
export const NEWS_CATEGORIES = ['Announcement', 'Satsang', 'Guru Purnima', 'Festival', 'Seva', 'Programme'];
export const DONATE = [
  { title: 'Support Our Hospital', text: 'Aghor Hospital is operated by Aghor Peeth Janseva Abhed Ashram Trust.' },
  { title: 'Support Our School', text: 'Help support educational opportunities for children from rural communities.' },
  { title: 'Support Organic Farming', text: 'Support farming initiatives that aim to assist rural communities through better practices and technology.' },
];
export const FESTIVALS: Festival[] = [
  { title: 'Guru Purnima (Aughad Peer Parv)', hi: 'गुरु पूर्णिमा', icon: 'moon',
    when: 'Ashadha Purnima', whenHi: 'आषाढ़ पूर्णिमा',
    text: 'The day of honouring the Guru. Devotees gather at the Ashram for guru darshan, and a free health camp is held alongside the programme.' },
  { title: 'Aghoreshwar Mahaparinirvan Diwas', hi: 'महापरिनिर्वाण दिवस', icon: 'diya',
    when: '29 November', whenHi: '29 नवंबर',
    text: 'Observed in loving remembrance of Param Pujya Aghoreshwar Bhagwan Ram Ji, whose life joined sadhana with service.' },
  { title: 'Ashram Sthapna Diwas & Gurudev Ji Avtaran Diwas', hi: 'स्थापना दिवस एवं अवतरण दिवस', icon: 'ashram',
    when: '12 June', whenHi: '12 जून',
    text: '',
    parts: [
      { title: 'Ashram Sthapna Diwas', hi: 'आश्रम स्थापना दिवस', when: '12 June',
        text: 'The Ashram was established on 12 June 2008 through the grace and resolve of Param Pujya Kapalik Dharm Rakshit Ram Ji.' },
      { title: 'Param Pujya Gurudev Ji Avtaran Diwas', hi: 'परमपूज्य गुरुदेव जी अवतरण दिवस', when: 'Avtaran',
        text: 'The auspicious day of the divine appearance of Param Pujya Gurudev Ji, celebrated with devotion by the Ashram family.' },
    ] },
  { title: 'Sharadiya & Chaitra Navratri', hi: 'शारदीय एवं चैत्र नवरात्रि', icon: 'lotus',
    when: 'Ashwin & Chaitra', whenHi: 'आश्विन एवं चैत्र',
    text: 'Nine nights of worship, fasting and sadhana dedicated to Shakti, observed twice a year in the months of Ashwin and Chaitra.' },
];
/** Add real ashram photos here (files in public/assets/images). Empty until verified images exist. */
export const GALLERY: GalleryImage[] = [];

/** 10 teachings of Param Pujya Aghoreshwar Bhagwan Ram Ji, shown on Home (auto-sliding) and on /aghorvani. */
export const VANI_BY = 'अघोरेश्वर भगवान राम जी';
export const QUOTES: Quote[] = [
  { title: 'अघोर की परिभाषा', text: 'जो घोर न हो, कठिन न हो, कड़वा न हो, उसे अघोर कहते हैं। अघोर सुगम पंथ है। इसका अनुगमन स्वभाव की मंथर गति से होता है।' },
  { title: 'जीवन का लक्ष्य', text: 'जीवन का लक्ष्य ऊँचा रखना चाहिए। यदि आप तौलेंगे तो सर्वोच्च पद और स्थान पर पहुँचेंगे, अन्यथा बहुतेरे जीवन को लाश की तरह ढो रहे हैं।' },
  { title: 'पशु और मनुष्य में अंतर', text: 'पशु और मनुष्य में मुख्य अंतर यह है कि मनुष्य में सोचने, समझने तथा अपनी भावनाओं को व्यक्त करने की विशेष क्षमता होती है, जबकि पशुओं में यह क्षमता सीमित रूप में होती है।' },
  { title: 'आसक्ति और दुख', text: 'जिन्हें जितनी आसक्ति है, जितना लगाव है, दुख की अग्नि भी उतनी ही तीव्र होती है।' },
  { title: 'मूककंठ प्रार्थना', text: 'तुम्हें चलकर प्रार्थना क्या करना है? जहाँ हो, जिस क्षण में हो, वहीं से मूककंठ प्रार्थना करो।' },
  { title: 'अभेद बुद्धि', text: 'जहाँ भेद बुद्धि का अभाव हो जाए, वह अघोर है, अभेद है। अपरिपक्व ज्ञान का त्याग कर जो पूर्ण है, उसी के पथ पर साधकों को चलना है।' },
  { title: 'साधना और आसन', text: 'साधक जब अपने आसनस्थ होता है, तो वह त्रिकोण यंत्रवत् बन जाता है और उसके हृदय में एक विशेष तरह का कंपन शुरू हो जाता है।' },
  { title: 'सत्संग और संगति', text: 'पेटू और पियक्कड़ों का संग दुष्परिणाम की तरफ, कुकृत्य की तरफ ले जाता है।' },
  { title: 'श्रद्धा का महत्व', text: 'जो गुरु की वाणी में अक्षरशः विश्वास करते हैं, श्रद्धा रखते हैं, उनको ऋद्धि-सिद्धि हस्तगत है।' },
  { title: 'ईश्वर और सामग्री', text: 'आराधना कोई देवता को धूप, दीप और नैवेद्य से तौलकर लेने की वस्तु नहीं है, यह तो केवल मन की सामग्री है।' },
];
export const QUOTES_NOTE = 'प्रामाणिक वाणियों के लिए: अवधूत भगवान राम जी की शिक्षाओं का संकलन “अघोर वचन शास्त्र” एक महत्वपूर्ण स्रोत है।';