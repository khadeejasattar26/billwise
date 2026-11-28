// Every piece of page text in Urdu and English. Urdu is the default: BillWise is for Pakistani households.

import { formatDate, formatNumber } from './lib/format'

export type Lang = 'ur' | 'en'

/** Wrap Latin text (file names, "5 MB") inside Urdu so right-to-left layout can't reorder it. */
const iso = (s: string) => `\u2068${s}\u2069`

const ur = {
  // ---- page chrome and landing sections
  skipToContent: 'مواد پر جائیں',
  navHow: 'یہ کیسے کام کرتا ہے',
  navChecks: 'کیا دیکھا جاتا ہے',
  navFaq: 'سوالات',
  heroEyebrow: 'پاکستان کے بجلی کے بلوں کے لیے',
  heroTitle: 'آپ کا بجلی کا بل',
  heroTitleAccent: 'آسان زبان میں',
  heroText: 'بل کی تصویر لیں۔ جانیں کتنی رقم دینی ہے، کب دینی ہے، اور بل کیوں بدلا۔',
  freeToUse: 'مفت استعمال کریں',
  listenInBothLanguages: 'اردو یا انگریزی میں سنیں',
  uploadCardTitle: 'اپنا بل دکھائیں',
  howTitle: 'یہ کیسے کام کرتا ہے',
  howSteps: [
    { title: 'بل کی تصویر لیں', text: 'فون کے کیمرے سے پورے بل کی صاف اور سیدھی تصویر۔' },
    { title: 'بل پڑھ کر جانچا جاتا ہے', text: 'یونٹ، رقم، بقایا اور پچھلے 12 مہینوں کی تاریخ پڑھی جاتی ہے، اور حساب دوبارہ جوڑ کر دیکھا جاتا ہے۔' },
    { title: 'آسان اردو میں جواب', text: 'بل کیوں ایسا ہے، سادہ الفاظ میں، اور آپ اسے سن بھی سکتے ہیں۔' },
  ],
  checksTitle: 'BillWise آپ کے بل میں کیا دیکھتا ہے',
  checks: [
    { title: 'پچھلا بقایا', text: 'پچھلے بل کی جو رقم ادا نہیں ہوئی، وہ کتنی ہے اور کس مہینے کی ہے۔' },
    { title: '200 یونٹ کی حد', text: 'آپ کا کنکشن پروٹیکٹڈ ہے یا نہیں، اور کس مہینے کی وجہ سے ریٹ بڑھا۔' },
    { title: 'پچھلے مہینوں سے موازنہ', text: 'پچھلے مہینے اور پچھلے سال اسی مہینے کے مقابلے میں یونٹ کا فرق۔' },
    { title: 'فیول ایڈجسٹمنٹ، ٹیکس اور جرمانہ', text: 'FPA، ٹیکس، سبسڈی اور دیر سے ادائیگی پر لگنے والی اضافی رقم۔' },
  ],
  companiesTitle: 'کن کمپنیوں کے بل',
  companiesText: 'سرکاری بجلی کمپنیوں کے بل ایک ہی ڈیزائن (PITC) کے ہوتے ہیں اور BillWise انہیں پڑھتا ہے۔ K-Electric کے بل کا ڈیزائن مختلف ہے اور ابھی پوری طرح آزمایا نہیں گیا۔',
  faqTitle: 'عام سوالات',
  faq: [
    { q: 'کیا یہ مفت ہے؟', a: 'جی ہاں، BillWise استعمال کرنا مفت ہے۔' },
    { q: 'کیا میرا بل محفوظ کیا جاتا ہے؟', a: 'نہیں۔ ہمارے سرور پر آپ کا بل، نام یا نمبر محفوظ نہیں کیے جاتے۔ تصویر پڑھنے کے لیے OpenAI کو بھیجی جاتی ہے اور سننے کا متن Microsoft کو۔ صفحہ بند کرنے پر نتیجہ ختم ہو جاتا ہے۔' },
    { q: 'کیا جواب ہمیشہ درست ہوتا ہے؟', a: 'دھندلی تصویر سے نمبر غلط پڑھے جا سکتے ہیں۔ BillWise رقموں کو جمع کر کے دیکھتا ہے اور فرق ہو تو بتاتا ہے۔ ادائیگی سے پہلے رقم اپنے اصل بل سے ملا لیں۔' },
    { q: 'پروٹیکٹڈ اور ان پروٹیکٹڈ کیا ہے؟', a: 'نیپرا کے قاعدے کے مطابق جو گھر پچھلے 6 مہینے ہر مہینے 200 یا اس سے کم یونٹ استعمال کرے، اسے کم ریٹ ملتا ہے۔ کسی ایک مہینے 200 سے زیادہ ہونے پر اگلے 6 مہینے زیادہ ریٹ لگ سکتا ہے۔' },
    { q: 'پہلی بار اتنی دیر کیوں لگتی ہے؟', a: 'یہ مفت سرور ہے جو کچھ دیر استعمال نہ ہو تو سو جاتا ہے۔ پہلی بار اسے جاگنے میں ایک سے دو منٹ لگ سکتے ہیں، اس کے بعد تقریباً 20 سیکنڈ۔' },
  ],
  footerDisclaimer: 'BillWise کسی بجلی کمپنی، نیپرا یا حکومت سے منسلک نہیں۔ یہ ایک ڈیمو ہے: ادائیگی سے پہلے ہمیشہ اپنا اصل بل دیکھیں۔',
  resultTitle: 'آپ کے بل کا نتیجہ',
  // ---- guided flow (one thing per screen)
  startCta: 'اپنا بل چیک کریں',
  sampleCta: 'نمونہ دیکھیں',
  previewCaption: 'بجلی کے بل کا خلاصہ',
  sampleLabel: 'نمونہ بل',
  previewAmount: 'قابلِ ادائیگی رقم',
  previewUnits: (n: string) => `اس مہینے ${n} یونٹ`,
  previewUnitsLabel: (n: string) => `${n} یونٹ`,
  previewArrears: (amount: string) => `پچھلے بلوں کا ${amount} بقایا شامل ہے۔`,
  back: 'واپس',
  stepOf: (n: number, total: number) => `مرحلہ ${n} از ${total}`,
  largerText: 'بڑے حروف',
  normalText: 'عام حروف',
  consentTitle: 'شروع کرنے سے پہلے',
  consentPoints: [
    'صرف اپنا بل، یا وہ بل جس کی آپ کو اجازت ہو۔',
    'تصویر پڑھنے کے لیے OpenAI (امریکہ) کو بھیجی جاتی ہے۔',
    'ہمارے سرور پر آپ کا بل محفوظ نہیں کیا جاتا۔',
  ],
  consentYes: 'ہاں، یہ میرا بل ہے اور میں متفق ہوں',
  consentStored: 'بل کی تصویر محفوظ نہیں ہوتی۔ بل کی معلومات 30 دن بعد حذف کر دی جاتی ہیں۔',
  photoTitle: 'بل کی تصویر لیں',
  photoFormats: `تصویر ${iso('JPG')} یا ${iso('PNG')} میں ہونی چاہیے۔`,
  photoTips: [
    { title: 'بل کو سیدھا رکھیں', text: 'میز یا فرش پر بچھا دیں، مڑا ہوا نہ ہو۔' },
    { title: 'اچھی روشنی میں', text: 'دن کی روشنی یا بلب کے نیچے، تصویر پر سایہ نہ پڑے۔' },
    { title: 'پورا بل', text: 'بل کے چاروں کونے تصویر میں نظر آئیں۔' },
  ],
  cameraCta: 'کیمرہ کھولیں',
  galleryCta: 'گیلری سے تصویر چنیں',
  checkTitle: 'تصویر دیکھ لیں',
  checking: 'تصویر جانچی جا رہی ہے…',
  checkGood: 'تصویر صاف لگ رہی ہے۔',
  checkIssues: {
    blurry: 'تصویر دھندلی لگ رہی ہے، نمبر غلط پڑھے جا سکتے ہیں۔',
    dark: 'تصویر بہت اندھیری ہے۔',
    small: 'تصویر بہت چھوٹی ہے، بل کے قریب ہو کر لیں۔',
  } as Record<string, string>,
  checkAdvice: 'بہتر ہے دوبارہ تصویر لیں۔',
  checkUnreadable: 'یہ تصویر کھل نہیں سکی۔ دوسری تصویر لیں۔',
  previewAlt: 'آپ کے بل کی تصویر',
  usePhoto: 'یہ تصویر استعمال کریں',
  usePhotoAnyway: 'پھر بھی یہی تصویر استعمال کریں',
  retake: 'دوبارہ تصویر لیں',
  readingTitle: 'بل پڑھا جا رہا ہے',
  retry: 'دوبارہ کوشش کریں',
  answerTitle: 'آپ کا بل',
  payLabel: 'آپ کو ادا کرنا ہے',
  payBy: (date: string) => `آخری تاریخ: ${date}`,
  payAfter: (amount: string) => `آخری تاریخ کے بعد: ${amount}`,
  mainReasons: 'سب سے اہم بات',
  seeDetails: 'پوری تفصیل دیکھیں',
  askCta: 'سوال پوچھیں',
  newBillCta: 'نیا بل چیک کریں',
  sampleBanner: 'یہ ایک نمونہ بل ہے، کسی اصل شخص کا نہیں۔',
  detailsScreenTitle: 'پوری تفصیل',
  glossaryTitle: 'بل پر لکھے الفاظ کا مطلب',
  glossary: [
    { term: 'یونٹ', text: 'ایک یونٹ وہ بجلی ہے جو 1,000 واٹ کی کوئی چیز ایک گھنٹے میں استعمال کرتی ہے۔ بل یونٹ کے حساب سے بنتا ہے۔' },
    { term: 'بقایا', text: 'پچھلے بلوں کی وہ رقم جو ادا نہیں ہوئی۔ یہ اس مہینے کے بل میں جمع ہو جاتی ہے۔' },
    { term: 'فیول ایڈجسٹمنٹ (FPA)', text: 'بجلی بنانے والے ایندھن کی قیمت بدلنے پر نیپرا کی منظوری سے لگنے والی رقم، عموماً کسی پچھلے مہینے کے یونٹ پر۔' },
    { term: 'پروٹیکٹڈ', text: 'جو گھر 6 مہینے لگاتار ہر مہینے 200 یا اس سے کم یونٹ استعمال کرے، اسے کم ریٹ ملتا ہے۔' },
    { term: 'ان پروٹیکٹڈ', text: 'پچھلے 6 مہینوں میں کسی ایک مہینے 200 سے زیادہ یونٹ ہوں تو زیادہ ریٹ لگتا ہے۔' },
    { term: 'ایل پی سرچارج', text: 'مقررہ تاریخ کے بعد ادائیگی پر لگنے والا جرمانہ۔' },
    { term: 'ٹیکس', text: 'بل پر حکومت کے ٹیکس، جیسے سیلز ٹیکس اور بجلی ڈیوٹی۔' },
    { term: 'سبسڈی', text: 'حکومت کی طرف سے بل میں دی گئی رعایت۔' },
    { term: 'ریفرنس نمبر', text: 'آپ کے بجلی کنکشن کا نمبر۔ آن لائن بل دیکھنے یا شکایت درج کرنے کے لیے یہی نمبر چاہیے۔' },
  ],
  askScreenTitle: 'اپنے بل کے بارے میں پوچھیں',
  suggestionsTitle: 'یہ سوال دبائیں، یا اپنا سوال لکھیں',
  suggestions: ['میرا بل کیوں زیادہ ہے؟', 'مجھے کتنے پیسے کب تک جمع کروانے ہیں؟', 'بقایا کیا ہوتا ہے؟', 'پروٹیکٹڈ کیسے بنا جا سکتا ہے؟'],
  docTitles: {
    home: 'BillWise · اپنا بجلی کا بل آسان اردو میں سمجھیں', consent: 'شروع کرنے سے پہلے · BillWise', photo: 'بل کی تصویر لیں · BillWise',
    check: 'تصویر دیکھ لیں · BillWise', reading: 'بل پڑھا جا رہا ہے · BillWise', answer: 'آپ کا بل · BillWise',
    details: 'پوری تفصیل · BillWise', ask: 'سوال پوچھیں · BillWise',
  } as Record<string, string>,
  tagline: 'بجلی کا بل، آسان زبان میں',
  intro: 'بل کی تصویر لیں، ہم آسان اردو میں بتائیں گے کہ بل کتنا ہے اور کیوں۔',
  switchTo: 'English',
  switchLabel: 'Switch to English',
  upload: 'بل کی تصویر اپ لوڈ کریں',
  uploading: 'بل پڑھا جا رہا ہے…',
  uploadHint: 'فون کے کیمرے سے پورے بل کی صاف اور سیدھی تصویر لیں۔',
  consent: `یہ میرا اپنا بل ہے یا مجھے اس کی اجازت ہے، اور میں متفق ہوں کہ پڑھنے کے لیے تصویر ${iso('OpenAI')} (امریکہ) کو بھیجی جائے گی۔`,
  privacyShortNothing: 'پرائیویسی: آپ کا بل ہمارے سرور پر محفوظ نہیں کیا جاتا۔',
  privacyShortStored: 'پرائیویسی: بل کے نمبر 30 دن بعد خود بخود مٹا دیے جاتے ہیں۔',
  newBill: 'نیا بل اپ لوڈ کریں',
  feedback: 'رائے دیں یا کوئی مسئلہ بتائیں',
  warningsHint: 'یہ نمبر تصویر سے غلط پڑھے گئے ہو سکتے ہیں۔ اصل بل سے ملا لیں۔',
  privacyNothing: `ہمارے سرور پر کچھ محفوظ نہیں کیا جاتا: نہ تصویر، نہ نام، نہ بل کے نمبر۔ نتیجہ صرف آپ کے براؤزر میں رہتا ہے اور صفحہ بند کرنے پر ختم ہو جاتا ہے۔ سننے کا متن ${iso('Microsoft')} کو بھیجا جاتا ہے۔ یہ ایک ڈیمو ہے: اصل رقم ہمیشہ اپنے بل سے ملا لیں۔`,
  privacyStored: `تصویر محفوظ نہیں کی جاتی؛ بل کے نمبر 30 دن بعد خود بخود مٹا دیے جاتے ہیں۔ سننے کا متن ${iso('Microsoft')} کو بھیجا جاتا ہے۔ یہ ایک ڈیمو ہے: اصل رقم ہمیشہ اپنے بل سے ملا لیں۔`,
  idle: 'ابھی کوئی بل نہیں۔ اوپر والے خانے پر نشان لگائیں، پھر اپنے بجلی کے بل کی صاف اور سیدھی تصویر اپ لوڈ کریں۔',
  loading: 'اس میں عموماً 20 سیکنڈ لگتے ہیں۔ پہلی بار ایک سے دو منٹ لگ سکتے ہیں۔',
  errorTitle: 'بل پڑھا نہیں جا سکا',
  warningsTitle: 'ان باتوں کی تصدیق کر لیں:',
  glance: 'آپ کا بل ایک نظر میں',
  units: 'یونٹ',
  bill: 'بل',
  dueDate: 'آخری تاریخ',
  more: (n: string) => `پچھلے مہینے سے ${n} زیادہ`,
  less: (n: string) => `پچھلے مہینے سے ${n} کم`,
  same: 'پچھلے مہینے جتنا',
  firstBill: 'پہلا بل، موازنہ اگلے مہینے',
  rupees: (n: string) => `${n} روپے`,
  plainWords: 'آسان الفاظ میں',
  listen: 'سنیں',
  stop: 'روکیں',
  issuedBy: 'بل جاری کرنے والی کمپنی',
  chargesTitle: 'آپ کا بل کس چیز سے بنا ہے؟',
  chargeCurrent: 'اس مہینے کی بجلی (موجودہ بل)',
  chargeArrears: 'پچھلا بقایا (جو ادا نہیں ہوا)',
  chargeFpa: 'فیول ایڈجسٹمنٹ (FPA)',
  chargeOther: 'دیگر ایڈجسٹمنٹ',
  chargeTotal: 'کل رقم',
  afterDue: (amount: string) => `مقررہ تاریخ کے بعد: ${amount}`,
  whyTitle: 'آپ کا بل ایسا کیوں ہے؟',
  whyFromPrinted: 'پچھلے مہینوں کا موازنہ بل پر چھپی تاریخ (Bill History) سے کیا گیا ہے۔',
  listenLoading: 'آواز تیار ہو رہی ہے…',
  listenFailed: 'آواز نہیں چل سکی۔ انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔',
  technical: 'تکنیکی معلومات',
  perUnitTitle: 'ایک یونٹ کتنے کا پڑا؟',
  perUnitNow: (x: string) => `اس مہینے اوسطاً ${x} روپے فی یونٹ`,
  perUnitBefore: (x: string) => `پچھلے مہینے ${x} روپے فی یونٹ`,
  whatIsUnit: 'ایک یونٹ کیا ہے؟',
  unitDefinition: 'ایک یونٹ وہ بجلی ہے جو 1,000 واٹ کی کوئی چیز ایک گھنٹے میں استعمال کرتی ہے (1 کلو واٹ گھنٹہ)۔',
  unitExamples: [
    'چھت کا پنکھا (تقریباً 75 واٹ) تقریباً 13 گھنٹے چلے تو 1 یونٹ',
    'LED بلب (10 واٹ) تقریباً 100 گھنٹے جلے تو 1 یونٹ',
    'ڈیڑھ ٹن کا AC (تقریباً 1,500 واٹ) تقریباً 40 منٹ چلے تو 1 یونٹ',
  ],
  extraUnits: (n: string, h: string) => `اس مہینے کے ${n} اضافی یونٹ اتنی بجلی ہیں جتنی ڈیڑھ ٹن کا AC تقریباً ${h} گھنٹے چلانے میں لگتی ہے۔`,
  fewerUnits: (n: string) => `اس مہینے آپ نے پچھلے مہینے سے ${n} یونٹ کم استعمال کیے۔`,
  approxNote: 'یہ اندازے ہیں؛ اصل استعمال آپ کے آلات پر منحصر ہے۔',
  chartTitle: 'ہر مہینے کے یونٹ',
  chartLabel: 'ہر مہینے کے استعمال شدہ یونٹ',
  chartOne: 'موازنے کے لیے اگلے مہینے کا بل بھی اپ لوڈ کریں۔',
  chartLimit: '200 یونٹ کی حد: اس سے اوپر جانے پر ریٹ بڑھ جاتا ہے',
  askTitle: 'اپنے بل کے بارے میں پوچھیں',
  askPlaceholder: 'میرا بل کیوں بڑھا؟',
  askLabel: 'آپ کا سوال',
  askHint: `اردو، ${iso('Roman Urdu')} یا ${iso('English')} میں پوچھیں`,
  ask: 'پوچھیں',
  asking: 'پوچھا جا رہا ہے…',
  detailsTitle: 'بل کی پوری تفصیل',
  fields: {
    account_no: 'کھاتہ نمبر',
    billing_month: 'بلنگ کا مہینہ',
    previous_reading: 'پچھلی ریڈنگ',
    current_reading: 'موجودہ ریڈنگ',
    units: 'استعمال شدہ یونٹ',
    amount: 'رقم',
    due_date: 'آخری تاریخ',
  },
  hasWarning: 'اس میں مسئلہ ہے',
  readOcr: `بل ${iso('OCR')} سے پڑھا گیا`,
  readPhoto: 'بل براہِ راست تصویر سے پڑھا گیا',
  readVision: `${iso('OCR')} ناکام ہوا، اس لیے بل تصویر سے دوبارہ پڑھا گیا`,
  attempts: (n: number) => `(${n} کوشش)`,
  reminderOn: 'آخری تاریخ کی یاد دہانی لگا دی گئی۔',
  reminderOff: `یاد دہانی نہیں لگی (${iso('n8n')} بند ہے)۔`,
  errors: {
    unsupported_file_type: 'صرف JPG یا PNG تصویر اپ لوڈ کریں۔',
    file_too_large: `تصویر ${iso('5 MB')} سے بڑی ہے۔ چھوٹی تصویر اپ لوڈ کریں۔`,
    unreadable_image: 'یہ تصویر کھل نہیں سکی۔ دوسری تصویر آزمائیں۔',
    fields_not_found: 'بل کی ضروری معلومات نہیں پڑھی جا سکیں۔ بل کی صاف اور سیدھی تصویر لیں۔',
    llm_error: 'AI سروس نے جواب نہیں دیا۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔',
    speech_failed: 'آواز نہیں چل سکی۔ دوبارہ کوشش کریں۔',
    rate_limited: 'آپ نے بہت زیادہ بار کوشش کی ہے۔ ایک گھنٹے بعد دوبارہ کوشش کریں۔',
    consent_required: 'بل بھیجنے سے پہلے اپنی رضامندی دیں۔',
    not_a_bill: 'یہ تصویر بجلی کے بل کی نہیں لگتی۔ براہ کرم بل کی صاف اور سیدھی تصویر اپ لوڈ کریں۔',
    daily_limit: 'آج کی حد پوری ہو گئی ہے۔ کل دوبارہ کوشش کریں۔',
    server_busy: 'سرور ابھی دوسری تصاویر پڑھ رہا ہے۔ ایک منٹ بعد دوبارہ کوشش کریں۔',
    network_error: 'رابطہ نہیں ہو سکا۔ اپنا انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔',
    default: 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔',
  } as Record<string, string>,
}

