import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { VANI_BY } from '../core/content';
import { SITE } from '../core/site.config';

/** Every text is a pair: [हिन्दी, English]. Edit here, no template changes needed. */
type Bi = [hi: string, en: string];
const HERO_IMG = 'assets/guruji2.png';

const NAME: { t: Bi; d: Bi }[] = [
  { t: ['अघोर', 'Aghor'], d: ['जो घोर न हो, कठिन न हो — सरल, सहज और स्वाभाविक चेतना की अवस्था।', 'That which is not terrible or difficult — the simple, natural state of consciousness.'] },
  { t: ['पीठ', 'Peeth'], d: ['साधना का पावन आसन — जहाँ गुरु-परंपरा की धारा जीवित है।', 'A sacred seat of sadhana, where the stream of the guru-tradition stays alive.'] },
  { t: ['जनसेवा', 'Janseva'], d: ['सेवा ही साधना — शिक्षा, स्वास्थ्य और सहारा हर ज़रूरतमंद तक।', 'Service as worship — education, health and support reaching every person in need.'] },
  { t: ['अभेद', 'Abhed'], d: ['जाति, धन, रोग या पहचान के आधार पर कोई भेद नहीं — एक ही मानवता।', 'No distinction of caste, wealth, illness or identity — one single humanity.'] },
];

const LINEAGE: { n: Bi; role: Bi; d: Bi }[] = [
  { n: ['अघोराचार्य बाबा कीनाराम', 'Aghoracharya Baba Kinaram'], role: ['अघोर परंपरा के महान आचार्य', 'Great acharya of the Aghor tradition'],
    d: ['क्रीं-कुण्ड, काशी की पावन पीठ के आधार। जाति-पाँति से परे, दीन-दुखियों के सेवक — हिन्दू-मुस्लिम सभी उनके शिष्य बने।', 'Founder-saint of the sacred seat at Krim-Kund, Kashi. Beyond caste, a servant of the poor and afflicted — Hindus and Muslims alike became his disciples.'] },
  { n: ['परमपूज्य अघोरेश्वर भगवान राम जी', 'Param Pujya Aghoreshwar Bhagwan Ram Ji'], role: ['1937 – 1992', '1937 – 1992'],
    d: ['साधना के साथ सेवा को जोड़ने वाले महान संत। कुष्ठ रोगियों की सेवा, शिक्षा और समभाव का संदेश उनके जीवन की पहचान है।', 'The great saint who joined sadhana with service. Care for leprosy patients, education and equanimity define his life.'] },
  { n: ['परमपूज्य श्री कपालिक धर्मरक्षित राम जी', 'Param Pujya Dharm Rakshit Baba Kapalik Ram Ji'], role: ['अध्यक्ष, अघोर पीठ जनसेवा अभेद आश्रम', 'President, Aghor Peeth Janseva Abhed Ashram'],
    d: ['बाल्यकाल से अघोरेश्वर के सान्निध्य में पले। गुरु के मार्ग को पोड़ी-दल्हा की धरती पर आश्रम, विद्यापीठ और सेवा-कार्यों के रूप में उतारा।', 'Raised in the company of Aghoreshwar Bhagwan Ram Ji. He brought the guru\'s path to the soil of Podi-Dalha as an ashram, a vidyapeeth and works of service.'] },
];

const INTRO: Bi[] = [
  ['दल्हा पर्वत की पावन तलहटी में, छत्तीसगढ़ के जांजगीर-चांपा जिले के ग्राम पोड़ी दल्हा (अकलतरा) में विराजमान है — अघोरपीठ जनसेवा अभेद आश्रम। 12 जून 2008 को परम पूज्य कापालिक धर्मरक्षित राम जी की पावन कृपा और संकल्प से स्थापित यह ट्रस्ट साधना और सेवा का अद्भुत संगम है।',
   'At the sacred foot of the Dalha mountain, in village Podi Dalha (Akaltara) of Janjgir-Champa district, Chhattisgarh, stands the Aghorpeeth Janseva Abhed Ashram. Established on 12 June 2008 through the blessed grace and resolve of Param Pujya Kapalik Dharm Rakshit Ram Ji, this Trust is a wondrous confluence of sadhana and service.'],
  ['आश्रम की आत्मा है — मानवता की सेवा, सामाजिक समरसता, आध्यात्मिक चेतना और सर्वजन कल्याण। यहाँ अटल विश्वास है कि प्रत्येक मनुष्य सम्मान, प्रेम और समान व्यवहार का अधिकारी है। जरूरतमंद के प्रति सहयोग और समाज के प्रति उत्तरदायित्व — यही जनसेवा के सच्चे आधार हैं।',
   'The soul of the Ashram is service to humanity, social harmony, spiritual awakening and the welfare of all. Here there is an unshakeable faith that every human being deserves respect, love and equal treatment. Support for the needy and responsibility towards society — these are the true foundations of janseva.'],
  ['शिक्षा, स्वास्थ्य, पर्यावरण संरक्षण, प्राकृतिक कृषि और सामाजिक जागरूकता — हर क्षेत्र में आश्रम आध्यात्मिक मूल्यों को जीवन के व्यवहार से जोड़ता है, ताकि समाज में सकारात्मक परिवर्तन की ज्योति सदा जलती रहे।',
   'In education, health, environmental protection, natural farming and social awareness, the Ashram joins spiritual values to the conduct of daily life, so that the lamp of positive change in society may burn forever.'],
];

const AIMS_LEAD: Bi = ['आश्रम का उद्देश्य ऐसे समाज के निर्माण में योगदान देना है जहाँ मानवता सर्वोपरि हो, प्रत्येक व्यक्ति को समान सम्मान मिले, और वंचित एवं जरूरतमंद वर्गों को आगे बढ़ने के अवसर प्राप्त हों।',
  'The Ashram aims to help build a society where humanity comes first, every person receives equal respect, and the deprived and needy are given opportunities to rise.'];
