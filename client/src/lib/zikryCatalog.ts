export type ZikrCategory = 'dua' | 'azkar' | 'salawat' | 'kalima';

export interface ZikrSubcategory {
  id: string;
  titleRu: string;
  titleAr?: string;
  count: number;
  imageUrl?: string;
}

export interface ZikrItem {
  id: string;
  subcategoryId: string;
  titleRu: string;
  titleAr: string;
  transcriptionCyrillic: string;
  transcriptionLatin: string;
  translation: string;
  source?: string;
  benefits?: string;
  isFavorite?: boolean;
}

export interface ZikrCatalogCategory {
  id: ZikrCategory;
  titleRu: string;
  titleAr: string;
  iconName: string;
  description: string;
  subcategories: ZikrSubcategory[];
}

export const duaSubcategories: ZikrSubcategory[] = [
  { id: 'morning-evening', titleRu: 'Утро & вечер', count: 3 },
  { id: 'home-family', titleRu: 'Дом & семья', count: 8 },
  { id: 'food-drink', titleRu: 'Еда & напиток', count: 3 },
  { id: 'travel', titleRu: 'Путешествия', count: 2 },
  { id: 'protection', titleRu: 'Защита', count: 3 },
  { id: 'forgiveness', titleRu: 'Прощение', count: 2 },
];

export const azkarSubcategories: ZikrSubcategory[] = [
  { id: 'morning-evening-azkar', titleRu: 'Утро и вечер', count: 4 },
  { id: 'after-prayer', titleRu: 'После намаза', count: 4 },
  { id: 'sleep', titleRu: 'Перед сном', count: 2 },
  { id: 'dhikr', titleRu: 'Общие зикры', count: 3 },
];

export const salawatSubcategories: ZikrSubcategory[] = [
  { id: 'salawat-ibrahimiya', titleRu: 'Салават Ибрахимия', count: 1 },
  { id: 'salawat-short', titleRu: 'Короткие салаваты', count: 3 },
  { id: 'salawat-friday', titleRu: 'Салават в пятницу', count: 1 },
];

export const kalimaSubcategories: ZikrSubcategory[] = [
  { id: 'kalima-tayyibah', titleRu: 'Калима Таййиба', count: 1 },
  { id: 'kalima-shahadat', titleRu: 'Калима Шахадат', count: 1 },
  { id: 'kalima-tamjid', titleRu: 'Калима Тамджид', count: 1 },
  { id: 'kalima-tawhid', titleRu: 'Калима Таухид', count: 1 },
  { id: 'kalima-astaghfar', titleRu: 'Калима Истигфар', count: 1 },
  { id: 'kalima-radde-kufr', titleRu: 'Калима Радд-э-Куфр', count: 1 },
];

export const zikryCatalog: ZikrCatalogCategory[] = [
  {
    id: 'dua',
    titleRu: 'Дуа',
    titleAr: 'الدعاء',
    iconName: 'HandHeart',
    description: 'Мольбы на все случаи жизни',
    subcategories: duaSubcategories,
  },
  {
    id: 'azkar',
    titleRu: 'Азкары',
    titleAr: 'الأذكار',
    iconName: 'Moon',
    description: 'Поминание Аллаха',
    subcategories: azkarSubcategories,
  },
  {
    id: 'salawat',
    titleRu: 'Салаваты',
    titleAr: 'الصلوات',
    iconName: 'Sparkles',
    description: 'Благословения Пророку ﷺ',
    subcategories: salawatSubcategories,
  },
  {
    id: 'kalima',
    titleRu: 'Калимы',
    titleAr: 'الكلمات',
    iconName: 'Quote',
    description: '6 калим Ислама',
    subcategories: kalimaSubcategories,
  },
];

