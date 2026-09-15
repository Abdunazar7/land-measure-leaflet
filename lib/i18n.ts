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
      units: {
        sqMeters: "Square metres",
        sotka: "Sotka",
        hectares: "Hectares",
        sqKm: "Square km",
        sqMetersShort: "m²",
        sotkaShort: "Sotka",
        hectaresShort: "Hectare",
        acresShort: "Acres",
      },
      search: {
        placeholder: "Search a city, street or place...",
        clear: "Clear",
        recent: "Recent searches",
        clearRecent: "Clear",
        searching: "Searching...",
        noResults: "Nothing found. Try a different spelling.",
        failed: "Search is unavailable right now. Please try again.",
        coordinates: "Go to these coordinates",
        hint: "Tip: you can paste coordinates too, e.g. 41.2995, 69.2401",
      },
      gps: {
        title: "📡 My location",
        myLocation: "Find my location",
        recenter: "Centre on me",
        locating: "Locating...",
        locate: "Show my location",
        following: "Following your location",
        followingShort: "Following",
        stop: "Stop",
        resolving: "Resolving address...",
        accuracy: "Accuracy ±{{metres}} m",
        youAreHere: "You are here",
        errors: {
          denied:
            "Location permission was denied. Allow location access for this site in your browser settings.",
          unavailable:
            "Location is unavailable. Check that GPS / location services are on.",
          timeout: "Locating took too long. Please try again.",
          unsupported: "This browser does not support geolocation.",
          insecure:
            "Location only works over HTTPS (or on localhost). Open the site via https://",
        },
      },
      sidebar: {
        subtitle: "Land area measurer",
        areasCount: "{{count}} areas",
        searchTitle: "📍 Search location",
        controlsTitle: "🔧 Controls",
        escHintOn: "ESC to exit",
        drawingOff: "Drawing off",
        drawNew: "Draw new area",
        drawing: "Drawing...",
        drawHelp:
          "Tap the corners of the plot on the map. Then press Finish, double-click, or click the first point to close the shape. ESC cancels, Ctrl+Z removes the last point.",
        drawHelpOff:
          "Drawing only starts from this button, so you never draw by accident. Drag the points to fine-tune a finished shape.",
        cancelDrawing: "Cancel drawing",
        clearAll: "Clear all",
        currentResult: "📊 Current result",
        guide: "📖 Guide",
        step1: "Search the place, or press the location button to jump to where you are.",
        step2: "Press “Draw new area” and tap each corner of the plot.",
        step3: "Press Finish (or double-click) — area and perimeter appear instantly.",
        step4: "Drag the white points to adjust; every result is saved automatically.",
        saved: "💾 Saved measurements",
        deleteAll: "Delete all",
        delete: "Delete",
        showOnMap: "Show",
        measurement: "Measurement",
        emptySaved:
          "No saved results yet. After you measure, it will appear here automatically.",
        area: "Area",
        perimeter: "Perimeter",
        pointsUsed: "Measured with {{count}} points",
        footer: "Turf.js (WGS84) • OpenStreetMap • Esri imagery",
      },
      map: {
        layers: {
          hybrid: "Hybrid",
          satellite: "Satellite",
          street: "Street",
          dark: "Dark",
        },
        layerTitle: "Map type",
        fullscreen: "Fullscreen",
        exitFullscreen: "Exit fullscreen",
        undo: "Undo",
        finish: "Finish ✓",
        cancel: "Cancel ✕",
        pointsAdded: "{{count}} points",
        needMorePoints: "at least 3 needed",
        readyToFinish: "ready to finish",
        modeDraw: "Drawing mode — tap the corners",
        modeEdit: "Edit mode — drag the points",
        tipDraw: "Tap points to outline the plot; ESC cancels.",
        tipEdit:
          "Drag a point to adjust · click a small point to add one · double-click a point to remove it",
        closeRing: "Click to close the shape",
        insertPoint: "Click to add a point here",
        vertexHint: "Drag to move · double-click to remove",
        deletePolygon: "Delete this area",
        place: "Selected place",
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
      theme: {
        toLight: "Переключить на светлую тему",
        toDark: "Переключить на тёмную тему",
      },
      lang: { label: "Язык" },
      units: {
        sqMeters: "Квадратные метры",
        sotka: "Сотки",
        hectares: "Гектары",
        sqKm: "Квадратные км",
        sqMetersShort: "м²",
        sotkaShort: "Сотка",
        hectaresShort: "Гектар",
        acresShort: "Акры",
      },
      search: {
        placeholder: "Город, улица или место...",
        clear: "Очистить",
        recent: "Недавние запросы",
        clearRecent: "Очистить",
        searching: "Поиск...",
        noResults: "Ничего не найдено. Попробуйте другое написание.",
        failed: "Поиск сейчас недоступен. Попробуйте ещё раз.",
        coordinates: "Перейти к этим координатам",
        hint: "Можно вставить и координаты, например 41.2995, 69.2401",
      },
      gps: {
        title: "📡 Моё местоположение",
        myLocation: "Найти меня",
        recenter: "Центрировать на мне",
        locating: "Определение...",
        locate: "Показать моё местоположение",
        following: "Следуем за вами",
        followingShort: "Следим",
        stop: "Стоп",
        resolving: "Определяем адрес...",
        accuracy: "Точность ±{{metres}} м",
        youAreHere: "Вы здесь",
        errors: {
          denied:
            "Доступ к местоположению запрещён. Разрешите его для этого сайта в настройках браузера.",
          unavailable:
            "Местоположение недоступно. Проверьте, включены ли службы геолокации.",
          timeout: "Определение заняло слишком много времени. Попробуйте снова.",
          unsupported: "Этот браузер не поддерживает геолокацию.",
          insecure:
            "Геолокация работает только по HTTPS (или на localhost). Откройте сайт через https://",
        },
      },
      sidebar: {
        subtitle: "Измеритель площади",
        areasCount: "{{count}} участков",
        searchTitle: "📍 Поиск места",
        controlsTitle: "🔧 Управление",
        escHintOn: "ESC — выйти",
        drawingOff: "Рисование выключено",
        drawNew: "Нарисовать участок",
        drawing: "Рисование...",
        drawHelp:
          "Отмечайте углы участка на карте. Затем нажмите Готово, дважды кликните или нажмите на первую точку. ESC — отмена, Ctrl+Z убирает последнюю точку.",
        drawHelpOff:
          "Рисование включается только этой кнопкой, чтобы вы не начертили случайно. Готовый контур можно поправить, перетаскивая точки.",
        cancelDrawing: "Отменить рисование",
        clearAll: "Очистить всё",
        currentResult: "📊 Текущий результат",
        guide: "📖 Инструкция",
        step1: "Найдите место через поиск или нажмите кнопку геолокации.",
        step2: "Нажмите «Нарисовать участок» и отметьте каждый угол.",
        step3: "Нажмите Готово (или дважды кликните) — площадь появится сразу.",
        step4: "Тяните белые точки для правки; результат сохраняется сам.",
        saved: "💾 Сохранённые измерения",
        deleteAll: "Удалить всё",
        delete: "Удалить",
        showOnMap: "Показать",
        measurement: "Измерение",
        emptySaved:
          "Пока нет сохранённых результатов. После измерения они появятся здесь автоматически.",
        area: "Площадь",
        perimeter: "Периметр",
        pointsUsed: "Измерено по {{count}} точкам",
        footer: "Turf.js (WGS84) • OpenStreetMap • снимки Esri",
      },
      map: {
        layers: {
          hybrid: "Гибрид",
          satellite: "Спутник",
          street: "Карта",
          dark: "Тёмная",
        },
        layerTitle: "Тип карты",
        fullscreen: "На весь экран",
        exitFullscreen: "Выйти из полноэкранного режима",
        undo: "Отменить",
        finish: "Готово ✓",
        cancel: "Отмена ✕",
        pointsAdded: "{{count}} точек",
        needMorePoints: "нужно минимум 3",
        readyToFinish: "можно завершать",
        modeDraw: "Режим рисования — отмечайте углы",
        modeEdit: "Режим правки — тяните точки",
        tipDraw: "Отмечайте точки по границе участка; ESC — отмена.",
        tipEdit:
          "Тяните точку, чтобы поправить · нажмите маленькую точку, чтобы добавить · двойной клик удаляет",
        closeRing: "Нажмите, чтобы замкнуть контур",
        insertPoint: "Нажмите, чтобы добавить точку",
        vertexHint: "Тяните, чтобы переместить · двойной клик удаляет",
        deletePolygon: "Удалить участок",
        place: "Выбранное место",
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
      units: {
        sqMeters: "Kvadrat metr",
        sotka: "Sotka",
        hectares: "Gektar",
        sqKm: "Kvadrat km",
        sqMetersShort: "m²",
        sotkaShort: "Sotka",
        hectaresShort: "Gektar",
        acresShort: "Akr",
      },
      search: {
        placeholder: "Shahar, ko‘cha yoki joy nomi...",
        clear: "Tozalash",
        recent: "Oxirgi qidiruvlar",
        clearRecent: "Tozalash",
        searching: "Qidirilmoqda...",
        noResults: "Hech narsa topilmadi. Boshqacha yozib ko‘ring.",
        failed: "Qidiruv hozir ishlamayapti. Yana bir marta urinib ko‘ring.",
        coordinates: "Shu koordinatalarga o‘tish",
        hint: "Koordinatani ham yozish mumkin, masalan 41.2995, 69.2401",
      },
      gps: {
        title: "📡 Mening joylashuvim",
        myLocation: "Turgan joyimni topish",
        recenter: "Joylashuvimga qaytish",
        locating: "Aniqlanmoqda...",
        locate: "Turgan joyimni ko‘rsatish",
        following: "Joylashuvingiz kuzatilmoqda",
        followingShort: "Kuzatilmoqda",
        stop: "To‘xtatish",
        resolving: "Manzil aniqlanmoqda...",
        accuracy: "Aniqlik ±{{metres}} m",
        youAreHere: "Siz shu yerdasiz",
        errors: {
          denied:
            "Joylashuvga ruxsat berilmadi. Brauzer sozlamalarida bu sayt uchun joylashuvni yoqing.",
          unavailable:
            "Joylashuvni aniqlab bo‘lmadi. GPS yoki joylashuv xizmati yoniqligini tekshiring.",
          timeout: "Aniqlash juda uzoq davom etdi. Yana urinib ko‘ring.",
          unsupported: "Bu brauzer geolokatsiyani qo‘llab-quvvatlamaydi.",
          insecure:
            "Joylashuv faqat HTTPS orqali (yoki localhost da) ishlaydi. Saytni https:// bilan oching.",
        },
      },
      sidebar: {
        subtitle: "Yer maydoni o‘lchagich",
        areasCount: "{{count}} ta maydon",
        searchTitle: "📍 Joylashuv qidirish",
        controlsTitle: "🔧 Boshqaruv",
        escHintOn: "ESC bilan chiqish mumkin",
        drawingOff: "Chizish o‘chiq",
        drawNew: "Yangi maydon chizish",
        drawing: "Chizilmoqda...",
        drawHelp:
          "Yer maydonining burchaklarini xaritada belgilang. So‘ng Tugatish tugmasini bosing, ikki marta bosing yoki birinchi nuqtani bosib yopib qo‘ying. ESC — bekor qilish, Ctrl+Z — oxirgi nuqtani olib tashlash.",
        drawHelpOff:
          "Tasodifan chizilmasligi uchun chizish faqat tugma orqali yoqiladi. Tayyor maydonni nuqtalarini sudrab tuzatish mumkin.",
        cancelDrawing: "Chizishni bekor qilish",
        clearAll: "Hammasini tozalash",
        currentResult: "📊 Joriy natija",
        guide: "📖 Yo‘riqnoma",
        step1: "Joyni qidiruvdan toping yoki joylashuv tugmasi bilan o‘zingiz turgan joyga o‘ting.",
        step2: "“Yangi maydon chizish” ni bosib, yer burchaklarini belgilang.",
        step3: "Tugatish (yoki ikki marta bosish) — maydon va perimetr darhol chiqadi.",
        step4: "Oq nuqtalarni sudrab tuzatasiz; har bir natija avtomatik saqlanadi.",
        saved: "💾 Saqlangan o‘lchovlar",
        deleteAll: "Hammasini o‘chirish",
        delete: "O‘chirish",
        showOnMap: "Ko‘rsatish",
        measurement: "O‘lchov",
        emptySaved:
          "Hozircha saqlangan natija yo‘q. Hisoblaganingizdan keyin bu yerda avtomatik ko‘rinadi.",
        area: "Maydon",
        perimeter: "Perimetr",
        pointsUsed: "{{count}} nuqta bilan belgilangan",
        footer: "Turf.js (WGS84) • OpenStreetMap • Esri sun’iy yo‘ldosh tasviri",
      },
      map: {
        layers: {
          hybrid: "Gibrid",
          satellite: "Sun’iy yo‘ldosh",
          street: "Ko‘cha",
          dark: "Tungi",
        },
        layerTitle: "Xarita turi",
        fullscreen: "Butun ekran",
        exitFullscreen: "Butun ekrandan chiqish",
        undo: "Orqaga",
        finish: "Tugatish ✓",
        cancel: "Bekor qilish ✕",
        pointsAdded: "{{count}} nuqta",
        needMorePoints: "kamida 3 ta kerak",
        readyToFinish: "tugatish mumkin",
        modeDraw: "Chizish rejimi — burchaklarni bosing",
        modeEdit: "Tahrirlash rejimi — nuqtalarni sudrang",
        tipDraw: "Maydon chegarasini bosib belgilang; ESC — bekor qilish.",
        tipEdit:
          "Nuqtani sudrab tuzating · kichik nuqtani bosib yangi nuqta qo‘shing · ikki marta bosib o‘chiring",
        closeRing: "Maydonni yopish uchun bosing",
        insertPoint: "Bu yerga nuqta qo‘shish uchun bosing",
        vertexHint: "Sudrab ko‘chirish · ikki marta bosib o‘chirish",
        deletePolygon: "Bu maydonni o‘chirish",
        place: "Tanlangan joy",
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

  try {
    const stored = window.localStorage.getItem("lang");
    if (stored === "en" || stored === "ru" || stored === "uz") return stored;
  } catch {
    // Fall through to the default language.
  }

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
