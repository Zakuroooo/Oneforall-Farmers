# Marathi voice clips — manifest for S9's 🔊 button

**This directory is documentation, not audio.** No mp3s are checked in yet —
generating ~123 short Marathi speech clips is a TTS content pass (Sarvam TTS or
similar, per the original voice design), not something produced inside a coding
session. `src/lib/voice.ts` is the complete, working playback engine
(`react-native-sound`, sequenced, offline — I7); it has nothing to play until
these files exist.

## What to do with this list

1. Generate one short Marathi speech clip per row below — the `text` column is
   exactly what should be spoken, nothing added.
2. Name each file after its `id` column: `<id>.mp3`.
3. **Android**: copy every file into
   `android/app/src/main/res/raw/` (lowercase, underscores only — already true
   of every id below).
4. **iOS**: add the files to the Xcode project so they land in the app bundle
   (`Sound.MAIN_BUNDLE` is how `voice.ts` looks them up).
5. No code change is needed after that — `voice.ts` loads by filename at
   playback time, not at JS bundle time, so dropping in the files is the whole
   remaining step.

## Why the filenames are not the Marathi words

Android resource filenames must match `[a-z0-9_]+` — Devanagari cannot be a
filename. `id` is what `voice.ts` actually requests; `text` is what a human
reads to know what to record or synthesize. `lib/voice.ts`'s `allClipTexts()`
returns this exact same mapping at runtime, so this file and the code cannot
drift silently — regenerate this table from that function if `voice.ts` ever
adds or renames a clip.

## The manifest — 123 clips

