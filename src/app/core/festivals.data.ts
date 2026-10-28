/**
 * Festival cards + their popup content. Every text is a pair: [हिन्दी, English].
 *
 * PHOTOS: put files in  src/assets/festivals/  named exactly like `file` below (e.g. guru-purnima-01.jpg).
 * jpg / jpeg / png / webp all work. A photo that does not exist is simply hidden, so you can add them one by one.
 * The FIRST photo of each section is the big banner image at the top of the popup.
 */
export type B = [hi: string, en: string];
export type FIcon = 'moon' | 'diya' | 'ashram' | 'lotus' | 'sparkle';

export interface FHighlight { i: string; t: B; d: B }
export interface FPhoto { file: string; cap: B; /** true = this slot is a VIDEO (mp4 / webm / mov) instead of a photo */ video?: boolean }
export interface FStat { v: string; l: B }
export interface FSection {
  id: string;
  label: B;            // tab label (only shown when a card has more than one section)
  date: B;             // chip on the banner
  title: B;            // popup heading
  short: string;       // English blurb on the card (the home page is English; the popup is bilingual)
  intro: B[];
  stats?: FStat[];
  highlights: FHighlight[];
  photos: FPhoto[];
}
export interface FestivalCard {
  id: string; icon: FIcon;
  when: B;             // chip on the card
  title: B;            // card heading (used when the card has a single section)
  sections: FSection[];
}

export const FEST_FOLDER = 'assets/festivals/';
export const FEST_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'];
export const FEST_VIDEO_EXTS = ['mp4', 'webm', 'mov', 'MP4', 'MOV', 'm4v'];

