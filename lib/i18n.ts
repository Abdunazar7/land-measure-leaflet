import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const supportedLanguages = ["en", "ru", "uz"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const resources = {
  en: {
    translation: {
      nav: { home: "Home", tool: "Open tool →" },
      theme: { toLight: "Switch to light mode", toDark: "Switch to dark mode" },
      lang: { label: "Language" },
      sidebar: {
        subtitle: "Land area measurer",
        areasCount: "{{count}} areas",
        searchTitle: "📍 Search location",
        searchPlaceholder: "City, street, area...",
        controlsTitle: "🔧 Controls",
        escHintOn: "ESC to exit",
        drawingOff: "Drawing off",
        drawNew: "Draw new area",
        drawing: "Drawing...",
        drawHelp:
          "Add points on map. Then press Finish in the map (top-right) or double-click map to finish. Result is saved automatically.",
        cancelDrawing: "Cancel drawing",
        clearAll: "Clear all",
        currentResult: "📊 Current result",
        guide: "📖 Guide",
        saved: "💾 Saved measurements",
        deleteAll: "Delete all",
        delete: "Delete",
        emptySaved:
          "No saved results yet. After you measure, it will appear here automatically.",
        footer: "Turf.js (WGS84) • OpenStreetMap",
      },
      map: {
        finish: "Finish ✓",
        cancel: "Cancel ✕",
        pointsAdded: "{{count}} points",
        howToFinish: "Add at least 3 points to enable finish.",
        howToFinishReady: "Press Finish (top-right) or double-click to save.",
        modeDraw: "Drawing mode — tap/click on the map",
        modeEdit: "Edit mode — drag points",
        tipDraw: "Tip: tap points to outline area; press ESC to cancel.",
        tipEdit: "Tip: drag points to adjust the area.",
        layerStreet: "Street (OpenStreetMap)",
        layerSatellite: "Satellite (Esri)",
      },
      footer: {
        tech: "Powered by Leaflet + Turf.js • WGS84 coordinate system",
        tool: "Use the tool →",
      },
      home: {
        badge: "Powered by OpenStreetMap",
      },
    },
  },
  ru: {
    translation: {
      nav: { home: "Главная", tool: "Открыть инструмент →" },
      theme: { toLight: "Переключить на светлую тему", toDark: "Переключить на тёмную тему" },
      lang: { label: "Язык" },
      sidebar: {
        subtitle: "Измеритель площади",
        areasCount: "{{count}} участков",
        searchTitle: "📍 Поиск места",
        searchPlaceholder: "Город, улица, район...",
        controlsTitle: "🔧 Управление",
        escHintOn: "ESC — выйти",
        drawingOff: "Рисование выключено",
        drawNew: "Нарисовать участок",
        drawing: "Рисование...",
        drawHelp:
          "Ставьте точки на карте. Затем нажмите Готово на карте (вверху справа) или дважды кликните по карте. Результат сохранится автоматически.",
        cancelDrawing: "Отменить рисование",
        clearAll: "Очистить всё",
        currentResult: "📊 Текущий результат",
        guide: "📖 Инструкция",
        saved: "💾 Сохранённые измерения",
        deleteAll: "Удалить всё",
        delete: "Удалить",
        emptySaved:
          "Пока нет сохранённых результатов. После измерения они появятся здесь автоматически.",
        footer: "Turf.js (WGS84) • OpenStreetMap",
      },
      map: {
        finish: "Готово ✓",
        cancel: "Отмена ✕",
        pointsAdded: "{{count}} точек",
        howToFinish: "Добавьте минимум 3 точки, чтобы завершить.",
        howToFinishReady:
          "Нажмите Готово (вверху справа) или дважды кликните для сохранения.",
        modeDraw: "Режим рисования — нажимайте на карту",
        modeEdit: "Режим редактирования — перетаскивайте точки",
        tipDraw: "Подсказка: ставьте точки по границе; ESC — отмена.",
        tipEdit: "Подсказка: перетаскивайте точки для корректировки.",
        layerStreet: "Карта (OpenStreetMap)",
        layerSatellite: "Спутник (Esri)",
      },
      footer: {
        tech: "Работает на Leaflet + Turf.js • WGS84",
        tool: "Открыть инструмент →",
      },
      home: {
        badge: "Работает на OpenStreetMap",
      },
    },
  },
  uz: {
    translation: {
      nav: { home: "Bosh sahifa", tool: "Tool ni ochish →" },
      theme: { toLight: "Light modega o‘tish", toDark: "Dark modega o‘tish" },
      lang: { label: "Til" },
      sidebar: {
        subtitle: "Yer maydoni o‘lchagich",
        areasCount: "{{count}} ta maydon",
        searchTitle: "📍 Joylashuv qidirish",
        searchPlaceholder: "Shahar, ko'cha, hudud...",
        controlsTitle: "🔧 Boshqaruv",
        escHintOn: "ESC bilan chiqish mumkin",
        drawingOff: "Chizish o‘chiq",
        drawNew: "Yangi maydon chizish",
        drawing: "Chizilmoqda...",
        drawHelp:
          "Xaritada nuqta qo‘ying. So‘ng xaritadagi yuqori o‘ngdagi Tugatish tugmasini bosing yoki xaritani ikki marta bosing. Natija avtomatik saqlanadi.",
        cancelDrawing: "Chizishni bekor qilish",
        clearAll: "Hammasini tozalash",
        currentResult: "📊 Joriy natija",
        guide: "📖 Yo‘riqnoma",
        saved: "💾 Saqlangan o‘lchovlar",
        deleteAll: "Hammasini o‘chirish",
        delete: "O‘chirish",
        emptySaved:
          "Hozircha saqlangan natija yo‘q. Hisoblaganingizdan keyin bu yerda avtomatik ko‘rinadi.",
        footer: "Turf.js (WGS84) • OpenStreetMap",
      },
      map: {
        finish: "Tugatish ✓",
        cancel: "Bekor qilish ✕",
        pointsAdded: "{{count}} nuqta",
        howToFinish: "Tugatish uchun kamida 3 nuqta qo‘ying.",
        howToFinishReady:
          "Tugatish tugmasini bosing (yuqori o‘ng) yoki ikki marta bosib saqlang.",
        modeDraw: "Chizish rejimi — xaritada bosing",
        modeEdit: "Tahrirlash rejimi — nuqtalarni sudrang",
        tipDraw:
          "💡 Maydon chegarasini bosib belgilang, xato bo‘lsa ESC bosing",
        tipEdit: "💡 Nuqtalarni sudrab maydonni bemalol tahrirlashingiz mumkin",
        layerStreet: "Street (OpenStreetMap)",
        layerSatellite: "Satellite (Esri)",
      },
      footer: {
        tech: "Leaflet + Turf.js asosida ishlaydi • WGS84 koordinat tizimi",
        tool: "Tool ni ishlatish →",
      },
      home: {
        badge: "OpenStreetMap bilan ishlaydi",
      },
    },
  },
} as const;

function safeInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("lang");
  if (stored === "en" || stored === "ru" || stored === "uz") return stored;
  return "en";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

  if (typeof window !== "undefined") {
    void i18n.changeLanguage(safeInitialLanguage());
  }
}

export default i18n;

