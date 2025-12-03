export type HabitCategory = 
  | 'namaz' 
  | 'quran' 
  | 'dhikr' 
  | 'sadaqa' 
  | 'knowledge' 
  | 'fasting' 
  | 'etiquette';

export type HabitDifficulty = 'easy' | 'medium' | 'advanced';

export type RepeatType = 
  | 'never' 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'custom';

export type FilterTag = 
  | 'recommended' 
  | 'daily' 
  | 'ramadan' 
  | 'good_deeds' 
  | 'learning'
  | 'beginners'
  | 'women'
  | 'youth';

export interface HabitTemplate {
  id: string;
  category: HabitCategory;
  title: string;
  description: string;
  iconName: string;
  difficulty: HabitDifficulty;
  tags: FilterTag[];
  suggestedRepeat: RepeatType;
  suggestedTime?: string;
  hadithRef?: string;
  linkedToTasbih?: boolean;
  targetCount?: number;
}

export interface HabitCategoryInfo {
  id: HabitCategory;
  title: string;
  iconName: string;
  color: string;
  colorClass: string;
}

export const habitCategories: HabitCategoryInfo[] = [
  { id: 'namaz', title: 'Намазы', iconName: 'Building2', color: '#1a5c41', colorClass: 'bg-emerald-600' },
  { id: 'quran', title: 'Коран', iconName: 'BookOpen', color: '#2563eb', colorClass: 'bg-blue-600' },
  { id: 'dhikr', title: 'Зикр', iconName: 'CircleDot', color: '#7c3aed', colorClass: 'bg-violet-600' },
  { id: 'sadaqa', title: 'Садака', iconName: 'Heart', color: '#ca8a04', colorClass: 'bg-yellow-600' },
  { id: 'knowledge', title: 'Знания', iconName: 'GraduationCap', color: '#0891b2', colorClass: 'bg-cyan-600' },
  { id: 'fasting', title: 'Посты', iconName: 'Moon', color: '#6366f1', colorClass: 'bg-indigo-600' },
  { id: 'etiquette', title: 'Этикет', iconName: 'Smile', color: '#ec4899', colorClass: 'bg-pink-600' },
];

export const filterTags: { id: FilterTag; title: string; iconName: string }[] = [
  { id: 'recommended', title: 'Рекомендуем', iconName: 'Star' },
  { id: 'daily', title: 'Ежедневные', iconName: 'Calendar' },
  { id: 'ramadan', title: 'Рамадан', iconName: 'Moon' },
  { id: 'good_deeds', title: 'Добрые дела', iconName: 'Heart' },
  { id: 'learning', title: 'Обучение', iconName: 'BookOpen' },
  { id: 'beginners', title: 'Для начинающих', iconName: 'Sprout' },
  { id: 'women', title: 'Женщинам', iconName: 'User' },
  { id: 'youth', title: 'Молодёжи', iconName: 'Users' },
];