export const duaItems: ZikrItem[] = [
  {
    id: 'dua-me-1',
    subcategoryId: 'morning-evening',
    titleRu: 'Утренний зикр',
    titleAr: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
    transcriptionCyrillic: 'Асбахна ва асбахаль-мульку лиллях',
    transcriptionLatin: 'Asbahna wa asbahal-mulku lillah',
    translation: 'Мы встретили утро, и вся власть принадлежит Аллаху',
    source: 'Муслим',
  },
  {
    id: 'dua-me-2',
    subcategoryId: 'morning-evening',
    titleRu: 'Вечерний зикр',
    titleAr: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ',
    transcriptionCyrillic: 'Амсайна ва амсаль-мульку лиллях',
    transcriptionLatin: 'Amsayna wa amsal-mulku lillah',
    translation: 'Мы встретили вечер, и вся власть принадлежит Аллаху',
    source: 'Муслим',
  },
  {
    id: 'dua-me-3',
    subcategoryId: 'morning-evening',
    titleRu: 'Господин истигфар',
    titleAr: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ',
    transcriptionCyrillic: 'Аллахумма анта Рабби ля иляха илля Анта',
    transcriptionLatin: 'Allahumma anta Rabbi la ilaha illa Anta',
    translation: 'О Аллах, Ты - мой Господь, нет божества, кроме Тебя',
    source: 'аль-Бухари',
    benefits: 'Лучший истигфар, читается утром и вечером',
  },
  {
    id: 'dua-hf-1',
    subcategoryId: 'home-family',
    titleRu: 'При ношении одежды',
    titleAr: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ',
    transcriptionCyrillic: 'Альхамду лилляхи ллязи касани хаза ва разакани-хи',
    transcriptionLatin: 'Alhamdu lillahilladhi kasani hadha wa razaqanihi',
    translation: 'Хвала Аллаху, Который одел меня в это и наделил меня этим',
    source: 'Абу Дауд, ат-Тирмизи',
  },
  {
    id: 'dua-hf-2',
    subcategoryId: 'home-family',
    titleRu: 'Перед входом в туалет',
    titleAr: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ',
    transcriptionCyrillic: 'Аллахумма инни аузу бика миналь-хубси валь-хабаис',
    transcriptionLatin: 'Allahumma inni a\'udhu bika minal-khubthi wal-khaba\'ith',
    translation: 'О Аллах, я прибегаю к Тебе от джиннов мужского и женского пола',
    source: 'аль-Бухари, Муслим',
  },
  {
    id: 'dua-hf-3',
    subcategoryId: 'home-family',
    titleRu: 'После выхода из туалета',
    titleAr: 'غُفْرَانَكَ',
    transcriptionCyrillic: 'Гуфранак',
    transcriptionLatin: 'Ghufranaka',
    translation: 'Прошу Твоего прощения',
    source: 'Абу Дауд, ат-Тирмизи',
  },
  {
    id: 'dua-hf-4',
    subcategoryId: 'home-family',
    titleRu: 'При выходе из дома',
    titleAr: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transcriptionCyrillic: 'Бисмилляхи таваккальту аляллях, ва ля хауля ва ля куввата илля биллях',
    transcriptionLatin: 'Bismillahi tawakkaltu alallah, wa la hawla wa la quwwata illa billah',
    translation: 'Во имя Аллаха, я уповаю на Аллаха, и нет силы и мощи, кроме как от Аллаха',
    source: 'Абу Дауд, ат-Тирмизи',
  },
  {
    id: 'dua-hf-5',
    subcategoryId: 'home-family',
    titleRu: 'При входе в дом',
    titleAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ',
    transcriptionCyrillic: 'Аллахумма инни асъалюка хайраль-мауляджи ва хайраль-махраджи',
    transcriptionLatin: 'Allahumma inni as\'aluka khayral-mawlaji wa khayral-makhraji',
    translation: 'О Аллах, я прошу Тебя о благе входа и благе выхода',
    source: 'Абу Дауд',
  },
  {
    id: 'dua-hf-6',
    subcategoryId: 'home-family',
    titleRu: 'При взгляде в зеркало',
    titleAr: 'اللَّهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي',
    transcriptionCyrillic: 'Аллахумма анта хассанта халки фахассин хулюки',
    transcriptionLatin: 'Allahumma anta hassanta khalqi fahassin khuluqi',
    translation: 'О Аллах, Ты сотворил меня прекрасным, так сделай прекрасным и мой нрав',
    source: 'Ибн ас-Сунни',
  },
  {
    id: 'dua-hf-7',
    subcategoryId: 'home-family',
    titleRu: 'Перед сном',
    titleAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transcriptionCyrillic: 'Бисмика Аллахумма амуту ва ахйа',
    transcriptionLatin: 'Bismika Allahumma amutu wa ahya',
    translation: 'С Твоим именем, о Аллах, я умираю и живу',
    source: 'аль-Бухари',
  },
  {
    id: 'dua-hf-8',
    subcategoryId: 'home-family',
    titleRu: 'При пробуждении',
    titleAr: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transcriptionCyrillic: 'Альхамду лилляхиллязи ахйяна баъда ма аматана ва илейхин-нушур',
    transcriptionLatin: 'Alhamdu lillahilladhi ahyana ba\'da ma amatana wa ilayhil-nushur',
    translation: 'Хвала Аллаху, Который оживил нас после того, как умертвил, и к Нему воскресение',
    source: 'аль-Бухари',
  },
  {
    id: 'dua-fd-1',
    subcategoryId: 'food-drink',
    titleRu: 'Перед едой',
    titleAr: 'بِسْمِ اللَّهِ',
    transcriptionCyrillic: 'Бисмиллях',
    transcriptionLatin: 'Bismillah',
    translation: 'Во имя Аллаха',
    source: 'аль-Бухари, Муслим',
    benefits: 'Если забыл сказать вначале: "Бисмилляхи фи аввалихи ва ахирихи"',
  },
  {
    id: 'dua-fd-2',
    subcategoryId: 'food-drink',
    titleRu: 'После еды',
    titleAr: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transcriptionCyrillic: 'Альхамду лилляхиллязи атъамани хаза ва разакани-хи мин гайри хаулин минни ва ля куввах',
    transcriptionLatin: 'Alhamdu lillahilladhi at\'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah',
    translation: 'Хвала Аллаху, Который накормил меня этим и наделил меня этим без моей силы и мощи',
    source: 'Абу Дауд, ат-Тирмизи',
  },
  {
    id: 'dua-fd-3',
    subcategoryId: 'food-drink',
    titleRu: 'При разговении',
    titleAr: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transcriptionCyrillic: 'Захаба-ззама-у ва-бталлатиль-уруку ва сабаталь-аджру ин шаа Аллах',
    transcriptionLatin: 'Dhahaba-zzama\'u wabtallatil-\'uruqu wa thabatal-ajru in sha\'Allah',
    translation: 'Ушла жажда, наполнились жилы, и награда утвердилась, если пожелает Аллах',
    source: 'Абу Дауд',
  },
  {
    id: 'dua-tr-1',
    subcategoryId: 'travel',
    titleRu: 'При посадке в транспорт',
    titleAr: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',
    transcriptionCyrillic: 'Субханаллязи саххара ляна хаза ва ма кунна ляху мукринин',
    transcriptionLatin: 'Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin',
    translation: 'Пресвят Тот, Кто подчинил нам это, а сами мы не могли бы этого сделать',
    source: 'Сура аз-Зухруф, 13',
  },
  {
    id: 'dua-tr-2',
    subcategoryId: 'travel',
    titleRu: 'Дуа путешественника',
    titleAr: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى',
    transcriptionCyrillic: 'Аллахумма инна насъалюка фи сафарина хазаль-бирра ват-таква',
    transcriptionLatin: 'Allahumma inna nas\'aluka fi safarina hadhal-birra wat-taqwa',
    translation: 'О Аллах, мы просим у Тебя в этом нашем путешествии благочестия и богобоязненности',
    source: 'Муслим',
  },
  {
    id: 'dua-pr-1',
    subcategoryId: 'protection',
    titleRu: 'От сглаза и зависти',
    titleAr: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transcriptionCyrillic: 'Аузу бикалиматиллахит-таммати мин шарри ма халяк',
    transcriptionLatin: 'A\'udhu bikalimati-llahit-tammati min sharri ma khalaq',
    translation: 'Прибегаю к совершенным словам Аллаха от зла того, что Он сотворил',
    source: 'Муслим',
    benefits: 'Читается 3 раза утром и вечером',
  },
  {
    id: 'dua-pr-2',
    subcategoryId: 'protection',
    titleRu: 'При страхе',
    titleAr: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ',
    transcriptionCyrillic: 'Хасбия Аллаху ля иляха илля хува, алейхи таваккальту',
    transcriptionLatin: 'Hasbiyallahu la ilaha illa huwa, alayhi tawakkaltu',
    translation: 'Мне достаточно Аллаха, нет божества, кроме Него, на Него я уповаю',
    source: 'Абу Дауд',
  },
  {
    id: 'dua-pr-3',
    subcategoryId: 'protection',
    titleRu: 'При гневе',
    titleAr: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    transcriptionCyrillic: 'Аузу билляхи минаш-шайтанир-раджим',
    transcriptionLatin: 'A\'udhu billahi minash-shaytanir-rajim',
    translation: 'Прибегаю к Аллаху от проклятого шайтана',
    source: 'аль-Бухари, Муслим',
  },
  {
    id: 'dua-fg-1',
    subcategoryId: 'forgiveness',
    titleRu: 'Саййидуль-истигфар',
    titleAr: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    transcriptionCyrillic: 'Аллахумма анта Рабби, ля иляха илля Анта, халяктани ва ана абдук',
    transcriptionLatin: 'Allahumma anta Rabbi, la ilaha illa Anta, khalaqtani wa ana abduka',
    translation: 'О Аллах, Ты - мой Господь, нет божества, кроме Тебя, Ты создал меня, и я - Твой раб',
    source: 'аль-Бухари',
    benefits: 'Лучший из истигфаров',
  },
  {
    id: 'dua-fg-2',
    subcategoryId: 'forgiveness',
    titleRu: 'Простой истигфар',
    titleAr: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transcriptionCyrillic: 'Астагфируллах ва атубу илейхи',
    transcriptionLatin: 'Astaghfirullah wa atubu ilayhi',
    translation: 'Прошу прощения у Аллаха и каюсь перед Ним',
    source: 'аль-Бухари, Муслим',
    benefits: '100 раз в день',
  },
];

