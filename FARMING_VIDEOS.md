# Organic Farming page – kaun sa video kis naam se rakhna hai

Sab files is folder me daalein: **`src/assets/farming/`**   (Gaushala ki photo: **`src/assets/gausala.png`**)
Jo file nahi hogi, page par wo apne aap chhup jaati hai (kuch toota nahi dikhega). Naam bilkul aise hi hon (chhote akshar, bina space).

| Screenshot / video (period = duration) | File ka naam | Page me kahan |
|---|---|---|
| Nursery trays, zameen par (0:07) | `nursery-1.mp4` | 01 Nursery |
| Nursery trays (0:31) | `nursery-2.mp4` | 01 Nursery |
| Nursery trays close (1:17) | `nursery-3.mp4` | 01 Nursery |
| Trays deewar ke saath (2:10) | `nursery-4.mp4` | 01 Nursery |
| Transplanter close-up, **vertical** video (Image 2) | `transplanter-1.mp4` | 02 Machine Transplanting |
| Lal transplanter kichad wale khet me (1:04) | `transplanter-2.mp4` | 02 Machine Transplanting |
| Hara khet (0:56) | `crop-1.mp4` | 03 Growing Crop |
| Peela-hara khet, ped ke saath (0:23) | `crop-2.mp4` | 03 Growing Crop |
| Khet me aadmi (0:04) | `crop-3.mp4` | 03 Growing Crop |
| Drone, **vertical** video, saaf aasman (Image 3) | `drone-1.mp4` | 04 Drone Spraying |
| Drone aasman me (0:06) | `drone-2.mp4` | 04 Drone Spraying |
| Drone khet ke upar (0:19) | `drone-3.mp4` | 04 Drone Spraying |

**Photos** (Image 1 jaisi): `photo-01.jpg` hara dhaan close-up, `photo-02.jpg` drone (badal wala aasman), `photo-03.jpg` dhund me pahaad aur ped, phir `photo-04.jpg` ... `photo-08.jpg` (zyada se zyada 8).
Zyada clips chahiye to `src/app/pages/farming-story.ts` ke `STEPS` me ek line copy karke naya naam likh dein.

> Ye mapping maine screenshots ke thumbnail se lagayi hai. Agar koi video alag nikle (jaise 0:23 asal me nursery ho), to bas file ka naam badal dein, kuch aur nahi badalna.

## Video chhote karna (zaroori)
WhatsApp/phone ke video bhaari hote hain. Har video 5-15 MB ke andar rakhein; 1:17 aur 2:10 jaise lambe clips ko 30-40 second tak kaat dein.
Format: **MP4 (H.264)**. ffmpeg se:
```
# landscape (aadi) video
ffmpeg -i input.mp4 -vf "scale=-2:720" -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k -movflags +faststart nursery-1.mp4
# vertical (khadi) video
ffmpeg -i input.mp4 -vf "scale=720:-2" -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k -movflags +faststart drone-1.mp4
# pehle 40 second hi chahiye to -t 40 jod dein:  ffmpeg -i input.mp4 -t 40 ...
```
Bina command ke: HandBrake me preset "Fast 720p30" chuniye, Web Optimized tick karein. `faststart` / Web Optimized zaroor, taaki video turant chalna shuru ho.
S3 par upload ke baad file ka Content-Type `video/mp4` hona chahiye (console se upload karne par apne aap ho jaata hai).
