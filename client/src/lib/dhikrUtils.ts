// Утилиты для работы с каталогом зикров
import { getAllZikrItems, getZikrItemsBySubcategory, getTodayZikr, zikryCatalog } from './zikryCatalog';
import type { DhikrItem, Category } from './types';
import type { ZikrItem, ZikrCategory } from './zikryCatalog';
import { dhikrApi } from './api';

// Преобразование ZikrItem в DhikrItem
export function convertZikrItemToDhikrItem(zikrItem: ZikrItem, category: Category): DhikrItem {
  return {
    id: zikrItem.id,
    category,
    slug: zikrItem.id,
    titleAr: zikrItem.titleAr,
    titleRu: zikrItem.titleRu,
    titleEn: zikrItem.titleRu, // Используем titleRu как fallback
    transcriptionCyrillic: zikrItem.transcriptionCyrillic,
    transcriptionLatin: zikrItem.transcriptionLatin,
    translation: zikrItem.translation,
  };
}

// Преобразование данных API в DhikrItem
export function convertApiItemToDhikrItem(item: any, category: Category): DhikrItem {
  return {
    id: item.id || item.slug || '',
    category: item.category || category,
    slug: item.slug || item.id || '',
    titleAr: item.titleAr || item.title_ar || '',
    titleRu: item.titleRu || item.title_ru || item.title || '',
    titleEn: item.titleEn || item.title_en || item.title || '',
    transcriptionCyrillic: item.transcriptionCyrillic || item.transcription_cyrillic || '',
    transcriptionLatin: item.transcriptionLatin || item.transcription_latin || '',
    translation: item.translation || '',
  };
}

// Получить все зикры из каталога в формате DhikrItem (fallback на статические данные)
export function getAllDhikrItems(): DhikrItem[] {
  const items: DhikrItem[] = [];
  
  zikryCatalog.forEach((category) => {
    const zikrItems = getAllZikrItems(category.id);
    zikrItems.forEach((zikrItem) => {
      items.push(convertZikrItemToDhikrItem(zikrItem, category.id as Category));
    });
  });
  
  return items;
}

// Получить все зикры с API или fallback на статические данные
export async function getAllDhikrItemsFromAPI(): Promise<DhikrItem[]> {
  try {
    const res = await dhikrApi.getCatalog();
    const catalog = res.catalog;
    
    if (catalog && Array.isArray(catalog)) {
      const items: DhikrItem[] = [];
      catalog.forEach((category: any) => {
        if (category.items && Array.isArray(category.items)) {
          category.items.forEach((item: any) => {
            items.push(convertApiItemToDhikrItem(item, category.id || 'general'));
          });
        }
      });
      return items;
    }
    
    // Если формат другой, возвращаем fallback
    return getAllDhikrItems();
  } catch (error) {
    console.warn("Failed to load catalog from API, using fallback:", error);
    return getAllDhikrItems();
  }
}

// Получить зикры по категории (fallback на статические данные)
export function getDhikrItemsByCategory(category: Category): DhikrItem[] {
  const categoryData = zikryCatalog.find((cat) => cat.id === category);
  if (!categoryData) return [];
  
  const zikrItems = getAllZikrItems(categoryData.id);
  return zikrItems.map((item) => convertZikrItemToDhikrItem(item, category));
}

// Получить зикры по категории с API или fallback
export async function getDhikrItemsByCategoryFromAPI(category: Category): Promise<DhikrItem[]> {
  try {
    const res = await dhikrApi.getCatalogByCategory(category);
    const items = res.items || [];
    
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item: any) => convertApiItemToDhikrItem(item, category));
    }
    
    // Fallback на статические данные
    return getDhikrItemsByCategory(category);
  } catch (error) {
    console.warn(`Failed to load category ${category} from API, using fallback:`, error);
    return getDhikrItemsByCategory(category);
  }
}

// Получить зикры по подкатегории
export function getDhikrItemsBySubcategory(category: Category, subcategoryId: string): DhikrItem[] {
  const categoryData = zikryCatalog.find((cat) => cat.id === category);
  if (!categoryData) return [];
  
  const zikrItems = getZikrItemsBySubcategory(categoryData.id, subcategoryId);
  return zikrItems.map((item) => convertZikrItemToDhikrItem(item, category));
}

// Получить зикр дня
export function getTodayDhikrItem(): DhikrItem | null {
  const todayZikr = getTodayZikr();
  if (!todayZikr) return null;
  
  const category = zikryCatalog.find((cat) => 
    getAllZikrItems(cat.id).some((item) => item.id === todayZikr.id)
  );
  
  if (!category) return null;
  
  return convertZikrItemToDhikrItem(todayZikr, category.id as Category);
}

// Поиск зикров
export function searchDhikrItems(query: string, category?: Category): DhikrItem[] {
  const allItems = category 
    ? getDhikrItemsByCategory(category)
    : getAllDhikrItems();
  
  const lowerQuery = query.toLowerCase();
  
  return allItems.filter((item) =>
    item.titleRu.toLowerCase().includes(lowerQuery) ||
    item.titleAr.includes(query) ||
    item.transcriptionCyrillic?.toLowerCase().includes(lowerQuery) ||
    item.transcriptionLatin?.toLowerCase().includes(lowerQuery)
  );
}

// Найти dhikr item по категории и ID
export function findDhikrItemById(category: Category, itemId: string): DhikrItem | null {
  const items = getDhikrItemsByCategory(category);
  return items.find(item => item.id === itemId) || null;
}

// Получить популярные зикры (первые несколько)
export function getPopularDhikrItems(limit = 5): DhikrItem[] {
  // Можно добавить логику на основе статистики использования
  // Пока возвращаем первые из каталога
  return getAllDhikrItems().slice(0, limit);
}

