# Hospital page – photos aur videos kis naam se rakhne hain

Sab files is folder me daalein: **`src/assets/hospital/`**
WhatsApp album me jo **"N of 9"** likha aata hai, wahi number file ke naam me lagayein:

| WhatsApp me | Kya dikhta hai | File ka naam | Page me kahan |
|---|---|---|---|
| 1 of 9 | Kataar, banner aur ambulance | `camp-01.jpg` | 01 Registration & Waiting Area |
| 2 of 9 | Rangeen table par staff | `camp-02.jpg` | 02 Check-up & Consultation |
| 3 of 9 | Table par staff | `camp-03.jpg` | 02 Check-up & Consultation |
| 4 of 9 | Bada pandal, bheed | `camp-04.jpg` | 03 Guru Purnima Gathering |
| 5 of 9 | Pandal (dusra angle) | `camp-05.jpg` | 03 Guru Purnima Gathering |
| 6 of 9 | Video 0:12 (khadi/vertical) | `camp-06.mp4` | "The Camp in Videos" |
| 7 of 9 | Video 0:10 | `camp-07.mp4` | "The Camp in Videos" |
| 8 of 9 | Khadi photo, BP machine wali table | `camp-08.jpg` | 02 Check-up & Consultation |
| 9 of 9 | Bheed aur banner | `camp-09.jpg` | 01 Registration & Waiting Area |

Khadi (vertical) ya aadi (landscape) video/photo apne aap pehchaan li jaati hai. Jo file nahi hogi wo page par chhup jaati hai.
Photo kisi aur section me chahiye to `src/app/pages/hospital-story.ts` me `BLOCKS` ya `VIDEOS` me uska naam badal dein.

## Chhota karna (zaroori)
**Photos:** har photo ~300-500 KB rakhein (lambi side 1600 px). Phone ki 4-6 MB wali photo site ko dheema kar degi.
```
ffmpeg -i input.jpg -vf "scale='min(1600,iw)':-2" -q:v 4 camp-01.jpg
```
(ya squoosh.app / koi bhi image compressor)
**Videos:** MP4 (H.264), 5-15 MB:
```
ffmpeg -i input.mp4 -vf "scale=-2:720" -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k -movflags +faststart camp-06.mp4
# khadi video: scale=720:-2
```

## Zaroori
- Camp ke mareezon ki photos public site par lagane se pehle unki sehmati (consent) ka dhyan rakhein. Jahan chehre saaf aur paas se dikhte hon wahan khaas.
- "1,600+" aur "gurupurnima camp" aapke bataye anusaar likha gaya hai. Agar saal ya sankhya badle to `INITIATIVES` (`src/app/core/content.ts`) aur `hospital-story.ts` ke `TARGET` / `T.stat` me badal dein.
