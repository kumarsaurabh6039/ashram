# Admin panel + Firestore knowledge base – setup (ek baar)

Chatbot ab pehle **Firestore me upload kiye gaye data** se jawab deta hai. Data na mile to fixed jawab:
"इस बारे में अभी मुझे जानकारी नहीं है… इस नंबर पर कॉल करें".

## Kaise kaam karta hai
Admin login → PDF/image/text upload → server Gemini se text padhta hai → parts me todta hai → embeddings banata hai → **Firestore** me save.
Sawal aane par sabse milte-julte parts dhundhe jaate hain; agar koi part kaafi milta nahi (score < `MIN_SIMILARITY`) to AI ko bulaya hi nahi jaata, seedha "jaankari nahi hai" jawab jaata hai. AI ko bhi sirf wahi parts diye jaate hain aur kaha gaya hai ki bahar se kuch na jode.
Browser Firestore ko kabhi nahi chhoota (rules me sab band hai); sab kuch server (Admin SDK) se hota hai.

## 1. Firebase project (Spark / free plan)
1. https://console.firebase.google.com → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. Authentication → **Users → Add user**: admin ka email + password. (Aise 1-2 admin banayein.)
4. **Build → Firestore Database → Create database** (production mode, location `asia-south1` Mumbai).
   Rules tab me `chatbot-server/firestore.rules` ka content daal ke Publish karein (sab block).
5. **Project settings (gear) → Service accounts → Generate new private key** → file ko `chatbot-server/serviceAccount.json` naam se rakhein. **Ise kabhi share/commit na karein.**
6. **Project settings → General → Web API Key** copy karein.

## 2. `chatbot-server/.env`
```
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccount.json
FIREBASE_WEB_API_KEY=<web api key>
ADMIN_EMAILS=admin@yourmail.com,second@yourmail.com   # sirf ye log admin ban sakte hain
CONTACT_PHONE=+91-7000031175
MIN_SIMILARITY=0.58
```
(`GEMINI_API_KEY` pehle se hai – wahi PDF padhne aur embeddings ke kaam aata hai.)

## 3. Chalayein
```
cd chatbot-server
npm install          # firebase-admin aur pdf-lib naye hain
npm run dev
# dusre terminal me, project root me:
npm start
```
Chatbot kholein → upar **⋯** → **Admin login**.

## 4. Kya upload karein (zaroori)
Chatbot sirf wahi bolega jo aap daloge. Ye zaroor daalein:
- **Donation** category: donate kaise karein (bank/UPI/QR ki jaankari) – *Text likhein* se seedha type kar sakte hain.
- **Ashram Info**: kitne bachche, school, hospital, gaushala, suvidhayein, address, samay.
- **Vani / Kahani / Aughoreshwar / Kinaram**: PDFs.

Upload ke baad **Documents → View text** se dekhein ki text sahi padha gaya (Hindi PDFs/images me kabhi galti ho sakti hai). Galat ho to Delete karke dobara daalein ya "Extra note" me sahi text likhein.
**Test** tab me apna sawal daal ke dekhein kaun-sa part milta hai. Agar galat jagah ke jawab aa rahe hon to `MIN_SIMILARITY` badhayein (0.62, 0.65…); agar sahi sawalon par bhi "jaankari nahi" aaye to ghatayein.

## Dhyan rakhne ki baatein
- Server kahin host karna padega (Render / Railway / Cloud Run / VPS). Frontend ko `src/app/chatbot/chatbot.config.ts` me `apiBase` se server ka URL dein, aur server `.env` me `ALLOWED_ORIGIN` apni site par set karein.
- Ek hi server instance chalayein (data memory me cache hota hai). Server restart par Firestore se wapas load ho jaata hai.
- File limit 14 MB. Bade PDF automatic 6-6 page ke hisson me padhe jaate hain, isliye bade kitab me kuch minute lagte hain.
- Gemini free tier ki daily limits hain; bahut saari badi PDFs ek saath na daalein.
- Voice input browser ka hota hai: Chrome / Edge / Android Chrome me chalta hai, https (ya localhost) chahiye. Firefox me nahi.
- Free quotas aur pricing badalte rehte hain – Firebase/Gemini ke official pricing page par check kar lein.

## Render par hosting: server so jaata hai (free plan)
Render ka **free** web service 15 minute tak koi request na aaye to so jaata hai; agli request par jaagne me ~30-60 second lagte hain. Teen raaste:

