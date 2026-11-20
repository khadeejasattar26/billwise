// Every piece of page text in Urdu and English. Urdu is the default: BillWise is for Pakistani households.

export type Lang = 'ur' | 'en'

/** Wrap Latin text (file names, "5 MB") inside Urdu so right-to-left layout can't reorder it. */
const iso = (s: string) => `\u2068${s}\u2069`

const ur = {
  tagline: 'بجلی کا بل، آسان زبان میں',
  intro: 'اپنے بجلی کے بل کی تصویر اپ لوڈ کریں۔ ہم بل پڑھ کر آسان الفاظ میں بتائیں گے کہ آپ نے کتنی بجلی استعمال کی اور بل کیوں بدلا۔',
  switchTo: 'English',
  switchLabel: 'Switch to English',
  upload: 'بل کی تصویر اپ لوڈ کریں',
  uploading: 'بل پڑھا جا رہا ہے…',
  uploadHint: `${iso('JPG')} یا ${iso('PNG')} تصویر، زیادہ سے زیادہ ${iso('5 MB')}`,
  idle: `ابھی کوئی بل نہیں۔ آزمانے کے لیے پہلے ${iso('samples/bill_2026_10.png')} اور پھر ${iso('bill_2026_11.png')} اپ لوڈ کریں۔`,
  loading: 'تصویر صاف کی جا رہی ہے اور بل پڑھا جا رہا ہے۔ اس میں 10 سے 30 سیکنڈ لگ سکتے ہیں۔',
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
  listen: '🔊 سنیں',
  stop: '⏹ روکیں',
  noVoice: 'اس فون یا براؤزر میں اردو آواز موجود نہیں۔ English منتخب کر کے سن سکتے ہیں۔',
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
  chartTitle: 'ہر مہینے کا بل',
  chartLabel: 'ہر مہینے کی رقم',
  chartOne: 'موازنے کے لیے اگلے مہینے کا بل بھی اپ لوڈ کریں۔',
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
    network_error: 'سرور سے رابطہ نہیں ہو سکا۔ کیا بیک اینڈ چل رہا ہے؟',
    default: 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔',
  } as Record<string, string>,
}

export type Strings = typeof ur

const en: Strings = {
  tagline: 'Your electricity bill, in plain words',
  intro: 'Upload a photo of your electricity bill. BillWise reads it and tells you, in simple words, how much electricity you used and why the bill changed.',
  switchTo: 'اردو',
  switchLabel: 'اردو میں دیکھیں (switch to Urdu)',
  upload: 'Upload bill photo',
  uploading: 'Reading bill…',
  uploadHint: 'JPG or PNG photo, up to 5 MB',
  idle: 'No bill yet. To try it, upload samples/bill_2026_10.png first, then bill_2026_11.png.',
  loading: 'Cleaning the photo and reading the bill. This takes 10–30 seconds.',
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
  listen: '🔊 Listen',
  stop: '⏹ Stop',
  noVoice: 'This phone or browser has no voice for this language.',
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
  chartTitle: 'Bill by month',
  chartLabel: 'Bill amount per month',
  chartOne: "Upload next month's bill to see a comparison.",
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
  readVision: 'OCR failed, so the bill was re-read from the photo',
  attempts: (n) => `(${n} attempt${n > 1 ? 's' : ''})`,
  reminderOn: 'Due-date reminder scheduled.',
  reminderOff: 'Reminder not scheduled (n8n is off).',
  errors: { default: 'Something went wrong. Please try again.' },
}

export const STRINGS: Record<Lang, Strings> = { ur, en }

/** Locale for dates and numbers. Urdu month names, but digits stay 0-9 as on Pakistani bills. */
export const LOCALE: Record<Lang, string> = { ur: 'ur-PK-u-nu-latn', en: 'en-GB' }

export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function formatDate(iso: string, lang: Lang, withDay = true, short = false): string {
  // Urdu has no short month names, so `short` only shortens English ("8 Dec 2026").
  const month = short && lang === 'en' ? 'short' : 'long'
  const options: Intl.DateTimeFormatOptions = withDay
    ? { day: 'numeric', month, year: 'numeric' }
    : { month, year: 'numeric' }
  return new Date(iso + 'T00:00:00').toLocaleDateString(LOCALE[lang], options)
}