export type Strings = typeof ur

const en: Strings = {
  skipToContent: 'Skip to content',
  navHow: 'How it works',
  navChecks: 'What it checks',
  navFaq: 'FAQ',
  heroEyebrow: 'For Pakistani electricity bills',
  heroTitle: 'Your electricity bill,',
  heroTitleAccent: 'in plain words.',
  heroText: 'Take a photo to see what you owe, when it’s due, and why the amount changed.',
  freeToUse: 'Free to use',
  listenInBothLanguages: 'Listen in Urdu or English',
  uploadCardTitle: 'Show us your bill',
  howTitle: 'How it works',
  howSteps: [
    { title: 'Take a photo', text: 'A clear, straight photo of the whole bill with your phone camera.' },
    { title: 'We read and check it', text: 'Units, amount, arrears and 12 months of history are read, and the sums are checked.' },
    { title: 'A plain answer', text: 'Why the bill is what it is, in simple words, and you can listen to it.' },
  ],
  checksTitle: 'What BillWise checks on your bill',
  checks: [
    { title: 'Unpaid arrears', text: 'How much of an earlier bill is still unpaid, and from which month.' },
    { title: 'The 200-unit limit', text: 'Whether your connection is protected, and which month raised your rate.' },
    { title: 'Earlier months', text: 'Units compared with last month and with the same month last year.' },
    { title: 'FPA, taxes and late fee', text: 'Fuel price adjustment, taxes, subsidy and the extra amount if you pay late.' },
  ],
  companiesTitle: 'Supported electricity companies',
  companiesText: "Pakistan's government distribution companies share one bill design (PITC), which BillWise reads. K-Electric bills look different and are not fully tested yet.",
  faqTitle: 'Common questions',
  faq: [
    { q: 'Is it free?', a: 'Yes, BillWise is free to use.' },
    { q: 'Is my bill stored?', a: 'No. Your bill, name and numbers are not saved on our server. The photo is sent to OpenAI to be read and the listen text to Microsoft. The result is gone when you close the page.' },
    { q: 'Is the answer always right?', a: 'A blurry photo can cause reading errors. BillWise checks whether the amounts add up and flags any differences. Compare the amounts with your original bill before paying.' },
    { q: 'What do protected and unprotected mean?', a: 'Under NEPRA rules, a household using 200 units or less every month for 6 months gets lower rates. One month above 200 can mean higher rates for the next 6 months.' },
    { q: 'Why is the first try slow?', a: 'It runs on a free server that sleeps when unused. Waking it can take 1–2 minutes the first time; after that a bill takes about 20 seconds.' },
  ],
  footerDisclaimer: 'BillWise is not affiliated with any electricity company, NEPRA or the government. It is a demo: always check your paper bill before paying.',
  resultTitle: 'Your bill, explained',
  startCta: 'Check my bill',
  sampleCta: 'See an example',
  previewCaption: 'Electricity bill summary',
  sampleLabel: 'Example bill',
  previewAmount: 'Amount due',
  previewUnits: (n) => `${n} units this month`,
  previewUnitsLabel: (n) => `${n} units`,
  previewArrears: (amount) => `Includes ${amount} in unpaid bills.`,
  back: 'Back',
  stepOf: (n, total) => `Step ${n} of ${total}`,
  largerText: 'Larger text',
  normalText: 'Normal text',
  consentTitle: 'Before you start',
  consentPoints: [
    'Only your own bill, or one you have permission to use.',
    'The photo is sent to OpenAI (USA) to be read.',
    'Your bill is not stored on our server.',
  ],
  consentYes: 'Yes, this is my bill and I agree',
  consentStored: 'We don’t store the photo. Bill details are deleted after 30 days.',
  photoTitle: 'Take a photo of your bill',
  photoFormats: 'Choose a JPG or PNG image.',
  photoTips: [
    { title: 'Lay it flat', text: 'On a table or the floor, not folded.' },
    { title: 'Good light', text: 'Daylight or under a bulb, with no shadow on the bill.' },
    { title: 'The whole bill', text: 'All four corners in the photo.' },
  ],
  cameraCta: 'Open camera',
  galleryCta: 'Choose from gallery',
  checkTitle: 'Check the photo',
  checking: 'Checking the photo…',
  checkGood: 'The photo looks clear.',
  checkIssues: {
    blurry: 'The photo looks blurry; numbers may be misread.',
    dark: 'The photo is too dark.',
    small: 'The photo is too small; move closer to the bill.',
  },
  checkAdvice: 'Better to take it again.',
  checkUnreadable: 'This photo could not be opened. Take another one.',
  previewAlt: 'Your bill photo',
  usePhoto: 'Use this photo',
  usePhotoAnyway: 'Use this photo anyway',
  retake: 'Take the photo again',
  readingTitle: 'Reading your bill',
  retry: 'Try again',
  answerTitle: 'Your bill',
  payLabel: 'You need to pay',
  payBy: (date) => `Due date: ${date}`,
  payAfter: (amount) => `After the due date: ${amount}`,
  mainReasons: 'The most important thing',
  seeDetails: 'See all the details',
  askCta: 'Ask a question',
  newBillCta: 'Check another bill',
  sampleBanner: 'This is an example bill, not a real person’s.',
  detailsScreenTitle: 'All the details',
  glossaryTitle: 'Words on your bill',
  glossary: [
    { term: 'Unit', text: 'The electricity a 1,000-watt appliance uses in one hour. Your bill is worked out from units.' },
    { term: 'Arrears', text: 'Money from earlier bills that was not paid. It is added to this month’s bill.' },
    { term: 'Fuel price adjustment (FPA)', text: 'An amount approved by NEPRA when the cost of fuel for making electricity changes, usually charged on an earlier month’s units.' },
    { term: 'Protected', text: 'A household using 200 units or less every month for 6 months in a row gets lower rates.' },
    { term: 'Unprotected', text: 'If any month in the last 6 was over 200 units, higher rates apply.' },
    { term: 'LP surcharge', text: 'A penalty for paying after the due date.' },
    { term: 'Taxes', text: 'Government taxes on the bill, such as sales tax and electricity duty.' },
    { term: 'Subsidy', text: 'A discount on the bill paid by the government.' },
    { term: 'Reference number', text: 'Your connection’s number. You need it to see your bill online or file a complaint.' },
  ],
  askScreenTitle: 'Ask about your bill',
  suggestionsTitle: 'Tap a question, or type your own',
  suggestions: ['Why is my bill high?', 'How much do I pay, and by when?', 'What are arrears?', 'How can I become protected?'],
  docTitles: {
    home: 'BillWise · Understand your electricity bill', consent: 'Before you start · BillWise', photo: 'Take a photo · BillWise',
    check: 'Check the photo · BillWise', reading: 'Reading your bill · BillWise', answer: 'Your bill · BillWise',
    details: 'All the details · BillWise', ask: 'Ask a question · BillWise',
  },
  tagline: 'Your electricity bill, in plain words',
  intro: 'Take a photo of your bill; we explain in plain words how much it is and why.',
  switchTo: 'اردو',
  switchLabel: 'اردو میں دیکھیں (switch to Urdu)',
  upload: 'Upload bill photo',
  uploading: 'Reading bill…',
  uploadHint: 'Take a clear, straight photo of the whole bill with your phone camera.',
  consent: 'This is my own bill, or I have permission to use it, and I agree the photo is sent to OpenAI (USA) to be read.',
  privacyShortNothing: 'Privacy: your bill is not stored on our server.',
  privacyShortStored: 'Privacy: bill numbers are deleted automatically after 30 days.',
  newBill: 'Upload another bill',
  feedback: 'Give feedback or report a problem',
  warningsHint: 'These numbers may have been misread from the photo. Check them against your paper bill.',
  privacyNothing: 'Nothing is stored on our server: no photo, no name, no bill numbers. The result stays in your browser and is gone when you close the page. The listen text is sent to Microsoft. This is a demo: always check amounts against your paper bill.',
  privacyStored: 'The photo is not stored; bill numbers are deleted automatically after 30 days. The listen text is sent to Microsoft. This is a demo: always check amounts against your paper bill.',
  idle: 'No bill yet. Tick the box above, then upload a clear, straight photo of your electricity bill.',
  loading: 'Usually about 20 seconds. The first bill can take a minute or two.',
  errorTitle: 'Could not read the bill',
  warningsTitle: 'Check these before you rely on them:',
  glance: 'Your bill at a glance',
  units: 'Units',
  bill: 'Bill',
  dueDate: 'Due date',
  more: (n) => `${n} more than last month`,
  less: (n) => `${n} less than last month`,
  same: 'Same as last month',
  firstBill: 'First bill; comparison next month',
  rupees: (n) => `Rs ${n}`,
  plainWords: 'In plain words',
  listen: 'Listen',
  stop: 'Stop',
  issuedBy: 'Issued by',
  chargesTitle: 'What makes up your bill?',
  chargeCurrent: "This month's electricity (current bill)",
  chargeArrears: 'Unpaid from earlier bills (arrears)',
  chargeFpa: 'Fuel price adjustment (FPA)',
  chargeOther: 'Other adjustments',
  chargeTotal: 'Total',
  afterDue: (amount) => `After the due date: ${amount}`,
  whyTitle: 'Why is your bill this amount?',
  whyFromPrinted: "Earlier months come from the Bill History printed on your bill.",
  listenLoading: 'Preparing audio…',
  listenFailed: 'Could not play the audio. Check the internet and try again.',
  technical: 'Technical details',
  perUnitTitle: 'What did one unit cost?',
  perUnitNow: (x) => `This month: Rs ${x} per unit on average`,
  perUnitBefore: (x) => `Last month: Rs ${x} per unit`,
  whatIsUnit: 'What is a unit?',
  unitDefinition: 'One unit is the electricity a 1,000-watt appliance uses in one hour (1 kilowatt-hour).',
  unitExamples: [
    'A ceiling fan (about 75 W) running about 13 hours uses 1 unit',
    'An LED bulb (10 W) lit for about 100 hours uses 1 unit',
    'A 1.5-ton AC (about 1,500 W) running about 40 minutes uses 1 unit',
  ],
  extraUnits: (n, h) => `This month's ${n} extra units are about as much electricity as running a 1.5-ton AC for ${h} hours.`,
  fewerUnits: (n) => `This month you used ${n} fewer units than last month.`,
  approxNote: 'These are estimates; real use depends on your appliances.',
  chartTitle: 'Units by month',
  chartLabel: 'Units used per month',
  chartOne: "Upload next month's bill to see a comparison.",
  chartLimit: '200-unit limit: above it, rates go up',
  askTitle: 'Ask about your bill',
  askPlaceholder: 'Why did my bill go up?',
  askLabel: 'Your question',
  askHint: 'Ask in Urdu, Roman Urdu or English',
  ask: 'Ask',
  asking: 'Asking…',
  detailsTitle: 'Full bill details',
  fields: {
    account_no: 'Account number',
    billing_month: 'Billing month',
    previous_reading: 'Previous reading',
    current_reading: 'Current reading',
    units: 'Units used',
    amount: 'Amount',
    due_date: 'Due date',
  },
  hasWarning: 'has a warning',
  readOcr: 'Read with OCR',
  readPhoto: 'Read directly from the photo',
  readVision: 'OCR failed, so the bill was re-read from the photo',
  attempts: (n) => `(${n} attempt${n > 1 ? 's' : ''})`,
  reminderOn: 'Due-date reminder scheduled.',
  reminderOff: 'Reminder not scheduled (n8n is off).',
  errors: {
    unsupported_file_type: 'Choose a JPG or PNG photo of the bill.',
    file_too_large: 'Choose a photo smaller than 5 MB.',
    unreadable_image: 'This image could not be opened. Try another photo.',
    fields_not_found: 'Some key numbers were hard to read. Take a clear photo of the whole bill.',
    llm_error: 'We couldn’t read the bill right now. Please try again in a moment.',
    speech_failed: 'The audio couldn’t play. Please try again.',
    rate_limited: 'You’ve reached the limit for this hour. Please try again in an hour.',
    consent_required: 'Confirm you agree before sending the photo.',
    not_a_bill: 'This photo doesn’t look like an electricity bill. Try a clear photo of the whole bill.',
    daily_limit: 'BillWise has reached today’s limit. Please try again tomorrow.',
    server_busy: 'BillWise is busy reading other photos. Please try again in a minute.',
    network_error: 'We couldn’t connect. Check your internet connection and try again.',
    default: 'Something went wrong. Please try again.',
  },
}

