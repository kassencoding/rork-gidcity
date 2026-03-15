export type Language = "kk" | "ru" | "en";

export interface Translations {
  welcome1: string;
  welcome2: string;
  gidCity: string;
  services: string;
  work: string;
  mainMenu: string;
  settings: string;
  calendar: string;
  notifications: string;
  aiAssistant: string;
  askGidAssistant: string;
  
  order: string;
  createRequest: string;
  booking: string;
  comingSoon: string;
  serviceAds: string;
  listOfAdvertisements: string;
  cityChat: string;
  yourCityFeed: string;
  messenger: string;
  dialogs: string;
  wallet: string;
  balance: string;
  gidNews: string;
  latestUpdates: string;
  findOrders: string;
  browseRequests: string;
  
  profile: string;
  city: string;
  theme: string;
  language: string;
  name: string;
  surname: string;
  phone: string;
  enterYourName: string;
  enterYourSurname: string;
  phonePlaceholder: string;
  
  cancel: string;
  save: string;
  close: string;
  submit: string;
  delete: string;
  edit: string;
  publish: string;
  
  addReminder: string;
  selectDateTime: string;
  enterNote: string;
  reminderAdded: string;
  note: string;
  time: string;
  
  gidAssistantTitle: string;
  gidAssistantSubtitle: string;
  typeCommand: string;
  sayCommand: string;
  quickActions: string;
  createGidRequest: string;
  findOrdersNearMe: string;
  setReminder: string;
  recognized: string;
  recording: string;
  recordingTapToStop: string;
  assistantCompleted: string;
  assistantError: string;
  micPermissionDenied: string;
  recordingFailed: string;
  transcriptionFailed: string;
  commandUnknown: string;
  
  service: string;
  description: string;
  deadline: string;
  budget: string;
  notSpecified: string;
  
  gidRequest: string;
  apartmentHouse: string;
  taxi: string;
  courier: string;
  masterSpecialist: string;
  
  selectService: string;
  enterDescription: string;
  selectDeadline: string;
  enterBudget: string;
  
  noVenuesConnected: string;
  
  vacancies: string;
  business: string;
  promotions: string;
  events: string;
  goods: string;
  products: string;
  transport: string;
  food: string;
  production: string;
  
  share: string;
  like: string;
  comment: string;
  reply: string;
  repost: string;
  deletePost: string;
  deletePostConfirm: string;
  postDeleted: string;
  
  contacts: string;
  createChat: string;
  
  transfer: string;
  topUp: string;
  withdraw: string;
  
  offerService: string;
  offerServiceDescription: string;
  enterComment: string;
  startingPoint: string;
  destination: string;
  uploadAvatar: string;
  selectFromGallery: string;
  customBackground: string;
  selectBackground: string;
  removeBackground: string;
  
  home: string;
  
  myOrders: string;
  myAds: string;
  voiceAssist: string;
  
  footer: string;

  accept: string;
  decline: string;
  proposal: string;
  proposalFrom: string;
  newProposal: string;
  proposalAccepted: string;
  proposalDeclined: string;
  submitProposal: string;
  yourBudget: string;
  
  backgroundOverlay: string;
  darker: string;
  lighter: string;
  blurred: string;
  none: string;
  animation: string;
  selectAnimation: string;
  animationSphere: string;
  animationParticles: string;
  animationWaves: string;
  animationCubes: string;
  animationRings: string;
  animationNone: string;
  animationLines: string;
  animationStars: string;
  animationGradientFlow: string;
  animationSparkles: string;
  animationHexagons: string;
  glassOpacity: string;
  transparent: string;
  opaque: string;
  proposalMessage: string;
  noOrders: string;
  availableOrders: string;
  orderDetails: string;
  sendProposal: string;
  proposalSent: string;
  activeChats: string;
  noChats: string;
  typeMessage: string;
  online: string;
  offline: string;
  lastSeen: string;
  
  createBooking: string;
  selectDate: string;
  selectTime: string;
  selectVenue: string;
  numberOfGuests: string;
  bookingConfirmed: string;
  yourBookings: string;
  noBookings: string;
  upcoming: string;
  past: string;
  bookingDetails: string;
  cancelBooking: string;
  