const AIMS: { i: string; d: Bi }[] = [
  { i: '💗', d: ['मानव मात्र के प्रति प्रेम, करुणा और बंधुत्व की भावना को प्रोत्साहित करना।', 'To nurture love, compassion and brotherhood towards all human beings.'] },
  { i: '📖', d: ['ग्रामीण क्षेत्रों के बच्चों के लिए बेहतर शैक्षणिक अवसरों को बढ़ावा देना।', 'To promote better educational opportunities for children in rural areas.'] },
  { i: '⚕', d: ['स्वास्थ्य सेवाओं के माध्यम से जनकल्याण में योगदान देना।', 'To contribute to public welfare through health services.'] },
  { i: '🔆', d: ['कुरीतियों, अंधविश्वास, नशे और दहेज जैसी समस्याओं के प्रति जागरूकता जगाना।', 'To awaken awareness against social evils, superstition, intoxication and dowry.'] },
  { i: '🌳', d: ['वृक्षारोपण, पर्यावरण संरक्षण और जैविक कृषि को प्रोत्साहित करना।', 'To encourage tree plantation, environmental protection and organic farming.'] },
  { i: '☯', d: ['समाज में समानता, नैतिकता, सद्भाव और परस्पर सहयोग की भावना को सुदृढ़ करना।', 'To strengthen equality, morality, harmony and mutual cooperation in society.'] },
];