export const STRINGS: Record<Lang, Strings> = { ur, en }

// ---- Companies that issue electricity bills in Pakistan ----------------------------------------
// The 11 government-owned DISCOs share the PITC bill format; K-Electric (Karachi) is private.
export const DISCOS: Record<string, { ur: string; en: string }> = {
  LESCO: { ur: 'لاہور الیکٹرک سپلائی کمپنی', en: 'Lahore Electric Supply Company' },
  IESCO: { ur: 'اسلام آباد الیکٹرک سپلائی کمپنی', en: 'Islamabad Electric Supply Company' },
  FESCO: { ur: 'فیصل آباد الیکٹرک سپلائی کمپنی', en: 'Faisalabad Electric Supply Company' },
  GEPCO: { ur: 'گوجرانوالہ الیکٹرک پاور کمپنی', en: 'Gujranwala Electric Power Company' },
  MEPCO: { ur: 'ملتان الیکٹرک پاور کمپنی', en: 'Multan Electric Power Company' },
  PESCO: { ur: 'پشاور الیکٹرک سپلائی کمپنی', en: 'Peshawar Electric Supply Company' },
  HAZECO: { ur: 'ہزارہ الیکٹرک سپلائی کمپنی', en: 'Hazara Electric Supply Company' },
  TESCO: { ur: 'ٹرائبل ایریاز الیکٹرک سپلائی کمپنی', en: 'Tribal Areas Electricity Supply Company' },
  HESCO: { ur: 'حیدرآباد الیکٹرک سپلائی کمپنی', en: 'Hyderabad Electric Supply Company' },
  SEPCO: { ur: 'سکھر الیکٹرک پاور کمپنی', en: 'Sukkur Electric Power Company' },
  QESCO: { ur: 'کوئٹہ الیکٹرک سپلائی کمپنی', en: 'Quetta Electric Supply Company' },
  'K-ELECTRIC': { ur: 'کے الیکٹرک (کراچی)', en: 'K-Electric (Karachi)' },
}