  createListing: string;
  listingTitle: string;
  listingPrice: string;
  listingCategory: string;
  listingDescription: string;
  yourListings: string;
  allListings: string;
  noListings: string;
  featured: string;
  newest: string;
  priceRange: string;
  
  currentBalance: string;
  transactionHistory: string;
  noTransactions: string;
  income: string;
  expense: string;
  pending: string;
  completed: string;
  failed: string;
  amount: string;
  recipient: string;
  sender: string;
  transferFunds: string;
  enterAmount: string;
  enterRecipient: string;
  confirmTransfer: string;
  
  customer: string;
  provider: string;
  rating: string;
  reviews: string;
  verified: string;
  
  cityChatDesc: string;
  orderDesc: string;
  bookingDesc: string;
  serviceAdsDesc: string;
  messengerDesc: string;
  walletDesc: string;
  findOrdersDesc: string;
  myOrdersDesc: string;
  
  musicPlayer: string;
  musicPlayerDesc: string;
  map: string;
  yourLocation: string;
  loadingLocation: string;
  retry: string;
  youAreHere: string;
  coordinates: string;
  viewMap: string;
}

export const translations: Record<Language, Translations> = {
  ru: {
    welcome1: "GiDCity-ға қош келдіңіз!",
    welcome2: "Добро пожаловать в GiDCity!",
    gidCity: "GiDCity",
    services: "УСЛУГИ",
    work: "РАБОТА",
    mainMenu: "Главное меню",
    settings: "Настройки",
    calendar: "Календарь",
    notifications: "Уведомления",
    aiAssistant: "ИИ Ассистент",
    askGidAssistant: "Спросить GiD Ассистент",
    
    order: "Заказ",
    createRequest: "Создать запрос",
    booking: "Забронировать",
    comingSoon: "скоро...",
    serviceAds: "Объявления услуг",
    listOfAdvertisements: "Список объявлений",
    cityChat: "Городской чат",
    yourCityFeed: "Лента вашего города",
    messenger: "Мессенджер",
    dialogs: "Диалоги",
    wallet: "Кошелек",
    balance: "Баланс",
    gidNews: "GiD News",
    latestUpdates: "Последние обновления",
    findOrders: "Найти заказы",
    browseRequests: "Просмотр запросов",
    
    profile: "Профиль",
    city: "Город",
    theme: "Тема",
    language: "Язык",
    name: "Имя",
    surname: "Фамилия",
    phone: "Телефон",
    enterYourName: "Введите ваше имя",
    enterYourSurname: "Введите вашу фамилию",
    phonePlaceholder: "+7 XXX XXX XX XX",
    
    cancel: "Отмена",
    save: "Сохранить",
    close: "Закрыть",
    submit: "Отправить",
    delete: "Удалить",
    edit: "Редактировать",
    publish: "Опубликовать",
    
    addReminder: "Добавить напоминание",
    selectDateTime: "Выберите дату и время",
    enterNote: "Введите заметку",
    reminderAdded: "Напоминание добавлено",
    note: "Заметка",
    time: "Время",
    
    gidAssistantTitle: "GiD Ассистент",
    gidAssistantSubtitle: "Позвольте ИИ заполнять запросы и нажимать кнопки за вас — текстом или голосом.",
    typeCommand: "Введите команду или опишите заказ",
    sayCommand: "Скажите команду или попросите создать заказ...",
    quickActions: "Быстрые действия",
    createGidRequest: "Создать GiD запрос",
    findOrdersNearMe: "Найти заказы рядом",
    setReminder: "Установить напоминание",
    recognized: "Распознано:",
    recording: "Запись...",
    recordingTapToStop: "Запись... Нажмите микрофон, чтобы остановить",
    assistantCompleted: "GiD Ассистент выполнил это действие.",
    assistantError: "Извините, ассистент не смог выполнить это. Попробуйте снова или отредактируйте вручную.",
    micPermissionDenied: "Доступ к микрофону запрещен.",
    recordingFailed: "Не удалось начать запись. Попробуйте снова.",
    transcriptionFailed: "Не удалось расшифровать аудио. Попробуйте снова.",
    commandUnknown: "Извините, я не понял эту команду. Попробуйте снова.",
    
    service: "Услуга",
    description: "Описание",
    deadline: "Срок",
    budget: "Бюджет",
    notSpecified: "Не указано",
    
    gidRequest: "GiD запрос (любой тип услуги)",
    apartmentHouse: "Квартира/Дом",
    taxi: "Такси",
    courier: "Курьер",
    masterSpecialist: "Мастер/Специалист",
    
    selectService: "Выберите услугу",
    enterDescription: "Введите описание",
    selectDeadline: "Выберите срок",
    enterBudget: "Введите бюджет",
    
    noVenuesConnected: "Пока нет заведений, подключенных к GiDCity.",
    
    vacancies: "Вакансии",
    business: "Бизнес",
    promotions: "Акции",
    events: "События",
    goods: "Товары",
    products: "Продукты",
    transport: "Транспорт",
    food: "Еда",
    production: "Производство",
    
    share: "Поделиться...",
    like: "Нравится",
    comment: "Комментарий",
    reply: "Ответить",
    repost: "Репост",
    deletePost: "Удалить пост",
    deletePostConfirm: "Удалить пост? Это действие нельзя отменить.",
    postDeleted: "Пост удален.",
    
    contacts: "Контакты",
    createChat: "Создать чат",
    
    transfer: "Перевести",
    topUp: "Пополнить",
    withdraw: "Вывести",
    
    offerService: "Предложить услугу",
    offerServiceDescription: "Введите свой бюджет и комментарий",
    enterComment: "Введите комментарий",
    startingPoint: "Точка отправления",
    destination: "Точка назначения",
    uploadAvatar: "Загрузить аватар",
    selectFromGallery: "Выбрать из галереи",
    customBackground: "Свой фон",
    selectBackground: "Выбрать фон",
    removeBackground: "Удалить фон",
    
    home: "Главная",
    
    myOrders: "Мои заказы",
    myAds: "Мои объявления",
    voiceAssist: "Голосовая помощь",
    
    footer: "KASSEN Technology Inc.",

    accept: "Принять",
    decline: "Отклонить",
    proposal: "Предложение",
    proposalFrom: "Предложение от",
    newProposal: "Новое предложение",
    proposalAccepted: "Предложение принято",
    proposalDeclined: "Предложение отклонено",
    submitProposal: "Отправить предложение",
    yourBudget: "Ваш бюджет",
    proposalMessage: "Сообщение",
    noOrders: "Нет доступных заказов",
    availableOrders: "Доступные заказы",
    orderDetails: "Детали заказа",
    sendProposal: "Отправить предложение",
    proposalSent: "Предложение отправлено",
    activeChats: "Активные чаты",
    noChats: "Нет активных чатов",
    typeMessage: "Введите сообщение",
    online: "В сети",
    offline: "Не в сети",
    lastSeen: "Был(а)",
    
    createBooking: "Создать бронь",
    selectDate: "Выберите дату",
    selectTime: "Выберите время",
    selectVenue: "Выберите заведение",
    numberOfGuests: "Количество гостей",
    bookingConfirmed: "Бронь подтверждена",
    yourBookings: "Ваши брони",
    noBookings: "Нет бронирований",
    upcoming: "Предстоящие",
    past: "Прошедшие",
    bookingDetails: "Детали брони",
    cancelBooking: "Отменить бронь",
    
    createListing: "Создать объявление",
    listingTitle: "Заголовок",
    listingPrice: "Цена",
    listingCategory: "Категория",
    listingDescription: "Описание объявления",
    yourListings: "Ваши объявления",
    allListings: "Все объявления",
    noListings: "Нет объявлений",
    featured: "Рекомендуемые",
    newest: "Новые",
    priceRange: "Диапазон цен",
    
    currentBalance: "Текущий баланс",
    transactionHistory: "История операций",
    noTransactions: "Нет операций",
    income: "Доход",
    expense: "Расход",
    pending: "В ожидании",
    completed: "Завершено",
    failed: "Ошибка",
    amount: "Сумма",
    recipient: "Получатель",
    sender: "Отправитель",
    transferFunds: "Перевести средства",
    enterAmount: "Введите сумму",
    enterRecipient: "Введите получателя",
    confirmTransfer: "Подтвердить перевод",
    
    customer: "Заказчик",
    provider: "Исполнитель",
    rating: "Рейтинг",
    reviews: "Отзывы",
    verified: "Проверен",
    
    cityChatDesc: "Общайтесь с жителями города",
    orderDesc: "Создайте заказ на любую услугу",
    bookingDesc: "Забронируйте столик или услугу",
    serviceAdsDesc: "Объявления от исполнителей",
    messengerDesc: "Ваши диалоги и предложения",
    walletDesc: "Баланс и операции",
    findOrdersDesc: "Найдите заказы рядом",
    myOrdersDesc: "Ваши активные заказы",
    
    musicPlayer: "Музыкальный плеер",
    musicPlayerDesc: "Слушайте фоновую музыку",
    map: "Карта",
    yourLocation: "Ваше местоположение",
    loadingLocation: "Получение вашего местоположения...",
    retry: "Повторить",
    youAreHere: "Вы здесь",
    coordinates: "Координаты",
    viewMap: "Открыть карту",
    
    backgroundOverlay: "Эффект фона",
    darker: "Темнее",
    lighter: "Светлее",
    blurred: "Размытый",
    none: "Нет",
    animation: "Анимация",
    selectAnimation: "Выбрать анимацию",
    animationSphere: "Сфера",
    animationParticles: "Частицы",
    animationWaves: "Волны",
    animationCubes: "Кубы",
    animationRings: "Кольца",
    animationNone: "Без анимации",
    animationLines: "Линии",
    animationStars: "Звёзды",
    animationGradientFlow: "Переливание",
    animationSparkles: "Искры",
    animationHexagons: "Шестиугольники",
    glassOpacity: "Прозрачность стекла",
    transparent: "Прозрачный",
    opaque: "Непрозрачный",
  },
  en: {
    welcome1: "GiDCity-ға қош келдіңіз!",
    welcome2: "Welcome to GiDCity!",
    gidCity: "GiDCity",
    services: "SERVICES",
    work: "WORK",
    mainMenu: "Main Menu",
    settings: "Settings",
    calendar: "Calendar",
    notifications: "Notifications",
    aiAssistant: "AI Assistant",
    askGidAssistant: "Ask GiD Assistant",
    
    order: "Order",
    createRequest: "Create a request",
    booking: "Booking",
    comingSoon: "coming soon...",
    serviceAds: "Service Ads",
    listOfAdvertisements: "List of advertisements",
    cityChat: "City Chat",
    yourCityFeed: "Your city's feed",
    messenger: "Messenger",
    dialogs: "Dialogs",
    wallet: "Wallet",
    balance: "Balance",
    gidNews: "GiD News",
    latestUpdates: "Latest updates",
    findOrders: "Find Orders",
    browseRequests: "Browse requests",
    
    profile: "Profile",
    city: "City",
    theme: "Theme",
    language: "Language",
    name: "Name",
    surname: "Surname",
    phone: "Phone",
    enterYourName: "Enter your name",
    enterYourSurname: "Enter your surname",
    phonePlaceholder: "+7 XXX XXX XX XX",
    
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    submit: "Submit",
    delete: "Delete",
    edit: "Edit",
    publish: "Publish",
    
    addReminder: "Add reminder",
    selectDateTime: "Select date and time",
    enterNote: "Enter note",
    reminderAdded: "Reminder added",
    note: "Note",
    time: "Time",
    
    gidAssistantTitle: "GiD Assistant",
    gidAssistantSubtitle: "Let the AI fill requests and tap buttons for you — by text or voice.",
    typeCommand: "Type a command or describe the order",
    sayCommand: "Say a command or ask to create an order...",
    quickActions: "Quick Actions",
    createGidRequest: "Create GiD Request",
    findOrdersNearMe: "Find orders near me",
    setReminder: "Set reminder",
    recognized: "Recognized:",
    recording: "Recording...",
    recordingTapToStop: "Recording... Tap mic to stop",
    assistantCompleted: "GiD Assistant completed this action.",
    assistantError: "Sorry, the assistant couldn't complete that. Try again or edit manually.",
    micPermissionDenied: "Microphone permission denied.",
    recordingFailed: "Failed to start recording. Please try again.",
    transcriptionFailed: "Failed to transcribe audio. Please try again.",
    commandUnknown: "Sorry, I couldn't understand that command. Please try again.",
    
    service: "Service",
    description: "Description",
    deadline: "Deadline",
    budget: "Budget",
    notSpecified: "Not specified",
    
    gidRequest: "GiD Request (any type of service)",
    apartmentHouse: "Apartment/House",
    taxi: "Taxi",
    courier: "Courier",
    masterSpecialist: "Master/Specialist",
    
    selectService: "Select service",
    enterDescription: "Enter description",
    selectDeadline: "Select deadline",
    enterBudget: "Enter budget",
    
    noVenuesConnected: "No venues connected to GiDCity yet.",
    
    vacancies: "Vacancies",
    business: "Business",
    promotions: "Promotions",
    events: "Events",
    goods: "Goods",
    products: "Products",
    transport: "Transport",
    food: "Food",
    production: "Production",
    
    share: "Share...",
    like: "Like",
    comment: "Comment",
    reply: "Reply",
    repost: "Repost",
    deletePost: "Delete post",
    deletePostConfirm: "Delete post? This action cannot be undone.",
    postDeleted: "Post deleted.",
    
    contacts: "Contacts",
    createChat: "Create Chat",
    
    transfer: "Transfer",
    topUp: "Top up",
    withdraw: "Withdraw",
    
    offerService: "Offer Service",
    offerServiceDescription: "Enter your budget and comment",
    enterComment: "Enter comment",
    startingPoint: "Starting point",
    destination: "Destination",
    uploadAvatar: "Upload Avatar",
    selectFromGallery: "Select from gallery",
    customBackground: "Custom Background",
    selectBackground: "Select Background",
    removeBackground: "Remove Background",
    
    home: "Home",
    
    myOrders: "My Orders",
    myAds: "My Ads",
    voiceAssist: "Voice Assist",
    
    footer: "KASSEN Technology Inc.",

    accept: "Accept",
    decline: "Decline",
    proposal: "Proposal",
    proposalFrom: "Proposal from",
    newProposal: "New Proposal",
    proposalAccepted: "Proposal accepted",
    proposalDeclined: "Proposal declined",
    submitProposal: "Submit Proposal",
    yourBudget: "Your budget",
    proposalMessage: "Message",
    noOrders: "No orders available",
    availableOrders: "Available Orders",
    orderDetails: "Order Details",
    sendProposal: "Send Proposal",
    proposalSent: "Proposal sent",
    activeChats: "Active Chats",
    noChats: "No active chats",
    typeMessage: "Type a message",
    online: "Online",
    offline: "Offline",
    lastSeen: "Last seen",
    
    createBooking: "Create Booking",
    selectDate: "Select date",
    selectTime: "Select time",
    selectVenue: "Select venue",
    numberOfGuests: "Number of guests",
    bookingConfirmed: "Booking confirmed",
    yourBookings: "Your Bookings",
    noBookings: "No bookings",
    upcoming: "Upcoming",
    past: "Past",
    bookingDetails: "Booking Details",
    cancelBooking: "Cancel Booking",
    
    createListing: "Create Listing",
    listingTitle: "Title",
    listingPrice: "Price",
    listingCategory: "Category",
    listingDescription: "Listing description",
    yourListings: "Your Listings",
    allListings: "All Listings",
    noListings: "No listings",
    featured: "Featured",
    newest: "Newest",
    priceRange: "Price range",
    
    currentBalance: "Current Balance",
    transactionHistory: "Transaction History",
    noTransactions: "No transactions",
    income: "Income",
    expense: "Expense",
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    amount: "Amount",
    recipient: "Recipient",
    sender: "Sender",
    transferFunds: "Transfer Funds",
    enterAmount: "Enter amount",
    enterRecipient: "Enter recipient",
    confirmTransfer: "Confirm Transfer",
    
    customer: "Customer",
    provider: "Provider",
    rating: "Rating",
    reviews: "Reviews",
    verified: "Verified",
    
    cityChatDesc: "Chat with city residents",
    orderDesc: "Create an order for any service",
    bookingDesc: "Book a table or service",
    serviceAdsDesc: "Listings from providers",
    messengerDesc: "Your dialogs and proposals",
    walletDesc: "Balance and transactions",
    findOrdersDesc: "Find orders nearby",
    myOrdersDesc: "Your active orders",
    
    musicPlayer: "Music Player",
    musicPlayerDesc: "Listen to background music",
    map: "Map",
    yourLocation: "Your Location",
    loadingLocation: "Getting your location...",
    retry: "Retry",
    youAreHere: "You are here",
    coordinates: "Coordinates",
    viewMap: "View Map",
    
    backgroundOverlay: "Background Overlay",
    darker: "Darker",
    lighter: "Lighter",
    blurred: "Blurred",
    none: "None",
    animation: "Animation",
    selectAnimation: "Select Animation",
    animationSphere: "Sphere",
    animationParticles: "Particles",
    animationWaves: "Waves",
    animationCubes: "Cubes",
    animationRings: "Rings",
    animationNone: "No Animation",
    animationLines: "Lines",
    animationStars: "Stars",
    animationGradientFlow: "Gradient Flow",
    animationSparkles: "Sparkles",
    animationHexagons: "Hexagons",
    glassOpacity: "Glass Opacity",
    transparent: "Transparent",
    opaque: "Opaque",
  },
  kk: {
    welcome1: "GiDCity-ға қош келдіңіз!",
    welcome2: "GiDCity-ға қош келдіңіз!",
    gidCity: "GiDCity",
    services: "ҚЫЗМЕТТЕР",
    work: "ЖҰМЫС",
    mainMenu: "Басты мәзір",
    settings: "Баптаулар",
    calendar: "Күнтізбе",
    notifications: "Хабарламалар",
    aiAssistant: "AI Көмекші",
    askGidAssistant: "GiD Көмекшісінен сұра",
    
    order: "Тапсырыс",
    createRequest: "Сұраныс жасау",
    booking: "Брондау",
    comingSoon: "жақын арада...",
    serviceAds: "Қызмет жарнамалары",
    listOfAdvertisements: "Жарнамалар тізімі",
    cityChat: "Қалалық чат",
    yourCityFeed: "Сіздің қалаңыздың жаңалықтары",
    messenger: "Мессенджер",
    dialogs: "Диалогтар",
    wallet: "Әмиян",
    balance: "Баланс",
    gidNews: "GiD News",
    latestUpdates: "Соңғы жаңартулар",
    findOrders: "Тапсырыстарды табу",
    browseRequests: "Сұраныстарды қарау",
    
    profile: "Профиль",
    city: "Қала",
    theme: "Тақырып",
    language: "Тіл",
    name: "Аты",
    surname: "Тегі",
    phone: "Телефон",
    enterYourName: "Атыңызды енгізіңіз",
    enterYourSurname: "Тегіңізді енгізіңіз",
    phonePlaceholder: "+7 XXX XXX XX XX",
    
    cancel: "Болдырмау",
    save: "Сақтау",
    close: "Жабу",
    submit: "Жіберу",
    delete: "Жою",
    edit: "Өңдеу",
    publish: "Жариялау",
    
    addReminder: "Еске салу қосу",
    selectDateTime: "Күн мен уақытты таңдаңыз",
    enterNote: "Жазба енгізіңіз",
    reminderAdded: "Еске салу қосылды",
    note: "Жазба",
    time: "Уақыт",
    
    gidAssistantTitle: "GiD Көмекші",
    gidAssistantSubtitle: "AI-ға сұраныстарды толтыруға және батырмаларды басуға мүмкіндік беріңіз — мәтін немесе дауыс арқылы.",
    typeCommand: "Команда енгізіңіз немесе тапсырысты сипаттаңыз",
    sayCommand: "Команда айтыңыз немесе тапсырыс жасауды сұраңыз...",
    quickActions: "Жылдам әрекеттер",
    createGidRequest: "GiD сұранысын жасау",
    findOrdersNearMe: "Жақын жердегі тапсырыстарды табу",
    setReminder: "Еске салу орнату",
    recognized: "Танылды:",
    recording: "Жазу...",
    recordingTapToStop: "Жазу... Тоқтату үшін микрофонды басыңыз",
    assistantCompleted: "GiD Көмекші бұл әрекетті орындады.",
    assistantError: "Кешіріңіз, көмекші мұны орындай алмады. Қайта көріңіз немесе қолмен өңдеңіз.",
    micPermissionDenied: "Микрофонға рұқсат жоқ.",
    recordingFailed: "Жазуды бастау мүмкін болмады. Қайта көріңіз.",
    transcriptionFailed: "Аудионы транскрипциялау мүмкін болмады. Қайта көріңіз.",
    commandUnknown: "Кешіріңіз, мен бұл команданы түсінбедім. Қайта көріңіз.",
    
    service: "Қызмет",
    description: "Сипаттама",
    deadline: "Мерзім",
    budget: "Бюджет",
    notSpecified: "Көрсетілмеген",
    
    gidRequest: "GiD сұранысы (кез келген қызмет түрі)",
    apartmentHouse: "Пәтер/Үй",
    taxi: "Такси",
    courier: "Курьер",
    masterSpecialist: "Шебер/Маман",
    
    selectService: "Қызметті таңдаңыз",
    enterDescription: "Сипаттаманы енгізіңіз",
    selectDeadline: "Мерзімді таңдаңыз",
    enterBudget: "Бюджетті енгізіңіз",
    
    noVenuesConnected: "Әзірге GiDCity-ге қосылған орындар жоқ.",
    
    vacancies: "Бос орындар",
    business: "Бизнес",
    promotions: "Акциялар",
    events: "Оқиғалар",
    goods: "Тауарлар",
    products: "Өнімдер",
    transport: "Көлік",
    food: "Тамақ",
    production: "Өндіріс",
    
    share: "Бөлісу...",
    like: "Ұнату",
    comment: "Пікір",
    reply: "Жауап беру",
    repost: "Қайта жіберу",
    deletePost: "Постты жою",
    deletePostConfirm: "Постты жою керек пе? Бұл әрекетті болдырмауға болмайды.",
    postDeleted: "Пост жойылды.",
    
    contacts: "Контактілер",
    createChat: "Чат жасау",
    
    transfer: "Аудару",
    topUp: "Толтыру",
    withdraw: "Шығару",
    
    offerService: "Қызметті ұсыну",
    offerServiceDescription: "Бюджет пен түсініктемені енгізіңіз",
    enterComment: "Түсініктемені енгізіңіз",
    startingPoint: "Бастау нүктесі",
    destination: "Тағайындалған жер",
    uploadAvatar: "Аватар жүктеу",
    selectFromGallery: "Галереядан таңдау",
    customBackground: "Өз фоны",
    selectBackground: "Фонды таңдау",
    removeBackground: "Фонды жою",
    
    home: "Басты бет",
    
    myOrders: "Менің тапсырыстарым",
    myAds: "Менің жарнамаларым",
    voiceAssist: "Дауыстық көмек",
    
    footer: "KASSEN Technology Inc.",

    accept: "Қабылдау",
    decline: "Қабылдамау",
    proposal: "Ұсыныс",
    proposalFrom: "Ұсыныс кімнен",
    newProposal: "Жаңа ұсыныс",
    proposalAccepted: "Ұсыныс қабылданды",
    proposalDeclined: "Ұсыныс қабылданбады",
    submitProposal: "Ұсыныс жіберу",
    yourBudget: "Сіздің бюджет",
    proposalMessage: "Хабарлама",
    noOrders: "Тапсырыстар жоқ",
    availableOrders: "Қол жетімді тапсырыстар",
    orderDetails: "Тапсырыс мәліметтері",
    sendProposal: "Ұсыныс жіберу",
    proposalSent: "Ұсыныс жіберілді",
    activeChats: "Белсенді чаттар",
    noChats: "Белсенді чаттар жоқ",
    typeMessage: "Хабарлама жазыңыз",
    online: "Желіде",
    offline: "Желіде емес",
    lastSeen: "Соңғы рет көрген",
    
    createBooking: "Брондау жасау",
    selectDate: "Күнді таңдаңыз",
    selectTime: "Уақытты таңдаңыз",
    selectVenue: "Орынды таңдаңыз",
    numberOfGuests: "Қонақтар саны",
    bookingConfirmed: "Брондау расталды",
    yourBookings: "Сіздің брондауларыңыз",
    noBookings: "Брондаулар жоқ",
    upcoming: "Алдағы",
    past: "Өткен",
    bookingDetails: "Брондау мәліметтері",
    cancelBooking: "Брондауды болдырмау",
    
    createListing: "Жарнама жасау",
    listingTitle: "Тақырып",
    listingPrice: "Баға",
    listingCategory: "Санат",
    listingDescription: "Жарнама сипаттамасы",
    yourListings: "Сіздің жарнамаларыңыз",
    allListings: "Барлық жарнамалар",
    noListings: "Жарнамалар жоқ",
    featured: "Ұсынылған",
    newest: "Жаңа",
    priceRange: "Баға диапазоны",
    
    currentBalance: "Ағымдағы баланс",
    transactionHistory: "Операциялар тарихы",
    noTransactions: "Операциялар жоқ",
    income: "Кіріс",
    expense: "Шығыс",
    pending: "Күтуде",
    completed: "Аяқталды",
    failed: "Қате",
    amount: "Сома",
    recipient: "Алушы",
    sender: "Жіберуші",
    transferFunds: "Қаражат аудару",
    enterAmount: "Соманы енгізіңіз",
    enterRecipient: "Алушыны енгізіңіз",
    confirmTransfer: "Аударуды растау",
    
    customer: "Тапсырыс беруші",
    provider: "Орындаушы",
    rating: "Рейтинг",
    reviews: "Пікірлер",
    verified: "Тексерілген",
    
    cityChatDesc: "Қала тұрғындарымен сөйлесіңіз",
    orderDesc: "Кез келген қызметке тапсырыс беріңіз",
    bookingDesc: "Үстел немесе қызмет брондаңыз",
    serviceAdsDesc: "Орындаушылардан жарнамалар",
    messengerDesc: "Сіздің диалогтарыңыз және ұсыныстарыңыз",
    walletDesc: "Баланс және операциялар",
    findOrdersDesc: "Жақын жердегі тапсырыстарды табыңыз",
    myOrdersDesc: "Сіздің белсенді тапсырыстарыңыз",
    
    musicPlayer: "Музыкалық ойнатқыш",
    musicPlayerDesc: "Фондық музыка тыңдаңыз",
    map: "Карта",
    yourLocation: "Сіздің орныңыз",
    loadingLocation: "Сіздің орныңызды анықтау...",
    retry: "Қайталау",
    youAreHere: "Сіз осындасыз",
    coordinates: "Координаттар",
    viewMap: "Картаны ашу",
    
    backgroundOverlay: "Фон эффекті",
    darker: "Қараңғырақ",
    lighter: "Ашықтау",
    blurred: "Бұлыңғыр",
    none: "Жоқ",
    animation: "Анимация",
    selectAnimation: "Анимацияны таңдау",
    animationSphere: "Сфера",
    animationParticles: "Бөлшектер",
    animationWaves: "Толқындар",
    animationCubes: "Кубтар",
    animationRings: "Сақиналар",
    animationNone: "Анимациясыз",
    animationLines: "Сызықтар",
    animationStars: "Жұлдыздар",
    animationGradientFlow: "Градиент ағыны",
    animationSparkles: "Ұшқындар",
    animationHexagons: "Алтыбұрыштар",
    glassOpacity: "Шыны мөлдірлігі",
    transparent: "Мөлдір",
    opaque: "Мөлдір емес",
  },
};