interface Seva { id: string; ico: string; k: Bi; t: Bi; p: Bi[]; path?: string }
const SEVA: Seva[] = [
  { id: 'shiksha', ico: '🎓', k: ['शिक्षा सेवा', 'EDUCATION'], t: ['ज्ञान से सशक्त भविष्य', 'A future strengthened by knowledge'], path: '/school', p: [
    ['शिक्षा व्यक्ति, परिवार और समाज के उत्थान की आधारशिला है। ग्रामीण अंचल के प्रतिभाशाली बच्चों को श्रेष्ठ शैक्षणिक सुविधाएँ और आगे बढ़ने के अवसर देने के पावन भाव से आश्रम ट्रस्ट अघोरे विद्या पीठ का संचालन करता है।',
     'Education is the foundation of the upliftment of the individual, the family and society. With the sacred wish of giving talented children of rural areas the best facilities and opportunities to rise, the Ashram Trust runs the Aghore Vidya Peeth.'],
    ['यहाँ आधुनिक शिक्षा के साथ व्यक्तित्व विकास, अनुशासन, नैतिक मूल्यों और भारतीय सांस्कृतिक विरासत को विशेष स्थान मिलता है। कक्षा-शिक्षण के साथ खेलकूद, योग, कला, संगीत, रचनात्मक गतिविधियाँ और विद्यार्थियों में नेतृत्व क्षमता का विकास — सर्वांगीण विकास की इसी भावना के अंग हैं।',
     'Alongside modern education, personality development, discipline, moral values and India\'s cultural heritage hold a special place here. Sports, yoga, art, music, creative activities and the growth of leadership in students — all are parts of this spirit of all-round development.'],
    ['विद्यालय का ध्येय केवल अक्षर-ज्ञान देना नहीं, बल्कि हर विद्यार्थी को आत्मविश्वासी, संवेदनशील, जिम्मेदार और जीवन की हर चुनौती का सामना करने में सक्षम बनाना है।',
     'The aim of the school is not merely to give knowledge of letters, but to make every student confident, sensitive, responsible and capable of facing every challenge of life.'] ] },
  { id: 'swasthya', ico: '⚕', k: ['स्वास्थ्य सेवा', 'HEALTH CARE'], t: ['स्वस्थ समाज की दिशा में', 'Towards a healthy society'], path: '/hospital', p: [
    ['स्वास्थ्य हर मनुष्य के जीवन और गरिमा से जुड़ा है। आश्रम ट्रस्ट द्वारा संचालित अघोर चिकित्सालय स्वास्थ्य सेवा के क्षेत्र में समाज के प्रति अपने दायित्व को निभाता है।',
     'Health is bound to the life and dignity of every human being. The Aghor Chikitsalaya (hospital), run by the Ashram Trust, fulfils its duty to society in the field of health care.'],
    ['आश्रम से संबद्ध स्वास्थ्य सेवाओं का उद्देश्य है — चिकित्सा सहायता को लोगों तक पहुँचाना और स्वास्थ्य के प्रति जागरूकता जगाना। विद्यालय परिसर में भी विद्यार्थियों के स्वास्थ्य और प्राथमिक चिकित्सा की आवश्यकताओं का ध्यान रखा जाता है।',
     'The purpose of the health services connected with the Ashram is to carry medical help to people and to awaken awareness of health. Within the school campus too, care is taken of students\' health and first-aid needs.'],
    ['आश्रम का दृढ़ विश्वास है कि शिक्षा और स्वास्थ्य एक श्रेष्ठ समाज के दो मजबूत स्तंभ हैं। गुरु पूर्णिमा 2026 के निःशुल्क स्वास्थ्य शिविर में 1,835 लोगों ने लाभ लिया।',
     'The Ashram firmly believes that education and health are two strong pillars of a noble society. At the free health camp of Guru Purnima 2026, 1,835 people received care.'] ] },
  { id: 'samaj', ico: '🤝', k: ['समाज सेवा एवं जनकल्याण', 'SOCIAL SERVICE & PUBLIC WELFARE'], t: ['सेवा ही साधना', 'Service is worship'], p: [
    ['जनसेवा आश्रम की मूल भावना का अभिन्न अंग है। जरूरतमंदों के प्रति संवेदना, सहयोग और सम्मान का भाव जगाना इसकी कार्यदृष्टि का प्राण है।',
     'Janseva is an inseparable part of the Ashram\'s very spirit. Awakening compassion, support and respect for the needy is the life-breath of its vision.'],
    ['सामाजिक एवं सामुदायिक कार्यक्रमों में जनभागीदारी, सेवा, सद्भाव और जागरूकता को महत्त्व दिया जाता है। विभिन्न अवसरों पर होने वाले धार्मिक और सामाजिक आयोजन लोगों को आपस में जोड़ते हैं, सहयोग की भावना जगाते हैं और समाज के प्रति अपने दायित्व को समझने का अवसर देते हैं।',
     'Public participation, service, harmony and awareness are valued in social and community programmes. Religious and social gatherings held on various occasions bring people together, awaken the spirit of cooperation and give a chance to understand one\'s duty towards society.'],
    ['आश्रम का संकल्प है ऐसी सामाजिक चेतना, जिसमें सेवा बिना किसी भेदभाव के, केवल मानव कल्याण की भावना से की जाए।',
     'The Ashram\'s resolve is a social awakening in which service is done without any discrimination, purely in the spirit of human welfare.'] ] },
  { id: 'paryavaran', ico: '🌳', k: ['पर्यावरण संरक्षण एवं वृक्षारोपण', 'ENVIRONMENT & TREE PLANTATION'], t: ['प्रकृति — हमारा पावन उत्तरदायित्व', 'Nature — our sacred responsibility'], p: [
    ['प्रकृति का संरक्षण वर्तमान और आने वाली पीढ़ियों के प्रति हमारा पवित्र कर्तव्य है। आश्रम पर्यावरण संरक्षण, वृक्षारोपण और प्राकृतिक संसाधनों के प्रति जिम्मेदार दृष्टि को महत्त्व देता है।',
     'Protecting nature is our sacred duty towards the present and coming generations. The Ashram values environmental protection, tree plantation and a responsible outlook towards natural resources.'],
    ['वृक्षारोपण जैसे कार्यक्रमों के माध्यम से प्रकृति के प्रति संवेदना जगाने और पर्यावरण-रक्षा का संदेश जन-जन तक पहुँचाने का प्रयास किया जाता है।',
     'Through programmes like tree plantation, an effort is made to awaken sensitivity towards nature and carry the message of protecting the environment to every person.'],
    ['आश्रम की दृष्टि है कि प्राकृतिक संतुलन की रक्षा केवल व्यक्तिगत आवश्यकता नहीं, बल्कि सामूहिक सामाजिक दायित्व भी है।',
     'The Ashram\'s vision is that guarding the balance of nature is not merely a personal need but a collective social responsibility.'] ] },
  { id: 'gaushala', ico: '🌾', k: ['गौशाला एवं जैविक कृषि', 'GAUSHALA & ORGANIC FARMING'], t: ['धरती माँ की सेवा', 'Serving Mother Earth'], path: '/organic-farming', p: [
    ['प्राकृतिक संसाधनों का संरक्षण और टिकाऊ कृषि ग्रामीण जीवन के लिए अत्यंत महत्त्वपूर्ण हैं। आश्रम परिसर में गौशाला और जैविक कृषि के प्रयासों को विशेष महत्त्व दिया जाता है।',
     'Conserving natural resources and sustainable farming are vital for rural life. Within the Ashram campus, special importance is given to the gaushala and to organic farming.'],
    ['गौशाला से प्राप्त संसाधनों का उपयोग जैविक खाद और प्राकृतिक कृषि की तैयारियों में करने की दिशा में प्रयास किए जाते हैं — प्राकृतिक खेती, मिट्टी की गुणवत्ता के संरक्षण और पर्यावरण-अनुकूल पद्धतियों के प्रति जागरूकता की भावना से।',
     'Efforts are made to use resources from the gaushala for organic manure and natural-farming preparations — in the spirit of awareness about natural farming, protecting soil quality and environment-friendly methods.'],
    ['उद्देश्य है — प्रकृति के साथ संतुलन बनाए रखते हुए ग्रामीण विकास और पर्यावरण संरक्षण के महत्त्व को सामने लाना।',
     'The aim is to bring forward the importance of rural development and environmental protection while keeping balance with nature.'] ] },
];

const ADHYATM: Bi[] = [
  ['आध्यात्मिकता का वास्तविक रूप व्यक्ति के विचार, व्यवहार और दूसरों के प्रति दृष्टि में झलकता है। आश्रम की मूल भावना है — प्रेम, करुणा, समभाव, आत्मचिंतन और सेवा के मूल्यों को जीवन में स्थान देना।',
   'True spirituality shines in a person\'s thoughts, conduct and outlook towards others. The Ashram\'s core spirit is to give a place in life to love, compassion, equanimity, self-reflection and service.'],
  ['सामाजिक समरसता का अर्थ है — किसी व्यक्ति से उसकी जाति, सामाजिक स्थिति, भाषा, क्षेत्र या किसी भी पहचान के आधार पर भेदभाव न हो। प्रत्येक मनुष्य के प्रति सम्मान और संवेदना का भाव ही स्वस्थ एवं समरस समाज की नींव है।',
   'Social harmony means that no person is discriminated against on the basis of caste, social standing, language, region or any identity. Respect and compassion for every human being is the foundation of a healthy and harmonious society.'],
  ['इसी भावना को आगे बढ़ाते हुए आश्रम आध्यात्मिक मूल्यों और सामाजिक उत्तरदायित्व के बीच सुंदर संतुलन स्थापित करने का प्रयास करता है।',
   'Carrying this spirit forward, the Ashram strives to create a beautiful balance between spiritual values and social responsibility.'],
];