1. **Keep-alive ping (free):** https://uptimerobot.com ya https://cron-job.org par ek monitor banayein jo har **5 minute** me `https://<aapka-service>.onrender.com/api/health` kholta rahe. Server sota nahi. Free 750 ghante/mahina ek hi service ko 24x7 chalane ke liye kaafi hain (744 ghante), par agar usi account me aur free services hain to ghante kam pad sakte hain. Render ki policy badal sakti hai, isliye https://render.com/docs/free ek baar dekh lein.
2. **Paid instance (sabse bharosemand):** Render ka paid plan (Starter) sota nahi. Agar chatbot hamesha turant jawab de, to yahi sahi hai.
3. **Kuch na karein:** chatbot ab khulte hi server ko jagata hai aur "सेवा शुरू हो रही है…" dikhata hai, aur server jaagte hi pehle Firestore ka data load karta hai tab jawab deta hai. Pehla sawal bas thoda der se aayega.

Render ke settings: Root Directory `chatbot-server`, Build Command `npm install && npm run build`, Start Command `npm start`, aur `.env` ki saari values **Environment** tab me daalein. `serviceAccount.json` ki jagah poori JSON ek variable `FIREBASE_SERVICE_ACCOUNT_JSON` me paste kar sakte hain (file upload nahi karni padegi).

**Ek aur dhyan:** upload ke baad PDF ka padhna server ke andar background me chalta hai. Server beech me so gaya ya restart hua to wo job adhoori reh jaati hai (status "Failed" dikhega, dobara upload karein). Isliye bade PDF upload karte waqt Admin panel kholkar rakhein (wo har 4 second me server ko jagaye rakhta hai), ya keep-alive/paid plan lagayein.

## Frontend ko S3 par rakhna (aur server se jodna)
1. `src/app/chatbot/chatbot.config.ts` me `RENDER_API` me apna Render URL daalein (end me `/api`). Local me ye apne aap `/api` proxy use karta hai.
2. Project root me `npm run build` -> output `dist/aghor-peeth-janseva/browser/`.
3. S3 bucket banayein, us folder ke **andar ki saari files** upload karein (folder nahi).
4. **CloudFront lagayein (zaroori):** S3 ka seedha website URL sirf http hota hai, aur browser me mic (voice) sirf https par chalta hai. CloudFront distribution banayein (origin = bucket, Origin Access Control), Default root object `index.html`, aur Error pages me 403 aur 404 dono ko `/index.html` par **200** ke saath bhejein (warna `/school` jaise pages refresh par fail honge).
5. Render me `ALLOWED_ORIGIN` = apni site ka exact URL (jaise `https://dxxxx.cloudfront.net`, end me `/` nahi). Save karke redeploy.
6. Site kholein -> chatbot -> sawal puchhein. Browser console me CORS error aaye to `ALLOWED_ORIGIN` galat hai.

## Admin Dashboard (website par `/admin`)
Website ke header me **More ▾ → Login**. Wahi email-password jo Firebase me banaya (aur `ADMIN_EMAILS` me hai). Login ke baad dashboard:
- **Overview:** kitni news / photos / chatbot documents hain, aur kuch fail hua to dikhta hai.
- **News:** nayi news likhein (title, category, tareekh, cover photo, short summary, poora samachar), edit, Draft/Publish, delete. Save karte hi `/news` aur home par dikhti hai.
- **Photos:** kai photos ek saath upload (drag & drop), category aur caption, baad me caption/category badal sakte hain, delete. Gallery par category filter apne aap ban jaata hai.
- **Chatbot Training:** PDF / image / text upload, documents dekhna-hatana, aur Test (jo pehle chatbot ke andar tha, ab yahin).

Chatbot ke andar ab admin login nahi hai. Admin ka kaam sirf website ke header ke More → Login se hota hai.

### Photos kahan rakhi jaati hain
Firebase Storage (billing) ki jagah photos **Firestore** me rakhi jaati hain. Browser upload se pehle photo ko chhota kar deta hai (lambi side 1600 px, ~700 KB se kam), isliye phone ki badi photos bhi theek hain. Server unhe `/api/media/<id>` se deta hai aur browser unhe 1 saal yaad rakhta hai.
Free Firestore limit (1 GiB storage, 50,000 reads/din) kuch hazaar photos ke liye kaafi hai. Photos hazaaron me jayein to S3 par shift karna behtar hoga.

### Dhyan rakhein
- Website ki news/photos **server se aati hain**. Render free plan par server so jaye to pehli baar 30-60 second lag sakte hain (isliye UptimeRobot ping lagayein). 6 second me jawab na aaye to site built-in 3 purani news dikha deti hai.
- Jab tak dashboard se ek bhi news publish nahi hoti, wahi 3 built-in news dikhti hain. Ek publish karte hi sirf aapki news dikhti hai.
- Server redeploy karna zaroori hai (naye routes aaye hain), aur frontend dobara `npm run build` karke S3 par upload.