export function discoName(disco: string | null, lang: Lang): string | null {
  if (!disco) return null
  const key = disco.toUpperCase().replace(/\s+/g, '').replace('KELECTRIC', 'K-ELECTRIC')
  const known = DISCOS[key]
  return known ? `${disco.toUpperCase()} · ${known[lang]}` : disco
}

// ---- Reasons ("insights") computed by the backend, as fixed sentences -----------------------------

type Values = Record<string, number | string>

function num(v: Values, key: string): number {
  return Number(v[key])
}

function moreLess(diff: number, lang: Lang): string {
  if (lang === 'ur') return diff > 0 ? 'زیادہ' : 'کم'
  return diff > 0 ? 'more' : 'fewer'
}

/** One reason as a plain sentence. Returns null for codes this version does not know. */
export function insightText(code: string, v: Values, lang: Lang): string | null {
  const n = (key: string) => formatNumber(num(v, key))
  const month = (key: string) => formatDate(String(v[key]), lang, false)
  const ur = lang === 'ur'
  switch (code) {
    case 'arrears': {
      const base = ur ? `آپ کے بل میں ${n('arrears')} روپے پچھلا بقایا شامل ہے، یعنی پچھلے بل کی وہ رقم جو ادا نہیں ہوئی۔`
        : `Rs ${n('arrears')} of your bill is unpaid money from earlier bills (arrears).`
      if (!('from_month' in v)) return base
      return base + (ur ? ` ${month('from_month')} کا بل ${n('billed')} روپے تھا مگر صرف ${n('paid')} روپے جمع ہوئے۔`
        : ` The ${month('from_month')} bill was Rs ${n('billed')} but only Rs ${n('paid')} was paid.`)
    }
    case 'units_vs_last_month': {
      const d = num(v, 'diff')
      if (d === 0) return ur ? `اس مہینے ${n('units')} یونٹ استعمال ہوئے، ${month('previous_month')} کے برابر۔`
        : `You used ${n('units')} units this month, the same as ${month('previous_month')}.`
      return ur ? `اس مہینے ${n('units')} یونٹ استعمال ہوئے، جو ${month('previous_month')} (${n('previous_units')} یونٹ) سے ${formatNumber(Math.abs(d))} ${moreLess(d, lang)} ہیں۔`
        : `You used ${n('units')} units this month, ${formatNumber(Math.abs(d))} ${moreLess(d, lang)} than ${month('previous_month')} (${n('previous_units')} units).`
    }
    case 'units_vs_last_year': {
      const d = num(v, 'diff')
      if (d === 0) return ur ? `پچھلے سال اسی مہینے (${month('last_year_month')}) بھی ${n('last_year_units')} یونٹ استعمال ہوئے تھے۔`
        : `The same month last year (${month('last_year_month')}) also used ${n('last_year_units')} units.`
      return ur ? `پچھلے سال اسی مہینے (${month('last_year_month')}) ${n('last_year_units')} یونٹ استعمال ہوئے تھے، یعنی اس بار ${formatNumber(Math.abs(d))} یونٹ ${moreLess(d, lang)}۔`
        : `The same month last year (${month('last_year_month')}) used ${n('last_year_units')} units, so this year is ${formatNumber(Math.abs(d))} ${moreLess(d, lang)}.`
    }
    case 'unprotected_because':
      return ur ? `آپ کا کنکشن اس وقت «ان پروٹیکٹڈ» ہے، یعنی فی یونٹ ریٹ زیادہ ہے، کیونکہ ${month('month')} میں ${n('units')} یونٹ استعمال ہوئے جو ${n('limit')} کی حد سے زیادہ ہیں۔ لگاتار ${n('months')} مہینے ${n('limit')} یونٹ یا کم استعمال کرنے پر یہ دوبارہ «پروٹیکٹڈ» ہو سکتا ہے۔`
        : `Your connection is "unprotected" (higher rates per unit) because ${month('month')} used ${n('units')} units, above the ${n('limit')}-unit limit. ${n('months')} months in a row at ${n('limit')} units or less can make it "protected" again.`
    case 'unprotected':
      return ur ? `آپ کا کنکشن «ان پروٹیکٹڈ» ہے (زیادہ ریٹ)، کیونکہ پچھلے ${n('months')} مہینوں میں کسی مہینے ${n('limit')} سے زیادہ یونٹ استعمال ہوئے۔`
        : `Your connection is "unprotected" (higher rates): some month in the last ${n('months')} used more than ${n('limit')} units.`
    case 'protected':
      return ur ? `آپ کا کنکشن «پروٹیکٹڈ» ہے (کم ریٹ)۔ ہر مہینے ${n('limit')} یونٹ یا کم رکھیں تاکہ یہ رعایت برقرار رہے۔`
        : `Your connection is "protected" (lower rates). Keep every month at ${n('limit')} units or less to keep it.`
    case 'over_limit':
      return ur ? `خبردار: اس مہینے ${n('units')} یونٹ استعمال ہوئے جو ${n('limit')} سے زیادہ ہیں۔ اس سے اگلے ${n('months')} مہینے زیادہ ریٹ لگ سکتا ہے۔`
        : `Warning: this month used ${n('units')} units, above ${n('limit')}. Rates may go up for the next ${n('months')} months.`
    case 'fpa':
      return ur ? `بل میں ${n('fpa')} روپے فیول ایڈجسٹمنٹ (FPA) شامل ہے: بجلی بنانے والے ایندھن کی قیمت میں فرق کی وجہ سے یہ رقم لگتی ہے۔`
        : `Rs ${n('fpa')} fuel price adjustment (FPA) is included: it covers changes in the cost of fuel used to make electricity.`
    case 'taxes':
      return ur ? `اس بل پر ${n('taxes')} روپے ٹیکس ہے۔` : `This bill includes Rs ${n('taxes')} in taxes.`
    case 'late_fee':
      return ur ? `مقررہ تاریخ کے بعد ادائیگی پر ${n('extra')} روپے اضافی لگیں گے (کل ${n('payable_after_due')} روپے)۔`
        : `Paying after the due date adds Rs ${n('extra')} (total Rs ${n('payable_after_due')}).`
    case 'subsidy':
      return ur ? `حکومت نے اس بل پر ${n('subsidy')} روپے کی رعایت (سبسڈی) دی ہے۔` : `The government gave a Rs ${n('subsidy')} subsidy on this bill.`
    default:
      return null
  }
}