export const FEST_CARDS: FestivalCard[] = [
  /* ───────────── 1. GURU PURNIMA ───────────── */
  {
    id: 'guru-purnima', icon: 'moon',
    when: ['आषाढ़ पूर्णिमा', 'Ashadha Purnima'],
    title: ['गुरु पूर्णिमा', 'Guru Purnima (Aughad Peer Parv)'],
    sections: [{
      id: 'guru-purnima',
      label: ['गुरु पूर्णिमा', 'Guru Purnima'],
      date: ['आषाढ़ पूर्णिमा', 'Ashadha Purnima'],
      title: ['गुरु पूर्णिमा — औघड़ पीर पर्व', 'Guru Purnima — Aughad Peer Parv'],
      short: 'The day of honouring the Guru. Devotees gather at the Ashram for guru darshan, and a free health camp and blanket distribution are held alongside the programme.',
      intro: [
        ['गुरु पूर्णिमा वह पावन दिवस है जब शिष्य और श्रद्धालु अपने गुरु के चरणों में श्रद्धा अर्पित करते हैं। अघोर पीठ जनसेवा अभेद आश्रम में यह पर्व ‘औघड़ पीर पर्व’ के रूप में मनाया जाता है।',
         'Guru Purnima is the sacred day on which disciples and devotees offer their reverence at the feet of the Guru. At Aghor Peeth Janseva Abhed Ashram it is observed as ‘Aughad Peer Parv’.'],
        ['दूर-दूर से श्रद्धालु आश्रम पहुँचकर गुरु-दर्शन और आशीर्वाद प्राप्त करते हैं। पूजन और दर्शन के साथ-साथ इस अवसर पर सेवा के कार्य भी होते हैं — निःशुल्क स्वास्थ्य शिविर और ज़रूरतमंदों को कंबल वितरण।',
         'Devotees come from far and near to the Ashram for guru darshan and blessings. Alongside the worship, acts of seva are carried out — a free health camp and the distribution of blankets to those in need.'],
      ],
      stats: [{ v: '1,835', l: ['लोग गुरु पूर्णिमा 2026 स्वास्थ्य शिविर में लाभान्वित', 'people treated at the Guru Purnima 2026 health camp'] }],
      highlights: [
        { i: '🙏', t: ['गुरु दर्शन', 'Guru Darshan'], d: ['श्रद्धालु परमपूज्य गुरुदेव के दर्शन कर आशीर्वाद प्राप्त करते हैं।', 'Devotees receive darshan and the blessings of Param Pujya Gurudev.'] },
        { i: '🪔', t: ['पूजन एवं आयोजन', 'Puja & Programme'], d: ['श्रद्धालु एक साथ बैठकर गुरु-पूजन और आयोजन में सम्मिलित होते हैं।', 'Devotees sit together and take part in the guru puja and the programme.'] },
        { i: '🩺', t: ['निःशुल्क स्वास्थ्य शिविर', 'Free Health Camp'], d: ['आश्रम की अस्पताल टीम द्वारा निःशुल्क जाँच एवं उपचार।', 'Free check-ups and treatment by the Ashram’s hospital team.'] },
        { i: '🧣', t: ['कंबल वितरण', 'Blanket Distribution'], d: ['ज़रूरतमंदों को कंबल भेंट किए जाते हैं।', 'Blankets are given to people in need.'] },
      ],
      photos: [
        { file: 'guru-purnima-01', cap: ['गुरु दर्शन', 'Guru Darshan'] },
        { file: 'guru-purnima-02', cap: ['श्रद्धालुओं का संगम', 'Devotees gathered at the Ashram'] },
        { file: 'guru-purnima-03', cap: ['गुरु पूजन', 'Guru puja'] },
        { file: 'guru-purnima-04', cap: ['निःशुल्क स्वास्थ्य शिविर', 'Free health camp'] },
        { file: 'guru-purnima-05', cap: ['डॉक्टरों द्वारा जाँच', 'Check-ups by our doctors'] },
        { file: 'guru-purnima-06', cap: ['कंबल वितरण', 'Blanket distribution'] },
      ],
    }],
  },

  /* ───────────── 2. MAHAPARINIRVAN DIWAS ───────────── */
  {
    id: 'mahaparinirvan', icon: 'diya',
    when: ['29 नवंबर', '29 November'],
    title: ['महापरिनिर्वाण दिवस', 'Aghoreshwar Mahaparinirvan Diwas'],
    sections: [{
      id: 'mahaparinirvan',
      label: ['महापरिनिर्वाण दिवस', 'Mahaparinirvan Diwas'],
      date: ['29 नवंबर', '29 November'],
      title: ['अघोरेश्वर भगवान राम जी महापरिनिर्वाण दिवस', 'Aghoreshwar Bhagwan Ram Ji Mahaparinirvan Diwas'],
      short: 'Observed in loving remembrance of Param Pujya Aghoreshwar Bhagwan Ram Ji — with puja-path at his Samadhi temple and blanket distribution to those in need.',
      intro: [
        ['29 नवंबर को आश्रम परमपूज्य अघोरेश्वर भगवान राम जी का महापरिनिर्वाण दिवस श्रद्धा और स्मरण के साथ मनाता है। साधना को सेवा से जोड़ने वाले इस महान संत के प्रति श्रद्धालु नतमस्तक होकर अपनी भावांजलि अर्पित करते हैं।',
         'On 29 November the Ashram observes the Mahaparinirvan Diwas of Param Pujya Aghoreshwar Bhagwan Ram Ji with reverence and remembrance. Devotees bow in gratitude to the great saint who joined sadhana with service.'],
        ['आश्रम में उनकी समाधि एवं मंदिर है, जहाँ अघोरेश्वर भगवान राम जी की मूर्ति विराजमान है। इस दिन यहाँ विशेष पूजा-पाठ होता है और शीत ऋतु के आरंभ में ज़रूरतमंदों को कंबल वितरित किए जाते हैं।',
         'The Ashram has his Samadhi and temple, where the murti of Aghoreshwar Bhagwan Ram Ji is installed. Special puja and path are held here on this day, and as the cold season begins, blankets are distributed to those in need.'],
      ],
      stats: [{ v: '1937–1992', l: ['परमपूज्य अघोरेश्वर भगवान राम जी', 'Param Pujya Aghoreshwar Bhagwan Ram Ji'] }],
      highlights: [
        { i: '🛕', t: ['समाधि एवं मंदिर', 'Samadhi & Temple'], d: ['आश्रम में बनी पावन समाधि और मंदिर, जहाँ श्रद्धालु नमन करने आते हैं।', 'The sacred Samadhi and temple at the Ashram where devotees come to pay their respects.'] },
        { i: '🕉️', t: ['मूर्ति दर्शन', 'Murti Darshan'], d: ['मंदिर में विराजमान अघोरेश्वर भगवान राम जी की मूर्ति के दर्शन।', 'Darshan of the murti of Aghoreshwar Bhagwan Ram Ji installed in the temple.'] },
        { i: '🪔', t: ['पूजा-पाठ', 'Puja & Path'], d: ['विशेष पूजन, आरती और पाठ।', 'Special worship, aarti and recitation.'] },
        { i: '🧣', t: ['कंबल वितरण', 'Blanket Distribution'], d: ['ज़रूरतमंदों को कंबल भेंट किए जाते हैं।', 'Blankets are given to people in need.'] },
        { i: '🤲', t: ['सेवा का संकल्प', 'Resolve to Serve'], d: ['शिक्षा, स्वास्थ्य और समभाव के उनके संदेश पर चलने का संकल्प।', 'A resolve to walk the path of education, health and equanimity that he taught.'] },
      ],
      photos: [
        { file: 'mahaparinirvan-01', cap: ['समाधि स्थल एवं मंदिर', 'The Samadhi temple'] },
        { file: 'mahaparinirvan-02', cap: ['अघोरेश्वर भगवान राम जी की मूर्ति', 'Murti of Aghoreshwar Bhagwan Ram Ji'] },
        { file: 'mahaparinirvan-03', video: true, cap: ['विशेष पूजन (वीडियो)', 'Special puja (video)'] },
        { file: 'mahaparinirvan-04', cap: ['पाठ एवं आरती', 'Path and aarti'] },
        { file: 'mahaparinirvan-05', cap: ['कंबल वितरण', 'Blanket distribution'] },
        { file: 'mahaparinirvan-06', cap: ['श्रद्धालुओं की भावांजलि', 'Devotees paying their respects'] },
      ],
    }],
  },

  /* ───────────── 3. GURUDEV AVTARAN (left) + ASHRAM STHAPNA (right) — same day, 12 June ───────────── */
  {
    id: 'sthapna', icon: 'ashram',
    when: ['12 जून', '12 June'],
    title: ['अवतरण दिवस एवं स्थापना दिवस', 'Gurudev Ji Avtaran Diwas & Ashram Sthapna Diwas'],
    sections: [
      {
        id: 'avtaran',
        label: ['गुरुदेव जी अवतरण दिवस', 'Gurudev Ji Avtaran Diwas'],
        date: ['12 जून', '12 June'],
        title: ['परमपूज्य गुरुदेव जी अवतरण दिवस', 'Param Pujya Gurudev Ji Avtaran Diwas'],
        short: 'On the same sacred day, the birthday of our Gurudev, Param Pujya Kapalik Dharm Rakshit Ram Ji, is celebrated with devotion.',
        intro: [
          ['आश्रम स्थापना दिवस के उसी पावन दिन, 12 जून को हमारे गुरुदेव परमपूज्य कापालिक धर्मरक्षित राम जी का अवतरण दिवस (जन्मदिवस) भी श्रद्धा और उल्लास से मनाया जाता है।',
           'On the very same sacred day, 12 June, the Avtaran Diwas (birthday) of our Gurudev, Param Pujya Kapalik Dharm Rakshit Ram Ji, is celebrated with devotion and joy.'],
          ['बाल्यकाल से अघोरेश्वर भगवान राम जी के सान्निध्य में पले गुरुदेव ने गुरु के मार्ग को आश्रम, विद्यापीठ और सेवा-कार्यों के रूप में धरती पर उतारा। इस दिन श्रद्धालु उनके दर्शन, आशीर्वाद और शुभकामनाओं के लिए एकत्र होते हैं।',
           'Raised from childhood in the company of Aghoreshwar Bhagwan Ram Ji, Gurudev brought the guru’s path to the soil as an ashram, a vidyapeeth and works of service. On this day devotees gather for his darshan, blessings and to offer their good wishes.'],
        ],
        highlights: [
          { i: '🙏', t: ['दर्शन एवं आशीर्वाद', 'Darshan & Blessings'], d: ['श्रद्धालु गुरुदेव के दर्शन कर आशीर्वाद लेते हैं।', 'Devotees receive Gurudev’s darshan and blessings.'] },
          { i: '🪔', t: ['पूजन', 'Puja'], d: ['गुरुदेव के चरणों में श्रद्धा और पूजन अर्पित किया जाता है।', 'Reverence and worship are offered at Gurudev’s feet.'] },
          { i: '💐', t: ['शुभकामनाएँ', 'Good Wishes'], d: ['शिष्य और श्रद्धालु अपनी भावनाएँ और शुभकामनाएँ अर्पित करते हैं।', 'Disciples and devotees offer their love and good wishes.'] },
          { i: '🤲', t: ['गुरु का संकल्प', 'Gurudev’s Resolve'], d: ['शिक्षा, स्वास्थ्य, पर्यावरण और प्राकृतिक कृषि के संकल्प को आगे बढ़ाना।', 'Carrying forward the resolve for education, health, environment and natural farming.'] },
        ],
        photos: [
          { file: 'gurudev-01', cap: ['परमपूज्य कापालिक धर्मरक्षित राम जी', 'Param Pujya Kapalik Dharm Rakshit Ram Ji'] },
          { file: 'gurudev-02', cap: ['अवतरण दिवस का उत्सव', 'Avtaran Diwas celebration'] },
          { file: 'gurudev-03', cap: ['श्रद्धालुओं को आशीर्वाद', 'Blessing the devotees'] },
        ],
      },
      {
        id: 'sthapna',
        label: ['आश्रम स्थापना दिवस', 'Ashram Sthapna Diwas'],
        date: ['12 जून', '12 June'],
        title: ['आश्रम स्थापना दिवस', 'Ashram Sthapna Diwas'],
        short: 'The Ashram was established on 12 June 2008 through the grace and resolve of Param Pujya Kapalik Dharm Rakshit Ram Ji. The Ashram flag is worshipped on this day.',
        intro: [
          ['12 जून 2008 को परम पूज्य कापालिक धर्मरक्षित राम जी की पावन कृपा और संकल्प से, दल्हा पर्वत की तलहटी में, ग्राम पोड़ी दल्हा (अकलतरा), जांजगीर-चांपा, छत्तीसगढ़ में अघोरपीठ जनसेवा अभेद आश्रम की स्थापना हुई।',
           'On 12 June 2008, through the blessed grace and resolve of Param Pujya Kapalik Dharm Rakshit Ram Ji, Aghorpeeth Janseva Abhed Ashram was established at the foot of the Dalha mountain in village Podi Dalha (Akaltara), Janjgir-Champa, Chhattisgarh.'],
          ['हर वर्ष इसी तिथि पर आश्रम स्थापना दिवस मनाया जाता है। इस दिन आश्रम के ध्वज (झंडे) का विधिवत पूजन होता है और श्रद्धालु साधना तथा सेवा के संकल्प को दोहराते हैं।',
           'Every year the Ashram Sthapna Diwas is celebrated on this date. The Ashram flag (jhanda) is worshipped with due rites, and devotees renew their resolve for sadhana and service.'],
        ],
        stats: [{ v: '2008', l: ['आश्रम की स्थापना का वर्ष', 'the year the Ashram was established'] }, { v: '12 June', l: ['हर वर्ष स्थापना दिवस', 'Sthapna Diwas, every year'] }],
        highlights: [
          { i: '🚩', t: ['झंडा पूजन', 'Jhanda Pujan'], d: ['आश्रम के ध्वज का विधिवत पूजन।', 'Worship of the Ashram flag with due rites.'] },
          { i: '🏛️', t: ['स्थापना की स्मृति', 'Remembering the Founding'], d: ['पोड़ी दल्हा में आश्रम की नींव और संकल्प का स्मरण।', 'Remembering the founding and the resolve behind the Ashram at Podi Dalha.'] },
          { i: '🙏', t: ['श्रद्धालुओं का आगमन', 'Devotees Gather'], d: ['श्रद्धालु दर्शन, पूजन और आशीर्वाद के लिए एकत्र होते हैं।', 'Devotees gather for darshan, worship and blessings.'] },
          { i: '🤲', t: ['सेवा का संकल्प', 'Resolve to Serve'], d: ['शिक्षा, स्वास्थ्य, पर्यावरण और सामाजिक सद्भाव के संकल्प का नवीनीकरण।', 'Renewing the resolve for education, health, environment and social harmony.'] },
        ],
        photos: [
          { file: 'sthapna-01', cap: ['अघोरपीठ जनसेवा अभेद आश्रम', 'Aghorpeeth Janseva Abhed Ashram'] },
          { file: 'sthapna-02', cap: ['आश्रम परिसर — दृश्य 2', 'The Ashram — view 2'] },
          { file: 'sthapna-03', cap: ['आश्रम परिसर — दृश्य 3', 'The Ashram — view 3'] },
          { file: 'sthapna-04', cap: ['आश्रम परिसर — दृश्य 4', 'The Ashram — view 4'] },
          { file: 'sthapna-05', cap: ['आश्रम परिसर — दृश्य 5', 'The Ashram — view 5'] },
          { file: 'sthapna-06', cap: ['आश्रम परिसर — दृश्य 6', 'The Ashram — view 6'] },
          { file: 'sthapna-07', cap: ['आश्रम परिसर — दृश्य 7', 'The Ashram — view 7'] },
          { file: 'sthapna-08', cap: ['आश्रम परिसर — दृश्य 8', 'The Ashram — view 8'] },
        ],
      },
    ],
  },

  /* ───────────── 4. NAVRATRI ───────────── */
  {
    id: 'navratri', icon: 'lotus',
    when: ['चैत्र एवं आश्विन', 'Chaitra & Ashwin'],
    title: ['शारदीय एवं चैत्र नवरात्रि', 'Sharadiya & Chaitra Navratri'],
    sections: [{
      id: 'navratri',
      label: ['नवरात्रि', 'Navratri'],
      date: ['वर्ष में दो बार', 'Twice a year'],
      title: ['शारदीय एवं चैत्र नवरात्रि', 'Sharadiya & Chaitra Navratri'],
      short: 'Nine nights of worship, fasting and sadhana dedicated to Shakti, observed twice a year in the months of Chaitra and Ashwin.',
      intro: [
        ['नवरात्रि शक्ति-उपासना के नौ पावन दिन हैं, जो वर्ष में दो बार आते हैं — चैत्र मास में चैत्र नवरात्रि (बसंत) और आश्विन मास में शारदीय नवरात्रि (शरद)। आश्रम में दोनों नवरात्रि श्रद्धा और संयम के साथ मनाई जाती हैं।',
         'Navratri is a span of nine sacred days of Shakti worship that comes twice a year — Chaitra Navratri in the month of Chaitra (spring) and Sharadiya Navratri in the month of Ashwin (autumn). The Ashram observes both with devotion and restraint.'],
        ['इन नौ दिनों में माँ की आराधना, पूजन-पाठ, जप और साधना का विशेष महत्व है। श्रद्धालु व्रत-संयम रखकर आश्रम में दर्शन और पूजन के लिए आते हैं।',
         'These nine days hold special importance for worship of the Mother, puja-path, japa and sadhana. Devotees keep fasts and discipline and come to the Ashram for darshan and worship.'],
      ],
      stats: [{ v: '9', l: ['पावन रात्रियाँ', 'sacred nights'] }, { v: '2×', l: ['हर वर्ष — चैत्र और शारदीय', 'every year — Chaitra & Sharadiya'] }],
      highlights: [
        { i: '🔱', t: ['शक्ति उपासना', 'Shakti Upasana'], d: ['माँ की आराधना के नौ दिन।', 'Nine days of worship of the Divine Mother.'] },
        { i: '🪔', t: ['पूजन एवं आरती', 'Puja & Aarti'], d: ['प्रतिदिन पूजन और आरती।', 'Puja and aarti through the days.'] },
        { i: '📿', t: ['पाठ एवं जप', 'Path & Japa'], d: ['मंत्र-जप, पाठ और साधना।', 'Mantra japa, recitation and sadhana.'] },
        { i: '🌼', t: ['व्रत एवं संयम', 'Fasting & Restraint'], d: ['श्रद्धालु व्रत और संयम का पालन करते हैं।', 'Devotees observe fasts and self-discipline.'] },
      ],
      photos: [
        { file: 'navratri-01', cap: ['नवरात्रि पूजन', 'Navratri puja'] },
        { file: 'navratri-02', cap: ['माँ की आरती', 'Aarti of the Mother'] },
        { file: 'navratri-03', cap: ['श्रद्धालुओं का दर्शन', 'Devotees at darshan'] },
        { file: 'navratri-04', cap: ['पाठ एवं जप', 'Path and japa'] },
        { file: 'navratri-05', cap: ['सजा हुआ मंदिर', 'The decorated temple'] },
        { file: 'navratri-06', cap: ['प्रसाद एवं सेवा', 'Prasad and seva'] },
      ],
    }],
  },

  /* ───────────── 5. DEEPAWALI ───────────── */
  {
    id: 'deepawali', icon: 'sparkle',
    when: ['कार्तिक अमावस्या', 'Kartik Amavasya'],
    title: ['दीपावली', 'Deepawali (Diwali)'],
    sections: [{
      id: 'deepawali',
      label: ['दीपावली', 'Deepawali'],
      date: ['कार्तिक अमावस्या', 'Kartik Amavasya'],
      title: ['दीपावली — दीपोत्सव', 'Deepawali — The Festival of Lights'],
      short: 'The festival of lights. At dusk the Ashram glows with rows of diyas around the Ashram flag, along the pathways and in patterns of light.',
      intro: [
        ['दीपावली प्रकाश का पर्व है — अंधकार पर प्रकाश और अज्ञान पर ज्ञान की विजय का प्रतीक। आश्रम में यह पर्व दीपमाला की जगमगाहट के साथ श्रद्धा से मनाया जाता है।',
         'Deepawali is the festival of lights — a symbol of light over darkness and knowledge over ignorance. At the Ashram it is celebrated with devotion and a glow of lamps.'],
        ['संध्या होते ही आश्रम परिसर दीपों से जगमगा उठता है — आश्रम के ध्वज के चारों ओर, पथों के किनारे और दीपों से बनी सुंदर आकृतियों में प्रज्वलित दीप हर श्रद्धालु का मन मोह लेते हैं।',
         'As evening falls the Ashram campus lights up — lamps burn around the Ashram flag, along the pathways and in beautiful patterns of diyas that delight every devotee.'],
      ],
      highlights: [
        { i: '🪔', t: ['दीपमाला', 'Deepmala'], d: ['पूरे परिसर में पंक्तिबद्ध प्रज्वलित दीप।', 'Rows of lit diyas across the campus.'] },
        { i: '🚩', t: ['आश्रम ध्वज के चारों ओर दीप', 'Lamps Around the Flag'], d: ['आश्रम के ध्वज को घेरे हुए दीपों की जगमगाहट।', 'A glowing ring of diyas around the Ashram flag.'] },
        { i: '✨', t: ['दीपों की आकृतियाँ', 'Patterns of Light'], d: ['दीपों से बनी सुंदर आकृतियाँ और रंगोली।', 'Beautiful designs and rangoli made with diyas.'] },
        { i: '🙏', t: ['श्रद्धालुओं की सहभागिता', 'Devotees Take Part'], d: ['श्रद्धालु दीप प्रज्वलित कर प्रार्थना करते हैं।', 'Devotees light the lamps and offer their prayers.'] },
      ],
      photos: [
        { file: 'diwali-01', cap: ['आश्रम ध्वज के चारों ओर दीपमाला', 'Diyas around the Ashram flag'] },
        { file: 'diwali-02', cap: ['दीपों से सजे आश्रम के पथ', 'Lamp-lit pathways of the Ashram'] },
        { file: 'diwali-03', cap: ['दीपों से बनी आकृति', 'A pattern made of diyas'] },
        { file: 'diwali-04', cap: ['दीपावली — आश्रम दृश्य 4', 'Deepawali at the Ashram — view 4'] },
        { file: 'diwali-05', cap: ['दीपावली — आश्रम दृश्य 5', 'Deepawali at the Ashram — view 5'] },
        { file: 'diwali-06', cap: ['दीपावली — आश्रम दृश्य 6', 'Deepawali at the Ashram — view 6'] },
        { file: 'diwali-07', cap: ['दीपावली — आश्रम दृश्य 7', 'Deepawali at the Ashram — view 7'] },
        { file: 'diwali-08', cap: ['दीपावली — आश्रम दृश्य 8', 'Deepawali at the Ashram — view 8'] },
        { file: 'diwali-09', cap: ['दीपावली — आश्रम दृश्य 9', 'Deepawali at the Ashram — view 9'] },
      ],
    }],
  },
];