export const habitsCatalog: HabitTemplate[] = [
  {
    id: 'namaz-duha',
    category: 'namaz',
    title: 'Намаз Духа',
    description: 'Совершать молитву в середине утра',
    iconName: 'Sunrise',
    difficulty: 'medium',
    tags: ['daily', 'recommended'],
    suggestedRepeat: 'daily',
    suggestedTime: '09:00',
  },
  {
    id: 'namaz-tahajjud',
    category: 'namaz',
    title: 'Намаз Тахаджуд',
    description: 'Вставать на ночную молитву',
    iconName: 'Moon',
    difficulty: 'advanced',
    tags: ['recommended', 'ramadan'],
    suggestedRepeat: 'daily',
    suggestedTime: '04:00',
  },
  {
    id: 'namaz-ishraq',
    category: 'namaz',
    title: 'Намаз Ишрак',
    description: 'Молитва после восхода солнца',
    iconName: 'Sun',
    difficulty: 'medium',
    tags: ['daily'],
    suggestedRepeat: 'daily',
    suggestedTime: '07:00',
  },
  {
    id: 'namaz-awwabin',
    category: 'namaz',
    title: 'Намаз Ауваабин',
    description: 'Молитва после Магриба',
    iconName: 'Sunset',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
    suggestedTime: '19:00',
  },
  {
    id: 'wudu-before-sleep',
    category: 'namaz',
    title: 'Совершать вуду перед сном',
    description: 'Усиление баракаи очищение',
    iconName: 'Droplets',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
    suggestedTime: '22:00',
  },
  {
    id: 'pray-in-mosque',
    category: 'namaz',
    title: 'Молиться в мечети',
    description: 'Присутствовать на коллективных намазах',
    iconName: 'Building2',
    difficulty: 'medium',
    tags: ['daily', 'recommended'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'dua-after-namaz',
    category: 'namaz',
    title: 'Делать дуа после каждого намаза',
    description: 'Постоянное поминание Аллаха',
    iconName: 'HandHeart',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
    linkedToTasbih: true,
  },

  {
    id: 'quran-daily',
    category: 'quran',
    title: 'Читать Коран ежедневно',
    description: 'Хотя бы 1 страницу в день',
    iconName: 'BookOpen',
    difficulty: 'easy',
    tags: ['daily', 'beginners', 'recommended'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'surah-yasin',
    category: 'quran',
    title: 'Читать суру Ясин',
    description: 'Ежедневно или по пятницам',
    iconName: 'ScrollText',
    difficulty: 'medium',
    tags: ['recommended', 'daily'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'surah-kahf',
    category: 'quran',
    title: 'Читать суру Аль-Кахф',
    description: 'Каждый пятничный день',
    iconName: 'Mountain',
    difficulty: 'medium',
    tags: ['recommended'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'surah-mulk',
    category: 'quran',
    title: 'Читать суру Аль-Мульк',
    description: 'Каждый вечер перед сном',
    iconName: 'Crown',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
    suggestedTime: '22:00',
  },
  {
    id: 'surah-waqia',
    category: 'quran',
    title: 'Читать суру Аль-Вакиа',
    description: 'Для барака в пропитании',
    iconName: 'Sparkles',
    difficulty: 'medium',
    tags: ['recommended'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'surah-rahman',
    category: 'quran',
    title: 'Читать суру Ар-Рахман',
    description: 'Регулярно размышлять над аяатами',
    iconName: 'Heart',
    difficulty: 'medium',
    tags: ['recommended'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'quran-juz-weekly',
    category: 'quran',
    title: 'Читать 1 джуз в неделю',
    description: 'Для последовательного чтения всего Корана',
    iconName: 'Library',
    difficulty: 'advanced',
    tags: ['learning'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'quran-tajweed',
    category: 'quran',
    title: 'Читать Коран с таджвидом',
    description: 'Исправлять произношение',
    iconName: 'Target',
    difficulty: 'advanced',
    tags: ['learning'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'quran-translation',
    category: 'quran',
    title: 'Изучать переводы Корана',
    description: 'Понимать смысл читаемого',
    iconName: 'FileText',
    difficulty: 'medium',
    tags: ['learning'],
    suggestedRepeat: 'daily',
  },

  {
    id: 'tasbih-after-namaz',
    category: 'dhikr',
    title: '33× СубханАллах, 33× Альхамдулиллях, 34× Аллаху Акбар',
    description: 'После каждого намаза',
    iconName: 'CircleDot',
    difficulty: 'easy',
    tags: ['daily', 'beginners', 'recommended'],
    suggestedRepeat: 'daily',
    linkedToTasbih: true,
    targetCount: 100,
  },
  {
    id: 'istighfar-100',
    category: 'dhikr',
    title: '100× Астагфируллах',
    description: 'Ежедневно для очищения сердца',
    iconName: 'Hand',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
    linkedToTasbih: true,
    targetCount: 100,
  },
  {
    id: 'salawat-100',
    category: 'dhikr',
    title: '100× Салават на Пророка ﷺ',
    description: 'Для благословений',
    iconName: 'Sparkle',
    difficulty: 'easy',
    tags: ['daily', 'recommended'],
    suggestedRepeat: 'daily',
    linkedToTasbih: true,
    targetCount: 100,
  },
  {
    id: 'morning-evening-azkar',
    category: 'dhikr',
    title: 'Утренние и вечерние азкары',
    description: 'До восхода и после захода солнца',
    iconName: 'Sunrise',
    difficulty: 'medium',
    tags: ['daily', 'recommended'],
    suggestedRepeat: 'daily',
    linkedToTasbih: true,
  },
  {
    id: 'la-ilaha-100',
    category: 'dhikr',
    title: 'Зикр "Ля иляха илля Ллах"',
    description: 'Минимум 100 раз в день',
    iconName: 'Gem',
    difficulty: 'easy',
    tags: ['daily'],
    suggestedRepeat: 'daily',
    linkedToTasbih: true,
    targetCount: 100,
  },
  {
    id: 'dua-before-sleep',
    category: 'dhikr',
    title: 'Мольба перед сном',
    description: 'Короткая дуа за день',
    iconName: 'Moon',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
    suggestedTime: '22:30',
  },
  {
    id: 'tadabbur-10min',
    category: 'dhikr',
    title: '10 минут размышлений (тадаббур)',
    description: 'Ежедневно с благодарностью',
    iconName: 'Brain',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
  },

  {
    id: 'sadaqa-thursday',
    category: 'sadaqa',
    title: 'Садака каждый четверг',
    description: 'Малое, но постоянное пожертвование',
    iconName: 'Coins',
    difficulty: 'easy',
    tags: ['good_deeds', 'recommended'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'sadaqa-jariya',
    category: 'sadaqa',
    title: 'Садака-джария',
    description: 'Поддержка проектов, несущих благо',
    iconName: 'Construction',
    difficulty: 'medium',
    tags: ['good_deeds'],
    suggestedRepeat: 'monthly',
  },
  {
    id: 'help-neighbor',
    category: 'sadaqa',
    title: 'Помочь соседу / другу',
    description: 'Простые дела ради довольства Аллаха',
    iconName: 'Handshake',
    difficulty: 'easy',
    tags: ['good_deeds', 'beginners'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'support-orphan',
    category: 'sadaqa',
    title: 'Поддерживать сироту',
    description: 'Постоянно, даже символически',
    iconName: 'Baby',
    difficulty: 'medium',
    tags: ['good_deeds', 'recommended'],
    suggestedRepeat: 'monthly',
  },
  {
    id: 'dua-for-others',
    category: 'sadaqa',
    title: 'Делать дуа за других',
    description: 'Скромное, но великое дело',
    iconName: 'HandHeart',
    difficulty: 'easy',
    tags: ['good_deeds', 'beginners', 'daily'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'sadaqa-from-profit',
    category: 'sadaqa',
    title: 'Давать садаку от прибыли',
    description: 'Благодарность за достаток',
    iconName: 'TrendingUp',
    difficulty: 'medium',
    tags: ['good_deeds'],
    suggestedRepeat: 'monthly',
  },

  {
    id: 'learn-hadith',
    category: 'knowledge',
    title: 'Изучать хадисы',
    description: '1 хадис в день',
    iconName: 'ScrollText',
    difficulty: 'easy',
    tags: ['learning', 'daily', 'beginners'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'fiqh-lesson',
    category: 'knowledge',
    title: 'Смотреть урок по фикху',
    description: '1 раз в неделю',
    iconName: 'Scale',
    difficulty: 'medium',
    tags: ['learning'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'islamic-book',
    category: 'knowledge',
    title: 'Читать исламскую книгу',
    description: '15 мин в день',
    iconName: 'Library',
    difficulty: 'easy',
    tags: ['learning', 'daily'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'mosque-lessons',
    category: 'knowledge',
    title: 'Посещать уроки в мечети',
    description: 'Раз в неделю',
    iconName: 'Building2',
    difficulty: 'medium',
    tags: ['learning'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'listen-lectures',
    category: 'knowledge',
    title: 'Слушать лекции учёных',
    description: 'В дороге или утром',
    iconName: 'Headphones',
    difficulty: 'easy',
    tags: ['learning', 'beginners'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'learn-arabic',
    category: 'knowledge',
    title: 'Изучать арабский язык',
    description: '10 минут в день',
    iconName: 'Languages',
    difficulty: 'advanced',
    tags: ['learning'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'learn-dua',
    category: 'knowledge',
    title: 'Учить дуа с переводом',
    description: '1 новая дуа в неделю',
    iconName: 'FileText',
    difficulty: 'easy',
    tags: ['learning', 'beginners'],
    suggestedRepeat: 'weekly',
  },

  {
    id: 'fast-monday',
    category: 'fasting',
    title: 'Пост по понедельникам',
    description: 'Сунна Пророка ﷺ',
    iconName: 'Moon',
    difficulty: 'medium',
    tags: ['recommended'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'fast-thursday',
    category: 'fasting',
    title: 'Пост по четвергам',
    description: 'Благословенный день',
    iconName: 'Moon',
    difficulty: 'medium',
    tags: ['recommended'],
    suggestedRepeat: 'weekly',
  },
  {
    id: 'fast-white-days',
    category: 'fasting',
    title: 'Пост 13, 14, 15 числа месяца',
    description: 'Белые дни',
    iconName: 'Circle',
    difficulty: 'medium',
    tags: ['recommended'],
    suggestedRepeat: 'monthly',
  },
  {
    id: 'moderate-eating',
    category: 'fasting',
    title: 'Избегать излишков в еде',
    description: 'Умеренность ради здоровья и духовности',
    iconName: 'UtensilsCrossed',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
  },

  {
    id: 'gratitude-morning-evening',
    category: 'etiquette',
    title: 'Благодарить Аллаха утром и вечером',
    description: 'Простая форма шукр',
    iconName: 'Hand',
    difficulty: 'easy',
    tags: ['daily', 'beginners', 'recommended'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'smile-greet',
    category: 'etiquette',
    title: 'Улыбаться и приветствовать других',
    description: 'Сунна поведения',
    iconName: 'Smile',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'call-parents',
    category: 'etiquette',
    title: 'Звонить родителям каждый день',
    description: 'Сохранение родственных уз',
    iconName: 'Phone',
    difficulty: 'easy',
    tags: ['daily', 'recommended'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'check-intention',
    category: 'etiquette',
    title: 'Следить за намерением',
    description: 'Перед каждым делом обновлять ниет',
    iconName: 'MessageCircle',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'tahiyyatul-masjid',
    category: 'etiquette',
    title: 'Не пропускать тахиятуль-масджид',
    description: 'При входе в мечеть',
    iconName: 'Building2',
    difficulty: 'easy',
    tags: ['daily'],
    suggestedRepeat: 'daily',
  },
  {
    id: 'be-punctual',
    category: 'etiquette',
    title: 'Быть пунктуальным',
    description: 'Черта мусульманина',
    iconName: 'Clock',
    difficulty: 'easy',
    tags: ['daily', 'beginners'],
    suggestedRepeat: 'daily',
  },
];

export const difficultyLabels: Record<HabitDifficulty, { label: string; color: string }> = {
  easy: { label: 'Лёгкая', color: 'bg-green-500' },
  medium: { label: 'Средняя', color: 'bg-yellow-500' },
  advanced: { label: 'Продвинутая', color: 'bg-blue-500' },
};

export const repeatLabels: Record<RepeatType, string> = {
  never: 'Никогда',
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
  custom: 'Настроить...',
};

export function getHabitsByCategory(category: HabitCategory): HabitTemplate[] {
  return habitsCatalog.filter(h => h.category === category);
}

export function getHabitsByTag(tag: FilterTag): HabitTemplate[] {
  return habitsCatalog.filter(h => h.tags.includes(tag));
}

export function searchHabits(query: string): HabitTemplate[] {
  const lowerQuery = query.toLowerCase();
  return habitsCatalog.filter(h => 
    h.title.toLowerCase().includes(lowerQuery) || 
    h.description.toLowerCase().includes(lowerQuery)
  );
}