const DRISHTI: { i: string; t: Bi; d: Bi }[] = [
  { i: '📖', t: ['शिक्षा', 'Education'], d: ['समाज को ज्ञान देती है', 'gives society knowledge'] },
  { i: '🪷', t: ['स्वास्थ्य', 'Health'], d: ['जीवन को संबल प्रदान करता है', 'gives life strength'] },
  { i: '🌳', t: ['पर्यावरण संरक्षण', 'Environment'], d: ['भविष्य की रक्षा करता है', 'protects the future'] },
  { i: '🤲', t: ['जनसेवा', 'Janseva'], d: ['मानवीय संवेदनाओं को सशक्त बनाती है', 'strengthens human compassion'] },
];

const SANKALP: Bi[] = [
  ['अघोरपीठ जनसेवा अभेद आश्रम शिक्षा, स्वास्थ्य, पर्यावरण संरक्षण, प्राकृतिक कृषि और सामाजिक सद्भाव के मूल्यों को प्रोत्साहित करते हुए जनकल्याण की दिशा में निरंतर योगदान देने के लिए प्रतिबद्ध है।',
   'Aghorpeeth Janseva Abhed Ashram is committed to contributing continuously towards public welfare, nurturing the values of education, health, environmental protection, natural farming and social harmony.'],
  ['हमारा प्रयास है कि प्रत्येक व्यक्ति के प्रति सम्मान, प्रत्येक जरूरतमंद के प्रति संवेदना और प्रत्येक सामाजिक पहल में सहयोग की भावना बनी रहे। सेवा, समभाव और मानवीय मूल्यों के माध्यम से एक अधिक जागरूक, संवेदनशील और समरस समाज के निर्माण की दिशा में आगे बढ़ना ही हमारा संकल्प है।',
   'Our effort is that respect for every person, compassion for every needy soul and cooperation in every social initiative may always remain. To move forward, through service, equanimity and human values, towards a more aware, sensitive and harmonious society — this is our resolve.'],
];

const FEST: Bi[] = [
  ['गुरु पूर्णिमा (औघड़ पीर पर्व)', 'Guru Purnima (Aughad Peer Parv)'],
  ['अघोरेश्वर महापरिनिर्वाण दिवस — 29 नवंबर', 'Aghoreshwar Mahaparinirvan Diwas — 29 November'],
  ['आश्रम स्थापना दिवस — 12 जून एवं परमपूज्य गुरुदेव जी अवतरण दिवस', 'Ashram Sthapna Diwas — 12 June & Param Pujya Gurudev Ji Avtaran Diwas'],
  ['शारदीय एवं चैत्र नवरात्रि', 'Sharadiya & Chaitra Navratri'],
];

