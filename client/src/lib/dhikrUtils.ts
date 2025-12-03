// Утилиты для работы с каталогом зикров
import { getAllZikrItems, getZikrItemsBySubcategory, getTodayZikr, zikryCatalog } from './zikryCatalog';
import type { DhikrItem, Category } from './types';
import type { ZikrItem, ZikrCategory } from './zikryCatalog';

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

// Получить все зикры из каталога в формате DhikrItem
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

// Получить зикры по категории
export function getDhikrItemsByCategory(category: Category): DhikrItem[] {
  const categoryData = zikryCatalog.find((cat) => cat.id === category);
  if (!categoryData) return [];
  
  const zikrItems = getAllZikrItems(categoryData.id);
  return zikrItems.map((item) => convertZikrItemToDhikrItem(item, category));
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

// Получить популярные зикры (первые несколько)
export function getPopularDhikrItems(limit = 5): DhikrItem[] {
  // Можно добавить логику на основе статистики использования
  // Пока возвращаем первые из каталога
  return getAllDhikrItems().slice(0, limit);
}