| id | text | filename |
|---|---|---|
| `hold` | थांबा | `hold.mp3` |
| `sell_now` | आज विका | `sell_now.mp3` |
| `sell_elsewhere` | दुसऱ्या बाजारात विका | `sell_elsewhere.mp3` |
| `split` | अर्धा आज विका | `split.mp3` |
| `no_advice` | सल्ला नाही | `no_advice.mp3` |
| `days` | दिवस | `days.mp3` |
| `exp_gain` | अपेक्षित फायदा | `exp_gain.mp3` |
| `worst_case` | सर्वात वाईट स्थिती | `worst_case.mp3` |
| `rupees` | रुपये | `rupees.mp3` |
| `rupees_loss` | रुपये तोटा | `rupees_loss.mp3` |
| `quintal` | क्विंटल | `quintal.mp3` |
| `thousand` | हजार | `thousand.mp3` |
| `lakh` | लाख | `lakh.mp3` |
| `minus` | उणे | `minus.mp3` |
| `n0` | शून्य | `n0.mp3` |
| `n1` | एक | `n1.mp3` |
| `n2` | दोन | `n2.mp3` |
| `n3` | तीन | `n3.mp3` |
| `n4` | चार | `n4.mp3` |
| `n5` | पाच | `n5.mp3` |
| `n6` | सहा | `n6.mp3` |
| `n7` | सात | `n7.mp3` |
| `n8` | आठ | `n8.mp3` |
| `n9` | नऊ | `n9.mp3` |
| `n10` | दहा | `n10.mp3` |
| `n11` | अकरा | `n11.mp3` |
| `n12` | बारा | `n12.mp3` |
| `n13` | तेरा | `n13.mp3` |
| `n14` | चौदा | `n14.mp3` |
| `n15` | पंधरा | `n15.mp3` |
| `n16` | सोळा | `n16.mp3` |
| `n17` | सतरा | `n17.mp3` |
| `n18` | अठरा | `n18.mp3` |
| `n19` | एकोणीस | `n19.mp3` |
| `n20` | वीस | `n20.mp3` |
| `n21` | एकवीस | `n21.mp3` |
| `n22` | बावीस | `n22.mp3` |
| `n23` | तेवीस | `n23.mp3` |
| `n24` | चोवीस | `n24.mp3` |
| `n25` | पंचवीस | `n25.mp3` |
| `n26` | सव्वीस | `n26.mp3` |
| `n27` | सत्तावीस | `n27.mp3` |
| `n28` | अठ्ठावीस | `n28.mp3` |
| `n29` | एकोणतीस | `n29.mp3` |
| `n30` | तीस | `n30.mp3` |
| `n31` | एकतीस | `n31.mp3` |
| `n32` | बत्तीस | `n32.mp3` |
| `n33` | तेत्तीस | `n33.mp3` |
| `n34` | चौतीस | `n34.mp3` |
| `n35` | पाचतीस | `n35.mp3` |
| `n36` | छत्तीस | `n36.mp3` |
| `n37` | सदतीस | `n37.mp3` |
| `n38` | अडतीस | `n38.mp3` |
| `n39` | एकोणचाळीस | `n39.mp3` |
| `n40` | चाळीस | `n40.mp3` |
| `n41` | एकचाळीस | `n41.mp3` |
| `n42` | बेचाळीस | `n42.mp3` |
| `n43` | त्रेचाळीस | `n43.mp3` |
| `n44` | चौचाळीस | `n44.mp3` |
| `n45` | पंचाळीस | `n45.mp3` |
| `n46` | सहाचाळीस | `n46.mp3` |
| `n47` | सतचाळीस | `n47.mp3` |
| `n48` | अडचाळीस | `n48.mp3` |
| `n49` | एकोणपन्नास | `n49.mp3` |
| `n50` | पन्नास | `n50.mp3` |
| `n51` | एकपन्नास | `n51.mp3` |
| `n52` | बावन्न | `n52.mp3` |
| `n53` | त्रेपन्न | `n53.mp3` |
| `n54` | चौपन्न | `n54.mp3` |
| `n55` | पंचपन्न | `n55.mp3` |
| `n56` | छापन्न | `n56.mp3` |
| `n57` | सत्तावन्न | `n57.mp3` |
| `n58` | अठ्ठावन्न | `n58.mp3` |
| `n59` | एकोणसाठ | `n59.mp3` |
| `n60` | साठ | `n60.mp3` |
| `n61` | एकसाठ | `n61.mp3` |
| `n62` | बासाठ | `n62.mp3` |
| `n63` | त्रेसाठ | `n63.mp3` |
| `n64` | चौसाठ | `n64.mp3` |
| `n65` | पासष्ट | `n65.mp3` |
| `n66` | सहासाठ | `n66.mp3` |
| `n67` | सदसाठ | `n67.mp3` |
| `n68` | अडसाठ | `n68.mp3` |
| `n69` | एकोणसत्तर | `n69.mp3` |
| `n70` | सत्तर | `n70.mp3` |
| `n71` | एकसत्तर | `n71.mp3` |
| `n72` | बायत्तर | `n72.mp3` |
| `n73` | त्र्याहत्तर | `n73.mp3` |
| `n74` | चौहत्तर | `n74.mp3` |
| `n75` | पंचहत्तर | `n75.mp3` |
| `n76` | शहात्तर | `n76.mp3` |
| `n77` | सतहत्तर | `n77.mp3` |
| `n78` | अठ्ठ्याहत्तर | `n78.mp3` |
| `n79` | एकोणऐंशी | `n79.mp3` |
| `n80` | ऐंशी | `n80.mp3` |
| `n81` | एकऐंशी | `n81.mp3` |
| `n82` | ब्याऐंशी | `n82.mp3` |
| `n83` | त्र्याऐंशी | `n83.mp3` |
| `n84` | चौऱ्याऐंशी | `n84.mp3` |
| `n85` | पंचऐंशी | `n85.mp3` |
| `n86` | शहाऐंशी | `n86.mp3` |
| `n87` | सत्ताऐंशी | `n87.mp3` |
| `n88` | अठ्ठाऐंशी | `n88.mp3` |
| `n89` | एकोणनव्वद | `n89.mp3` |
| `n90` | नव्वद | `n90.mp3` |
| `n91` | एकणव्वद | `n91.mp3` |
| `n92` | ब्याणव्वद | `n92.mp3` |
| `n93` | त्र्याणव्वद | `n93.mp3` |
| `n94` | चौऱ्याणव्वद | `n94.mp3` |
| `n95` | पंचणव्वद | `n95.mp3` |
| `n96` | शहाणव्वद | `n96.mp3` |
| `n97` | सत्ताणव्वद | `n97.mp3` |
| `n98` | अठ्ठाणव्वद | `n98.mp3` |
| `n99` | नऊणव्वद | `n99.mp3` |
| `h1` | शंभर | `h1.mp3` |
| `h2` | दोनशे | `h2.mp3` |
| `h3` | तीनशे | `h3.mp3` |
| `h4` | चारशे | `h4.mp3` |
| `h5` | पाचशे | `h5.mp3` |
| `h6` | सहाशे | `h6.mp3` |
| `h7` | सातशे | `h7.mp3` |
| `h8` | आठशे | `h8.mp3` |
| `h9` | नऊशे | `h9.mp3` |