export const azkarItems: ZikrItem[] = [
  {
    id: 'azkar-me-1',
    subcategoryId: 'morning-evening-azkar',
    titleRu: 'Аятуль-Курси',
    titleAr: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    transcriptionCyrillic: 'Аллаху ля иляха илля хуваль-хаййуль-каййум',
    transcriptionLatin: 'Allahu la ilaha illa huwal-hayyul-qayyum',
    translation: 'Аллах - нет божества, кроме Него, Живого, Вседержителя',
    source: 'Сура аль-Бакара, 255',
    benefits: 'Защита от зла',
  },
  {
    id: 'azkar-me-2',
    subcategoryId: 'morning-evening-azkar',
    titleRu: 'Сура аль-Ихлас',
    titleAr: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    transcriptionCyrillic: 'Куль хуаллаху ахад',
    transcriptionLatin: 'Qul huwa-llahu ahad',
    translation: 'Скажи: Он - Аллах Единый',
    source: 'Сура аль-Ихлас',
    benefits: '3 раза утром и вечером',
  },
  {
    id: 'azkar-me-3',
    subcategoryId: 'morning-evening-azkar',
    titleRu: 'Сура аль-Фаляк',
    titleAr: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    transcriptionCyrillic: 'Куль аузу бираббиль-фаляк',
    transcriptionLatin: 'Qul a\'udhu birabbil-falaq',
    translation: 'Скажи: Прибегаю к Господу рассвета',
    source: 'Сура аль-Фаляк',
    benefits: '3 раза утром и вечером',
  },
  {
    id: 'azkar-me-4',
    subcategoryId: 'morning-evening-azkar',
    titleRu: 'Сура ан-Нас',
    titleAr: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transcriptionCyrillic: 'Куль аузу бирабби-ннас',
    transcriptionLatin: 'Qul a\'udhu birabbin-nas',
    translation: 'Скажи: Прибегаю к Господу людей',
    source: 'Сура ан-Нас',
    benefits: '3 раза утром и вечером',
  },
  {
    id: 'azkar-ap-1',
    subcategoryId: 'after-prayer',
    titleRu: 'СубханАллах (33 раза)',
    titleAr: 'سُبْحَانَ اللَّهِ',
    transcriptionCyrillic: 'СубханАллах',
    transcriptionLatin: 'SubhanAllah',
    translation: 'Пресвят Аллах',
    source: 'аль-Бухари, Муслим',
    benefits: '33 раза после каждого намаза',
  },
  {
    id: 'azkar-ap-2',
    subcategoryId: 'after-prayer',
    titleRu: 'Альхамдулиллях (33 раза)',
    titleAr: 'الْحَمْدُ لِلَّهِ',
    transcriptionCyrillic: 'Альхамдулиллях',
    transcriptionLatin: 'Alhamdulillah',
    translation: 'Хвала Аллаху',
    source: 'аль-Бухари, Муслим',
    benefits: '33 раза после каждого намаза',
  },
  {
    id: 'azkar-ap-3',
    subcategoryId: 'after-prayer',
    titleRu: 'Аллаху Акбар (34 раза)',
    titleAr: 'اللَّهُ أَكْبَرُ',
    transcriptionCyrillic: 'Аллаху Акбар',
    transcriptionLatin: 'Allahu Akbar',
    translation: 'Аллах Велик',
    source: 'аль-Бухари, Муслим',
    benefits: '34 раза после каждого намаза',
  },
  {
    id: 'azkar-ap-4',
    subcategoryId: 'after-prayer',
    titleRu: 'Тасбих после намаза',
    titleAr: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transcriptionCyrillic: 'Ля иляха илляллаху вахдаху ля шарика лях',
    transcriptionLatin: 'La ilaha illallahu wahdahu la sharika lah',
    translation: 'Нет божества, кроме Аллаха, Единственного, без сотоварища',
    source: 'аль-Бухари, Муслим',
  },
  {
    id: 'azkar-sl-1',
    subcategoryId: 'sleep',
    titleRu: 'Перед сном',
    titleAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transcriptionCyrillic: 'Бисмика Аллахумма амуту ва ахйа',
    transcriptionLatin: 'Bismika Allahumma amutu wa ahya',
    translation: 'С Твоим именем, о Аллах, я умираю и живу',
    source: 'аль-Бухари',
  },
  {
    id: 'azkar-sl-2',
    subcategoryId: 'sleep',
    titleRu: 'Аятуль-Курси перед сном',
    titleAr: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    transcriptionCyrillic: 'Аллаху ля иляха илля хуваль-хаййуль-каййум',
    transcriptionLatin: 'Allahu la ilaha illa huwal-hayyul-qayyum',
    translation: 'Аллах - нет божества, кроме Него, Живого, Вседержителя',
    source: 'аль-Бухари',
    benefits: 'Защита от шайтана до утра',
  },
  {
    id: 'azkar-dh-1',
    subcategoryId: 'dhikr',
    titleRu: 'Ля хауля ва ля куввата',
    titleAr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transcriptionCyrillic: 'Ля хауля ва ля куввата илля биллях',
    transcriptionLatin: 'La hawla wa la quwwata illa billah',
    translation: 'Нет силы и мощи, кроме как от Аллаха',
    source: 'аль-Бухари, Муслим',
    benefits: 'Сокровище из сокровищ Рая',
  },
  {
    id: 'azkar-dh-2',
    subcategoryId: 'dhikr',
    titleRu: 'СубханАллахи ва бихамдихи',
    titleAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transcriptionCyrillic: 'СубханАллахи ва бихамдихи',
    transcriptionLatin: 'SubhanAllahi wa bihamdihi',
    translation: 'Пресвят Аллах и хвала Ему',
    source: 'аль-Бухари, Муслим',
    benefits: '100 раз в день - прощаются грехи',
  },
  {
    id: 'azkar-dh-3',
    subcategoryId: 'dhikr',
    titleRu: 'СубханАллахиль-Азым',
    titleAr: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    transcriptionCyrillic: 'СубханАллахиль-Азыми ва бихамдихи',
    transcriptionLatin: 'SubhanAllahil-Azimi wa bihamdihi',
    translation: 'Пресвят Аллах Великий и хвала Ему',
    source: 'аль-Бухари, Муслим',
    benefits: 'Легки на языке, тяжелы на весах',
  },
];

