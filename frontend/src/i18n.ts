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
  listenLoading: '⏳ آواز تیار ہو رہی ہے…',
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
  listenLoading: '⏳ Preparing audio…',
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