@Component({
  selector: 'app-about-page',
  imports: [RouterLink],
  template: `
  <!-- ═════ banner ═════ -->
  <section class="banner" aria-labelledby="ab-h">
    @if (!imgFail()) {
      <img class="bg" [src]="img" alt="" aria-hidden="true" (error)="imgFail.set(true)">
      <img class="portrait" [src]="img" alt="Guruji in prayer at the Ashram" (error)="imgFail.set(true)">
    }
    @else { <span class="bg om-bg" aria-hidden="true" lang="hi">ॐ</span> }
    <div class="shade"></div>
    <div class="container txt">
      <p class="eyebrow">ABOUT US • हमारे बारे में</p>
      <h1 id="ab-h">Aghor Peeth Janseva<br>Abhed Ashram</h1>
      <div class="orn" style="justify-content:flex-start" aria-hidden="true"><i></i></div>
      <p class="tag" lang="hi">{{ t(['मानव सेवा, समभाव, शिक्षा और जनकल्याण को समर्पित एक आध्यात्मिक एवं सामाजिक संस्थान', 'A spiritual and social institution devoted to human service, equanimity, education and public welfare']) }}</p>
      <span class="place">📍 पोड़ी दल्हा, अकलतरा · जांजगीर-चांपा, छत्तीसगढ़</span>
    </div>
  </section>

  <!-- ═════ language bar ═════ -->
  <div class="langbar">
    <div class="container"><div class="lang" role="group" aria-label="Choose language">
      <button type="button" [class.on]="lang() === 'en'" [attr.aria-pressed]="lang() === 'en'" (click)="lang.set('en')">English</button>
      <button type="button" lang="hi" [class.on]="lang() === 'hi'" [attr.aria-pressed]="lang() === 'hi'" (click)="lang.set('hi')">हिन्दी</button>
    </div></div>
  </div>

  <div [attr.lang]="lang()">
  <!-- ═════ who we are ═════ -->
  <section class="section" aria-labelledby="who-h">
    <div class="container intro">
      <div>
        <p class="invoc" lang="hi">॥ श्री गुरवे नमः ॥</p>
        <p class="kicker">{{ t(['हमारे बारे में', 'ABOUT THE ASHRAM']) }}</p>
        <h2 id="who-h">{{ t(['साधना का तीर्थ, सेवा का घर', 'A pilgrimage of sadhana, a home of service']) }}</h2>
        <div class="orn" style="justify-content:flex-start" aria-hidden="true"><i></i></div>
        @for (p of intro; track $index) { <p [class.lead]="$index === 0">{{ t(p) }}</p> }
      </div>
      <ul class="stats" aria-label="At a glance">
        <li><strong>2008</strong><span>{{ t(['स्थापना — 12 जून', 'Established — 12 June']) }}</span></li>
        <li><strong>5</strong><span>{{ t(['सेवा क्षेत्र: शिक्षा, स्वास्थ्य, समाज, पर्यावरण, गौशाला', 'Fields of service: education, health, society, environment, gaushala']) }}</span></li>
        <li><strong>1,835</strong><span>{{ t(['गुरु पूर्णिमा 2026 स्वास्थ्य शिविर में लाभान्वित', 'treated at the Guru Purnima 2026 health camp']) }}</span></li>
      </ul>
    </div>
  </section>

  <!-- ═════ the name ═════ -->
  <section class="section alt" aria-labelledby="nm-h">
    <div class="container">
      <div class="head"><p class="kicker">{{ t(['हमारे नाम का अर्थ', 'THE MEANING OF OUR NAME']) }}</p>
        <h2 id="nm-h">{{ t(['अघोर · पीठ · जनसेवा · अभेद', 'Aghor · Peeth · Janseva · Abhed']) }}</h2>
        <div class="orn" aria-hidden="true"><i></i></div></div>
      <div class="grid name">
        @for (x of names; track $index) {
          <article class="tile"><span class="n" aria-hidden="true">{{ $index + 1 }}</span><h3>{{ t(x.t) }}</h3><p>{{ t(x.d) }}</p></article>
        }
      </div>
    </div>
  </section>

  <!-- ═════ featured teaching ═════ -->
  <section class="vani" aria-label="A teaching">
    <span class="mark" aria-hidden="true" lang="hi">ॐ</span>
    <div class="container">
      <blockquote lang="hi"><p>“जहाँ भेद बुद्धि का अभाव हो जाए, वह अघोर है, अभेद है।”</p></blockquote>
      <p class="by" lang="hi">— {{ by }}</p>
      <a class="btn btn-light" routerLink="/aghorvani">{{ t(['और वाणियाँ पढ़ें →', 'Read more teachings →']) }}</a>
    </div>
  </section>

  <!-- ═════ lineage ═════ -->
  <section class="section" aria-labelledby="ln-h">
    <div class="container">
      <div class="head"><p class="kicker">{{ t(['गुरु परंपरा', 'OUR GURU LINEAGE']) }}</p>
        <h2 id="ln-h">{{ t(['एक अखंड धारा', 'An unbroken stream']) }}</h2>
        <div class="orn" aria-hidden="true"><i></i></div></div>
      <ol class="line">
        @for (x of lineage; track $index) {
          <li><span class="dot" aria-hidden="true">{{ $index + 1 }}</span>
            <div class="lcard"><h3>{{ t(x.n) }}</h3><p class="role">{{ t(x.role) }}</p><p>{{ t(x.d) }}</p></div></li>
        }
      </ol>
      <p style="text-align:center;margin-top:2rem"><a class="btn btn-line" routerLink="/" fragment="gurus">{{ t(['पूरी जीवनी पढ़ें', 'Read the full biographies']) }}</a></p>
    </div>
  </section>

  <!-- ═════ aims ═════ -->
  <section class="section alt" aria-labelledby="aim-h">
    <div class="container">
      <div class="head"><p class="kicker">{{ t(['हमारा उद्देश्य', 'OUR PURPOSE']) }}</p>
        <h2 id="aim-h">{{ t(['जहाँ मानवता सर्वोपरि हो', 'Where humanity comes first']) }}</h2>
        <div class="orn" aria-hidden="true"><i></i></div>
        <p>{{ t(aimsLead) }}</p></div>
      <div class="grid path">
        @for (x of aims; track $index) {
          <article class="pcard"><span class="ico" aria-hidden="true">{{ x.i }}</span><p>{{ t(x.d) }}</p></article>
        }
      </div>
    </div>
  </section>

  <!-- ═════ the five services ═════ -->
  <section class="section" aria-labelledby="sv-h">
    <div class="container">
      <div class="head"><p class="kicker">{{ t(['हमारा सेवा-कार्य', 'OUR SERVICE']) }}</p>
        <h2 id="sv-h">{{ t(['साधना जो समाज तक पहुँचे', 'Sadhana that reaches society']) }}</h2>
        <div class="orn" aria-hidden="true"><i></i></div></div>
      @for (x of seva; track x.id) {
        <article class="seva" [id]="x.id" [class.flip]="$index % 2 === 1">
          <div class="side"><span class="ring" aria-hidden="true">{{ x.ico }}</span><span class="no" aria-hidden="true">{{ $index + 1 }}</span></div>
          <div class="body">
            <p class="kicker">{{ t(x.k) }}</p>
            <h3>{{ t(x.t) }}</h3>
            <div class="orn" style="justify-content:flex-start;margin:.5rem 0 1rem" aria-hidden="true"><i></i></div>
            @for (p of x.p; track $index) { <p>{{ t(p) }}</p> }
            @if (x.path) { <a class="more" [routerLink]="x.path">{{ t(['और जानें', 'Learn more']) }} →</a> }
          </div>
        </article>
      }
    </div>
  </section>

  <!-- ═════ spiritual consciousness & harmony ═════ -->
  <section class="adh" aria-labelledby="ad-h">
    <span class="mark" aria-hidden="true" lang="hi">ॐ</span>
    <div class="container box2">
      <p class="kicker gold">{{ t(['आध्यात्मिक चेतना एवं सामाजिक समरसता', 'SPIRITUAL AWAKENING & SOCIAL HARMONY']) }}</p>
      <h2 id="ad-h">{{ t(['अभेद — एक ही प्रकाश, एक ही मानवता', 'Abhed — one light, one humanity']) }}</h2>
      <div class="orn" aria-hidden="true"><i></i></div>
      @for (p of adhyatm; track $index) { <p>{{ t(p) }}</p> }
    </div>
  </section>

  <!-- ═════ our vision ═════ -->
  <section class="section alt" aria-labelledby="dr-h">
    <div class="container">
      <div class="head"><p class="kicker">{{ t(['हमारी कार्यदृष्टि', 'OUR VISION']) }}</p>
        <h2 id="dr-h">{{ t(['हमारा विश्वास', 'What we believe']) }}</h2>
        <div class="orn" aria-hidden="true"><i></i></div></div>
      <div class="grid dr">
        @for (x of drishti; track $index) {
          <article class="dcard"><span class="ico" aria-hidden="true">{{ x.i }}</span><h3>{{ t(x.t) }}</h3><p>{{ t(x.d) }}</p></article>
        }
      </div>
      <p class="drl">{{ t(['इन सभी क्षेत्रों में सहयोग और सकारात्मक प्रयासों के माध्यम से समाज में जागरूकता, समानता और कल्याण की भावना विकसित करना आश्रम की कार्यदृष्टि का महत्त्वपूर्ण हिस्सा है।', 'Developing awareness, equality and the spirit of welfare in society, through cooperation and positive effort in all these fields, is an important part of the Ashram\'s vision.']) }}</p>
    </div>
  </section>

  <!-- ═════ mantra ═════ -->
  <section class="mantra" aria-labelledby="mt-h">
    <span class="mark" aria-hidden="true" lang="hi">ॐ</span>
    <div class="container box">
      <p class="kicker gold">{{ t(['अघोर मंत्र', 'THE AGHOR MANTRA']) }}</p>
      <h2 id="mt-h">{{ t(['अघोरेश्वर शिव को नमन', 'Salutation to Aghoreshwar']) }}</h2>
      <div class="orn" aria-hidden="true"><i></i></div>
      <p class="sloka" lang="hi">ॐ अघोरेभ्योऽथ घोरेभ्यो घोरघोरतरेभ्यः।<br>सर्वतः शर्व सर्वेभ्यो नमस्ते अस्तु रुद्ररूपेभ्यः॥</p>
      <p class="mean">{{ t(['उन रुद्र-रूपों को नमस्कार — जो सौम्य (अघोर) भी हैं, घोर भी और घोरतर भी — सर्वत्र और सब में।', 'Salutations to the forms of Rudra — the gentle (aghora), the fierce, and the fiercer than fierce — everywhere and in all.']) }}</p>
      <p class="fine">{{ t(['यह मंत्र वैदिक रुद्र-परंपरा (तैत्तिरीय आरण्यक) का है। गुरु-दीक्षा के मंत्र केवल गुरु से ही प्राप्त होते हैं।', 'This verse belongs to the Vedic Rudra tradition (Taittiriya Aranyaka). Initiation mantras are received only from the guru.']) }}</p>
      <div class="chips" lang="hi"><span>ॐ तत् सत्</span><span>॥ श्री गुरवे नमः ॥</span></div>
    </div>
  </section>

  <!-- ═════ our resolve ═════ -->
  <section class="sank" aria-labelledby="sk-h">
    <div class="container">
      <p class="kicker gold">{{ t(['हमारा संकल्प', 'OUR RESOLVE']) }}</p>
      <h2 id="sk-h">{{ t(['मानवता का सम्मान, सेवा का समर्पण और समाज के कल्याण का संकल्प।', 'Respect for humanity, dedication to service, and a resolve for the welfare of society.']) }}</h2>
      <div class="orn" aria-hidden="true"><i></i></div>
      @for (p of sankalp; track $index) { <p>{{ t(p) }}</p> }
      <p class="vande" lang="hi">अघोरेश्वर वंदे जगत् गुरुम्।</p>
    </div>
  </section>

  <!-- ═════ festivals + visit ═════ -->
  <section class="section" aria-labelledby="fs-h">
    <div class="container two">
      <div>
        <p class="kicker">{{ t(['पर्व एवं उत्सव', 'FESTIVALS']) }}</p>
        <h2 id="fs-h">{{ t(['आश्रम के पावन पर्व', 'Sacred occasions at the Ashram']) }}</h2>
        <div class="orn" style="justify-content:flex-start" aria-hidden="true"><i></i></div>
        <ul class="fest">@for (f of fest; track $index) { <li>{{ t(f) }}</li> }</ul>
      </div>
      <aside class="visit">
        <h3>{{ t(['आइए, हमसे जुड़िए', 'Come, be with us']) }}</h3>
        <p>{{ t(['गुरु-दर्शन, सेवा या सहयोग — हम आपका स्वागत करते हैं।', 'For guru darshan, service or support — you are always welcome.']) }}</p>
        <p class="ct"><a [href]="site.phoneHref">{{ site.phone }}</a><br><a [href]="'mailto:' + site.email">{{ site.email }}</a></p>
        <div class="btns"><a class="btn btn-gold" routerLink="/contact">{{ t(['संपर्क करें', 'Contact']) }}</a><a class="btn btn-light" routerLink="/donation">♥ {{ t(['सहयोग करें', 'Donate']) }}</a></div>
      </aside>
    </div>
    <p class="salute" lang="hi">॥ परमपूज्य अघोरेश्वर भगवान राम जी को सादर नमन ॥</p>
  </section>
  </div>`,
  styles: [`
  :host{display:block}
  .banner{position:relative;overflow:hidden;min-height:clamp(340px,64vh,640px);display:flex;align-items:flex-end;color:var(--ivory);background:var(--brown)}
  .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 25%;filter:blur(22px) brightness(.55) saturate(1.1);transform:scale(1.15)}
  .portrait{position:absolute;right:max(1.5rem,6vw);top:1.5rem;bottom:1.5rem;height:calc(100% - 3rem);width:auto;max-width:34%;object-fit:contain;border:2px solid var(--gold);box-shadow:0 12px 40px rgba(0,0,0,.55)}
  .txt > *{max-width:min(62%,760px)}
  .om-bg{display:grid;place-items:center;font:700 min(60vw,420px)/1 var(--serif-hi);color:var(--gold);opacity:.14;background:linear-gradient(160deg,#6b3a30,var(--brown))}
  .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,16,12,.35) 0%,rgba(30,16,12,.2) 35%,rgba(30,16,12,.88) 100%)}
  .txt{position:relative;padding:3rem 0 clamp(2rem,5vw,3.5rem)}
  .eyebrow{color:var(--gold);letter-spacing:.26em;font-size:.78rem;font-weight:600;margin:0 0 .6rem}
  h1{color:var(--ivory);font-size:clamp(2.2rem,6vw,4.2rem);line-height:1.08;margin:0;text-shadow:0 2px 18px rgba(0,0,0,.5)}
  .tag{margin:.2rem 0 .9rem;font-size:clamp(1.05rem,2vw,1.35rem);color:var(--sand)}
  .place{display:inline-block;border:1px solid var(--gold);padding:.25rem .9rem;border-radius:999px;font-size:.85rem;background:rgba(0,0,0,.3)}
  .langbar{background:var(--ivory);border-bottom:1px solid var(--sand)}
  .langbar .container{display:flex;justify-content:flex-end;padding:.7rem 0}
  .lang{display:inline-flex;border:1px solid var(--gold);border-radius:999px;overflow:hidden}
  .lang button{min-height:40px;min-width:92px;padding:.3rem 1.1rem;border:0;background:transparent;color:var(--maroon);font:500 .92rem var(--sans);cursor:pointer}
  .lang button.on{background:var(--maroon);color:var(--ivory)}
  .kicker{color:#8a6a35;letter-spacing:.2em;font-size:.75rem;font-weight:600;margin:0 0 .4rem}.kicker.gold{color:var(--gold)}
  h2{font-size:clamp(1.8rem,3.6vw,2.7rem)}
  .head{text-align:center;max-width:760px;margin:0 auto 2.5rem}.head p:last-child{margin:.4rem 0 0}
  .intro{display:grid;grid-template-columns:1.4fr 1fr;gap:clamp(2rem,5vw,4.5rem);align-items:center}
  .lead{font:500 clamp(1.2rem,2.2vw,1.55rem)/1.6 var(--serif);color:var(--maroon)}
  :lang(hi) .lead{font-family:var(--serif-hi)}
  .stats{list-style:none;margin:0;padding:0;display:grid;gap:1rem}
  .stats li{background:var(--maroon);color:var(--ivory);border:1px solid var(--gold);outline:1px solid rgba(178,138,75,.5);outline-offset:-7px;padding:1.2rem 1.5rem;display:flex;align-items:center;gap:1.2rem}
  .stats strong{font:700 2.3rem/1 var(--serif);color:var(--gold);min-width:5.2rem}.stats span{font-size:.92rem;color:var(--sand)}
  .name{grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
  .tile{position:relative;background:var(--ivory);border:1px solid var(--gold);border-top:4px solid var(--gold);padding:1.8rem 1.4rem 1.5rem;text-align:center;transition:transform .3s,box-shadow .3s}
  .tile:hover{transform:translateY(-5px);box-shadow:0 14px 30px rgba(53,36,31,.16)}
  .tile .n{position:absolute;top:.5rem;right:.8rem;font:700 2.4rem/1 var(--serif);color:var(--sand)}
  .tile h3{font-size:1.6rem;margin:0 0 .4rem}.tile p{margin:0}
  .vani{position:relative;overflow:hidden;text-align:center;color:var(--ivory);padding:clamp(3rem,6vw,5rem) 0;background:radial-gradient(circle at 50% 0%,rgba(178,138,75,.3),transparent 60%),linear-gradient(180deg,#4a2420,#2c1a15)}
  .mark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:700 min(60vw,460px)/1 var(--serif-hi);color:var(--gold);opacity:.06;pointer-events:none}
  .vani .container{position:relative;max-width:860px}
  .vani blockquote{margin:0}.vani blockquote p{margin:0;font:500 clamp(1.5rem,3.4vw,2.4rem)/1.6 var(--serif-hi);color:var(--ivory)}
  .by{color:var(--gold);margin:1rem 0 1.6rem}
  .line{list-style:none;margin:0 auto;padding:0;max-width:820px;position:relative}
  .line::before{content:"";position:absolute;left:23px;top:8px;bottom:8px;width:2px;background:linear-gradient(var(--gold),rgba(178,138,75,.2))}
  .line li{position:relative;display:flex;gap:1.3rem;padding-bottom:1.6rem}
  .dot{flex:none;width:48px;height:48px;border-radius:50%;background:var(--maroon);color:var(--gold);border:2px solid var(--gold);display:grid;place-items:center;font:700 1.2rem var(--serif);position:relative;z-index:1}
  .lcard{flex:1;background:var(--white);border:1px solid var(--sand);border-left:3px solid var(--gold);padding:1.2rem 1.4rem}
  .lcard h3{font-size:1.45rem;margin:0}.role{margin:.1rem 0 .5rem;color:#8a6a35;font-size:.88rem;font-weight:600;letter-spacing:.03em}.lcard p:last-child{margin:0}
  .path{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  .pcard,.dcard{background:var(--ivory);border:1px solid var(--gold);outline:1px solid var(--sand);outline-offset:-7px;padding:1.8rem 1.6rem;transition:transform .3s,box-shadow .3s}
  .pcard:hover,.dcard:hover{transform:translateY(-5px);box-shadow:0 14px 30px rgba(53,36,31,.16)}
  .ico{display:grid;place-items:center;width:54px;height:54px;border-radius:50%;background:var(--maroon);border:1px solid var(--gold);font-size:1.5rem;margin-bottom:.9rem}
  .pcard{display:flex;gap:1rem;align-items:flex-start}.pcard .ico{margin:0;flex:none}.pcard p{margin:.2rem 0 0;font-weight:500;color:var(--maroon)}
  .dr{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.dcard{text-align:center}.dcard .ico{margin:0 auto .8rem}.dcard h3{font-size:1.4rem}.dcard p{margin:0;font-style:italic}
  .drl{max-width:760px;margin:2.2rem auto 0;text-align:center;font:500 1.25rem/1.7 var(--serif);color:var(--maroon)}:lang(hi) .drl{font-family:var(--serif-hi)}
  .invoc{color:#8a6a35;letter-spacing:.14em;margin:0 0 .5rem;font-weight:500}
  .seva{display:grid;grid-template-columns:150px 1fr;gap:clamp(1.2rem,4vw,3rem);padding:2.2rem 0;border-top:1px solid var(--sand);scroll-margin-top:calc(var(--header-h) + 12px)}
  .seva:first-of-type{border-top:0}
  .side{position:relative;display:flex;flex-direction:column;align-items:center;gap:.6rem}
  .ring{display:grid;place-items:center;width:104px;height:104px;border-radius:50%;font-size:2.6rem;color:var(--gold);background:radial-gradient(circle,#74402f,var(--maroon));border:2px solid var(--gold);box-shadow:0 0 0 6px var(--ivory),0 0 0 7px var(--gold),0 12px 26px rgba(53,36,31,.25)}
  .no{font:700 2.6rem/1 var(--serif);color:var(--sand)}
  .body h3{font-size:clamp(1.6rem,3vw,2.2rem);margin:0}.body p{max-width:70ch}.body .more{display:inline-block;margin-top:.4rem}
  .adh{position:relative;overflow:hidden;text-align:center;color:var(--ivory);padding:clamp(3.5rem,7vw,5.5rem) 0;background:radial-gradient(circle at 50% 0%,rgba(178,138,75,.3),transparent 60%),linear-gradient(180deg,#4a2420,#2c1a15)}
  .box2{position:relative;max-width:860px}.adh h2{color:var(--ivory)}.adh p{font-size:1.1rem}
  .sank{text-align:center;padding:clamp(3.5rem,7vw,5.5rem) 0;background:radial-gradient(circle at 50% 100%,rgba(178,138,75,.18),transparent 60%),var(--ivory);border-top:3px solid var(--gold)}
  .sank .container{max-width:860px}.sank .kicker.gold{color:#8a6a35}.sank h2{font-size:clamp(1.6rem,3.4vw,2.5rem);line-height:1.5}
  .vande{margin:2rem 0 0;font:700 clamp(1.5rem,3.2vw,2.3rem)/1.5 var(--serif-hi);color:var(--maroon);border-top:1px solid var(--gold);border-bottom:1px solid var(--gold);padding:1rem 0;letter-spacing:.04em}
  .mantra{position:relative;overflow:hidden;text-align:center;color:var(--ivory);padding:clamp(3.5rem,7vw,5.5rem) 0;
    background:radial-gradient(circle at 50% 100%,rgba(178,138,75,.28),transparent 60%),linear-gradient(180deg,#2c1a15,#4a2420)}
  .box{position:relative;max-width:820px}.mantra h2{color:var(--ivory)}
  .sloka{font:600 clamp(1.4rem,3vw,2.2rem)/1.9 var(--serif-hi);color:var(--gold);text-shadow:0 0 24px rgba(232,196,130,.35);margin:.5rem 0 1rem}
  .mean{font-size:1.1rem;color:var(--ivory);margin:0 0 .8rem}.fine{font-size:.85rem;color:var(--sand);font-style:italic;margin:0 0 1.3rem}
  .chips{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap}
  .chips span{border:1px solid var(--gold);padding:.3rem 1.2rem;border-radius:999px;color:var(--gold);letter-spacing:.08em}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,4rem);align-items:center}
  .fest{list-style:none;margin:0;padding:0;display:grid;gap:.6rem}
  .fest li{padding:.7rem 1rem;border-left:3px solid var(--gold);background:var(--sand);font-weight:500;color:var(--maroon)}
  .visit{background:var(--maroon);color:var(--ivory);padding:2rem;border:1px solid var(--gold);outline:1px solid rgba(178,138,75,.5);outline-offset:-8px}
  .visit h3{color:var(--ivory);font-size:1.8rem}.visit a:not(.btn){color:var(--gold);text-decoration:none;font-size:1.05rem}
  .ct{margin:1rem 0 1.4rem}.btns{display:flex;gap:.8rem;flex-wrap:wrap}
  .salute{text-align:center;color:#8a6a35;font-style:italic;margin:3rem 0 0}
  @media(max-width:860px){.intro,.two{grid-template-columns:1fr}.banner{min-height:360px;flex-direction:column;justify-content:flex-end}.portrait{position:relative;right:auto;top:auto;bottom:auto;height:340px;max-width:70%;margin:1.5rem auto 0}.txt > *{max-width:100%}.seva{grid-template-columns:1fr;text-align:left}.side{flex-direction:row;justify-content:flex-start;gap:1rem}.ring{width:76px;height:76px;font-size:1.9rem}.no{font-size:2rem}}
  @media(max-width:520px){.line::before{left:19px}.dot{width:40px;height:40px}.line li{gap:.9rem}}`],
})
export class AboutPageComponent {
  img = HERO_IMG; imgFail = signal(false);
  lang = signal<'en' | 'hi'>('en');
  by = VANI_BY; site = SITE;
  names = NAME; lineage = LINEAGE; fest = FEST;
  intro = INTRO; aims = AIMS; aimsLead = AIMS_LEAD; seva = SEVA; adhyatm = ADHYATM; drishti = DRISHTI; sankalp = SANKALP;
  t(v: readonly string[]) { return this.lang() === 'hi' ? v[0] : v[1]; }
  constructor(title: Title) { title.setTitle(`About Us | ${SITE.short}`); }
}