export const salawatItems: ZikrItem[] = [
  {
    id: 'salawat-1',
    subcategoryId: 'salawat-ibrahimiya',
    titleRu: 'Салават Ибрахимия',
    titleAr: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ',
    transcriptionCyrillic: 'Аллахумма салли аля Мухаммадин ва аля али Мухаммад, кама салляйта аля Ибрахима',
    transcriptionLatin: 'Allahumma salli ala Muhammadin wa ala ali Muhammad, kama sallayta ala Ibrahim',
    translation: 'О Аллах, благослови Мухаммада и семью Мухаммада, как Ты благословил Ибрахима',
    source: 'аль-Бухари',
    benefits: 'Читается в ташаххуде намаза',
  },
  {
    id: 'salawat-2',
    subcategoryId: 'salawat-short',
    titleRu: 'Короткий салават',
    titleAr: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
    transcriptionCyrillic: 'Саллаллаху алейхи ва саллям',
    transcriptionLatin: 'Sallallahu alayhi wa sallam',
    translation: 'Да благословит его Аллах и приветствует',
    source: 'Сунна',
  },
  {
    id: 'salawat-3',
    subcategoryId: 'salawat-short',
    titleRu: 'Аллахумма салли',
    titleAr: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    transcriptionCyrillic: 'Аллахумма салли аля Мухаммад',
    transcriptionLatin: 'Allahumma salli ala Muhammad',
    translation: 'О Аллах, благослови Мухаммада',
    source: 'Сунна',
  },
  {
    id: 'salawat-4',
    subcategoryId: 'salawat-short',
    titleRu: 'Салават с приветствием',
    titleAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    transcriptionCyrillic: 'Аллахумма салли ва саллим аля набиййина Мухаммад',
    transcriptionLatin: 'Allahumma salli wa sallim ala nabiyyina Muhammad',
    translation: 'О Аллах, благослови и приветствуй нашего Пророка Мухаммада',
    source: 'Хадис',
  },
  {
    id: 'salawat-5',
    subcategoryId: 'salawat-friday',
    titleRu: 'Салават в пятницу',
    titleAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    transcriptionCyrillic: 'Аллахумма салли ва саллим ва барик аля набиййина Мухаммад',
    transcriptionLatin: 'Allahumma salli wa sallim wa barik ala nabiyyina Muhammad',
    translation: 'О Аллах, благослови, приветствуй и одари баракой нашего Пророка Мухаммада',
    source: 'Хадис',
    benefits: 'Особенно рекомендуется в пятницу',
  },
];

