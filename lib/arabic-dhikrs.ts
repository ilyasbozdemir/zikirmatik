// Arapça zikirler ve Latin harfli okunuşları
export const arabicDhikrs = [
  {
    name: "سُبْحَانَ اللّهِ",
    transliteration: "Sübhanallah",
    translation: "Allah'ı tüm eksikliklerden tenzih ederim",
    count: 33,
    category: "Tesbih",
    audio: "/audio/subhanallah.mp3",
  },
  {
    name: "اَلْحَمْدُ لِلّهِ",
    transliteration: "Elhamdülillah",
    translation: "Hamd Allah'a mahsustur",
    count: 33,
    category: "Tesbih",
    audio: "/audio/elhamdulillah.mp3",
  },
  {
    name: "اللّهُ أَكْبَرُ",
    transliteration: "Allahu Ekber",
    translation: "Allah en büyüktür",
    count: 33,
    category: "Tesbih",
    audio: "/audio/allahuekber.mp3",
  },
  {
    name: "لَا إِلَهَ إِلَّا اللّهُ",
    transliteration: "La ilahe illallah",
    translation: "Allah'tan başka ilah yoktur",
    count: 100,
    category: "Tevhid",
    audio: "/audio/lailaheillallah.mp3",
  },
  {
    name: "أَسْتَغْفِرُ اللّهَ",
    transliteration: "Estağfirullah",
    translation: "Allah'tan bağışlanma dilerim",
    count: 100,
    category: "İstiğfar",
    audio: "/audio/estagfirullah.mp3",
  },
  {
    name: "حَسْبُنَا اللّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbünallahü ve ni'mel vekil",
    translation: "Allah bize yeter, O ne güzel vekildir",
    count: 33,
    category: "Dua",
    audio: "/audio/hasbunallah.mp3",
  },
  {
    name: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّهِ",
    transliteration: "La havle vela kuvvete illa billah",
    translation: "Güç ve kuvvet ancak Allah'tandır",
    count: 33,
    category: "Dua",
    audio: "/audio/lahavle.mp3",
  },
  {
    name: "سُبْحَانَ اللّهِ وَبِحَمْدِهِ",
    transliteration: "Sübhanallahi ve bihamdihi",
    translation: "Allah'ı hamd ile tenzih ederim",
    count: 100,
    category: "Tesbih",
    audio: "/audio/subhanallahivebihamdihi.mp3",
  },
  {
    name: "سُبْحَانَ اللّهِ الْعَظِيمِ",
    transliteration: "Sübhanallahi'l-azim",
    translation: "Yüce Allah'ı tenzih ederim",
    count: 33,
    category: "Tesbih",
    audio: "/audio/subhanallahilazim.mp3",
  },
  {
    name: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    transliteration: "Allahümme salli ala Muhammed",
    translation: "Allah'ım, Muhammed'e salat eyle",
    count: 100,
    category: "Salavat",
    audio: "/audio/salawat.mp3",
  },
]

// Özel günler ve aylar için zikirler
export const specialDaysDhikrs = [
  {
    name: "Ramazan Ayı",
    dhikrs: [
      {
        name: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        transliteration: "Allahümme inneke afüvvün tühibbül afve fa'fü anni",
        translation: "Allah'ım! Sen affedicisin, affetmeyi seversin, beni de affet",
        count: 100,
        category: "Ramazan",
      },
    ],
  },
  {
    name: "Cuma Günü",
    dhikrs: [
      {
        name: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
        transliteration: "Allahümme salli ala Muhammedin ve ala ali Muhammed",
        translation: "Allah'ım! Muhammed'e ve Muhammed'in ailesine salat eyle",
        count: 100,
        category: "Salavat",
      },
    ],
  },
  {
    name: "Kadir Gecesi",
    dhikrs: [
      {
        name: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        transliteration: "Allahümme inneke afüvvün tühibbül afve fa'fü anni",
        translation: "Allah'ım! Sen affedicisin, affetmeyi seversin, beni de affet",
        count: 1000,
        category: "Kadir Gecesi",
      },
    ],
  },
]

// Namaz sonrası tesbihler
export const prayerDhikrs = [
  {
    name: "Namaz Sonrası Tesbih",
    dhikrs: [
      {
        name: "سُبْحَانَ اللّهِ",
        transliteration: "Sübhanallah",
        count: 33,
        category: "Namaz Sonrası",
      },
      {
        name: "اَلْحَمْدُ لِلّهِ",
        transliteration: "Elhamdülillah",
        count: 33,
        category: "Namaz Sonrası",
      },
      {
        name: "اللّهُ أَكْبَرُ",
        transliteration: "Allahu Ekber",
        count: 33,
        category: "Namaz Sonrası",
      },
      {
        name: "لَا إِلَهَ إِلَّا اللّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration:
          "La ilahe illallahu vahdehu la şerike leh, lehül mülkü ve lehül hamdü ve hüve ala külli şey'in kadir",
        count: 1,
        category: "Namaz Sonrası",
      },
    ],
  },
]

export const commonDhikrs = [
  { name: "Sübhanallah", count: 33, category: "Tesbih" },
  { name: "Elhamdülillah", count: 33, category: "Tesbih" },
  { name: "Allah'ü Ekber", count: 33, category: "Tesbih" },
  { name: "La ilahe illallah", count: 100, category: "Tevhid" },
  { name: "Estağfirullah", count: 100, category: "İstiğfar" },
  { name: "Hasbünallahü ve ni'mel vekil", count: 33, category: "Dua" },
  { name: "La havle vela kuvvete illa billah", count: 33, category: "Dua" },
  { name: "Sübhanallahi ve bihamdihi", count: 100, category: "Tesbih" },
  { name: "Sübhanallahi'l-azim", count: 33, category: "Tesbih" },
]