// ---- Checker warnings in Urdu ---------------------------------------------------------------------
// The backend writes warnings in English; older Urdu readers can't use them, so the known kinds are
// rewritten here with their numbers. Unknown kinds fall back to a general Urdu sentence.

const URDU_FIELDS: Record<string, string> = {
  'account no': 'کھاتہ نمبر', 'billing month': 'بلنگ کا مہینہ', units: 'یونٹ', amount: 'رقم', 'due date': 'آخری تاریخ',
}

export function warningText(message: string, lang: Lang): string {
  if (lang === 'en') return message
  let m: RegExpMatchArray | null
  if (message.startsWith('Missing meter readings')) return 'میٹر ریڈنگ نہیں پڑھی جا سکی، اس لیے یونٹ کی جانچ نہیں ہو سکی۔'
  if ((m = message.match(/^Missing (.+)\.$/))) return `بل پر ${URDU_FIELDS[m[1]] ?? m[1]} نہیں پڑھا جا سکا۔`
  if ((m = message.match(/^Units (\d+) do not match readings .* = (-?\d+)\.$/)))
    return `بل پر ${m[1]} یونٹ لکھے ہیں، مگر میٹر ریڈنگ کے حساب سے ${m[2]} یونٹ بنتے ہیں۔`
  if ((m = message.match(/^Charges do not add up: current bill ([\d,]+) \+ arrears ([\d,]+) \+ FPA ([\d,]+) = ([\d,]+), but the total is ([\d,]+)\.$/)))
    return `موجودہ بل ${m[1]} + بقایا ${m[2]} + فیول ایڈجسٹمنٹ ${m[3]} = ${m[4]} روپے بنتے ہیں، مگر کل رقم ${m[5]} روپے لکھی ہے۔`
  if (message.startsWith('Amount must be above zero')) return 'بل کی رقم صحیح نہیں پڑھی گئی۔'
  if (message.startsWith('Due date')) return 'آخری تاریخ بلنگ کے مہینے سے پہلے پڑھی گئی ہے، جو درست نہیں لگتا۔'
  if (message.startsWith('This does not look like')) return 'یہ تصویر بجلی کے بل کی نہیں لگتی۔'
  return 'بل کا ایک نمبر صحیح نہیں لگتا، براہ کرم اصل بل سے ملا لیں۔'
}