export const kalimaItems: ZikrItem[] = [
  {
    id: 'kalima-1',
    subcategoryId: 'kalima-tayyibah',
    titleRu: 'Калима Таййиба (Слово Чистоты)',
    titleAr: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
    transcriptionCyrillic: 'Ля иляха илляллаху Мухаммадур-расулюллах',
    transcriptionLatin: 'La ilaha illallahu Muhammadur-Rasulullah',
    translation: 'Нет божества, кроме Аллаха, Мухаммад - Посланник Аллаха',
    benefits: 'Первая и главная калима, основа Ислама',
  },
  {
    id: 'kalima-2',
    subcategoryId: 'kalima-shahadat',
    titleRu: 'Калима Шахадат (Свидетельство)',
    titleAr: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transcriptionCyrillic: 'Ашхаду алля иляха илляллах ва ашхаду анна Мухаммадан абдуху ва расулюх',
    transcriptionLatin: 'Ashhadu alla ilaha illallah wa ashhadu anna Muhammadan abduhu wa rasuluh',
    translation: 'Я свидетельствую, что нет божества, кроме Аллаха, и свидетельствую, что Мухаммад - Его раб и посланник',
    benefits: 'Произносится при принятии Ислама',
  },
  {
    id: 'kalima-3',
    subcategoryId: 'kalima-tamjid',
    titleRu: 'Калима Тамджид (Славословие)',
    titleAr: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ',
    transcriptionCyrillic: 'СубханАллахи вальхамдулилляхи ва ля иляха илляллаху валлаху акбар',
    transcriptionLatin: 'SubhanAllahi walhamdulillahi wa la ilaha illallahu wallahu akbar',
    translation: 'Пресвят Аллах, хвала Аллаху, нет божества, кроме Аллаха, Аллах Велик',
    benefits: 'Любимые слова Аллаха',
  },
  {
    id: 'kalima-4',
    subcategoryId: 'kalima-tawhid',
    titleRu: 'Калима Таухид (Единобожие)',
    titleAr: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ',
    transcriptionCyrillic: 'Ля иляха илляллаху вахдаху ля шарика лях, ляхуль-мульку ва ляхуль-хамду',
    transcriptionLatin: 'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu',
    translation: 'Нет божества, кроме Аллаха, Единственного, без сотоварища. Ему принадлежит власть и хвала',
    benefits: 'Рекомендуется читать 100 раз в день',
  },
  {
    id: 'kalima-5',
    subcategoryId: 'kalima-astaghfar',
    titleRu: 'Калима Истигфар (Покаяние)',
    titleAr: 'أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ أَذْنَبْتُهُ',
    transcriptionCyrillic: 'Астагфируллаха Рабби мин кулли занбин азнабтуху',
    transcriptionLatin: 'Astaghfirullaha Rabbi min kulli dhambin adhnabtuhu',
    translation: 'Прошу прощения у Аллаха, моего Господа, за каждый грех, который я совершил',
    benefits: 'Мольба о прощении грехов',
  },
  {
    id: 'kalima-6',
    subcategoryId: 'kalima-radde-kufr',
    titleRu: 'Калима Радд-э-Куфр (Отречение от неверия)',
    titleAr: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ',
    transcriptionCyrillic: 'Аллахумма инни аузу бика мин ан ушрика бика шайъан ва ана аляму',
    transcriptionLatin: 'Allahumma inni a\'udhu bika min an ushrika bika shay\'an wa ana a\'lamu',
    translation: 'О Аллах, я прибегаю к Тебе от того, чтобы приобщить к Тебе сотоварищей сознательно',
    benefits: 'Защита от ширка',
  },
];

export function getZikrItemsBySubcategory(category: ZikrCategory, subcategoryId: string): ZikrItem[] {
  switch (category) {
    case 'dua':
      return duaItems.filter(item => item.subcategoryId === subcategoryId);
    case 'azkar':
      return azkarItems.filter(item => item.subcategoryId === subcategoryId);
    case 'salawat':
      return salawatItems.filter(item => item.subcategoryId === subcategoryId);
    case 'kalima':
      return kalimaItems.filter(item => item.subcategoryId === subcategoryId);
    default:
      return [];
  }
}

export function getAllZikrItems(category: ZikrCategory): ZikrItem[] {
  switch (category) {
    case 'dua':
      return duaItems;
    case 'azkar':
      return azkarItems;
    case 'salawat':
      return salawatItems;
    case 'kalima':
      return kalimaItems;
    default:
      return [];
  }
}

export function getTodayZikr(): ZikrItem | null {
  const today = new Date().getDay();
  const allDua = duaItems;
  if (allDua.length > 0) {
    return allDua[today % allDua.length];
  }
  return null;
}
