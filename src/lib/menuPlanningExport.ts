import { Nutrition } from "@/lib/types";

export type MenuExportFormat = "Display" | "Nutritional";

type ExportRecipe = {
  _id?: string;
  name: string;
  category?: string;
  serving?: number;
  nutritional_info?: Partial<Nutrition>;
};

type CalendarDayExportItem = ExportRecipe | string | null;

export type CalendarDayExport = {
  _id: string;
  entrees?: CalendarDayExportItem[];
  vegetables?: CalendarDayExportItem[];
  fruits?: CalendarDayExportItem[];
  grains?: CalendarDayExportItem[];
  sides?: CalendarDayExportItem[];
};

type ExcelValue = string | number | null | undefined;

type ExcelCell = {
  value?: ExcelValue;
  style?: number;
  type?: "number" | "string";
};

type ExcelRow = {
  cells: ExcelCell[];
  height?: number;
};

type ExcelColumn = {
  width: number;
  hidden?: boolean;
};

type WorkbookDefinition = {
  sheetName: string;
  rows: ExcelRow[];
  columns: ExcelColumn[];
  landscape?: boolean;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

type ZipEntry = {
  name: string;
  data: Uint8Array;
};

const WORKDAY_COUNT = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

const NUTRITION_HEADERS = [
  "Item Name",
  "Quantity",
  "Measure",
  "Cals (kcal)",
  "Sod (mg)",
  "Prot (g)",
  "Vit C (mg)",
  "Vit A-RAE (mcg)",
  "Carb (g)",
  "Fat (g)",
  "FatCals (kcal)",
  "TransFat (g)",
  "SatFat (g)",
  "Chol (mg)",
  "TotFib (g)",
  "Calc (mg)",
  "Iron (mg)",
] as const;

const NUTRITION_COLUMN_COUNT = 19;

const DISPLAY_STYLES = {
  date: 8,
  recipeOdd: 9,
  recipeEven: 10,
  recipeBottomOdd: 11,
  recipeBottomEven: 12,
} as const;

const NUTRITION_STYLES = {
  title: 1,
  header: 2,
  totalLeft: 3,
  totalMiddle: 4,
  totalRight: 5,
  totalPlain: 6,
  recipe: 7,
  weekDivider: 13,
} as const;

type ExportMonth = {
  year: number;
  monthIndex: number;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnName(index: number) {
  let name = "";
  let current = index + 1;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }

  return name;
}

function cellRef(rowIndex: number, columnIndex: number) {
  return `${columnName(columnIndex)}${rowIndex + 1}`;
}

function isBlankCell(cell: ExcelCell | undefined) {
  return cell == null || (cell.value == null && cell.style == null);
}

function cellToXml(cell: ExcelCell | undefined, rowIndex: number, columnIndex: number) {
  if (isBlankCell(cell)) return "";

  const ref = cellRef(rowIndex, columnIndex);
  const style = cell?.style != null ? ` s="${cell.style}"` : "";
  const value = cell?.value;

  if (value == null || value === "") {
    return `<c r="${ref}"${style}/>`;
  }

  if (typeof value === "number" || cell?.type === "number") {
    return `<c r="${ref}"${style}><v>${value}</v></c>`;
  }

  return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`;
}

function rowsToXml(rows: ExcelRow[]) {
  return rows
    .map((row, rowIndex) => {
      const cells = row.cells.map((cell, columnIndex) => cellToXml(cell, rowIndex, columnIndex)).join("");
      const height = row.height != null ? ` ht="${row.height}" customHeight="1"` : "";

      return `<row r="${rowIndex + 1}"${height}>${cells}</row>`;
    })
    .join("");
}

function columnsToXml(columns: ExcelColumn[]) {
  if (columns.length === 0) return "";

  const cols = columns
    .map((column, index) => {
      const hidden = column.hidden ? ' hidden="1"' : "";
      return `<col min="${index + 1}" max="${index + 1}" width="${column.width}" customWidth="1"${hidden}/>`;
    })
    .join("");

  return `<cols>${cols}</cols>`;
}

function worksheetXml(workbook: WorkbookDefinition) {
  const maxColumns = workbook.columns.length;
  const lastCellRef = `${columnName(Math.max(0, maxColumns - 1))}${Math.max(1, workbook.rows.length)}`;
  const margins = workbook.margins ?? { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 };

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
    ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"',
    ' xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"',
    ' xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9">',
    '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>',
    '<dimension ref="A1:',
    lastCellRef,
    '"/>',
    '<sheetViews><sheetView workbookViewId="0"/></sheetViews>',
    '<sheetFormatPr defaultColWidth="12.63" defaultRowHeight="15"/>',
    columnsToXml(workbook.columns),
    "<sheetData>",
    rowsToXml(workbook.rows),
    "</sheetData>",
    '<printOptions gridLines="1"/>',
    `<pageMargins top="${margins.top}" right="${margins.right}" bottom="${margins.bottom}" left="${margins.left}" header="0" footer="0"/>`,
    `<pageSetup orientation="${workbook.landscape ? "landscape" : "portrait"}"/>`,
    "</worksheet>",
  ].join("");
}

function stylesXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    '<numFmts count="1"><numFmt numFmtId="164" formatCode="mmmm\\ d&quot;, &quot;yyyy"/></numFmts>',
    '<fonts count="5">',
    '<font><sz val="10"/><color rgb="FF000000"/><name val="Arial"/></font>',
    '<font><b/><sz val="10"/><color rgb="FF000000"/><name val="Arial"/></font>',
    '<font><sz val="10"/><color rgb="FF000000"/><name val="Arial"/></font>',
    '<font><b/><sz val="14"/><color rgb="FF000000"/><name val="Arial"/></font>',
    '<font><sz val="14"/><color rgb="FF000000"/><name val="Arial"/></font>',
    "</fonts>",
    '<fills count="5">',
    '<fill><patternFill patternType="none"/></fill>',
    '<fill><patternFill patternType="lightGray"/></fill>',
    '<fill><patternFill patternType="solid"><fgColor rgb="FF92D050"/><bgColor rgb="FF92D050"/></patternFill></fill>',
    '<fill><patternFill patternType="solid"><fgColor rgb="FF99CCFF"/><bgColor rgb="FF99CCFF"/></patternFill></fill>',
    '<fill><patternFill patternType="solid"><fgColor rgb="FFD9B3FF"/><bgColor rgb="FFD9B3FF"/></patternFill></fill>',
    "</fills>",
    '<borders count="8">',
    "<border/>",
    "<border><left/><right/><top/><bottom/></border>",
    '<border><left style="medium"><color rgb="FF000000"/></left><top style="medium"><color rgb="FF000000"/></top><bottom style="medium"><color rgb="FF000000"/></bottom></border>',
    '<border><top style="medium"><color rgb="FF000000"/></top><bottom style="medium"><color rgb="FF000000"/></bottom></border>',
    '<border><right style="medium"><color rgb="FF000000"/></right><top style="medium"><color rgb="FF000000"/></top><bottom style="medium"><color rgb="FF000000"/></bottom></border>',
    '<border><left style="medium"><color rgb="FF000000"/></left><right style="medium"><color rgb="FF000000"/></right><top style="medium"><color rgb="FF000000"/></top><bottom style="medium"><color rgb="FF000000"/></bottom></border>',
    '<border><left style="thin"><color rgb="FF000000"/></left><right style="thin"><color rgb="FF000000"/></right></border>',
    '<border><left style="thin"><color rgb="FF000000"/></left><right style="thin"><color rgb="FF000000"/></right><bottom style="thin"><color rgb="FF000000"/></bottom></border>',
    "</borders>",
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',
    '<cellXfs count="14">',
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>',
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>',
    '<xf numFmtId="0" fontId="2" fillId="4" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>',
    '<xf numFmtId="0" fontId="2" fillId="4" borderId="3" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>',
    '<xf numFmtId="0" fontId="2" fillId="4" borderId="4" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>',
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>',
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyFont="1"/>',
    '<xf numFmtId="164" fontId="3" fillId="0" borderId="5" xfId="0" applyFont="1" applyBorder="1" applyNumberFormat="1"><alignment horizontal="center"/></xf>',
    '<xf numFmtId="0" fontId="4" fillId="0" borderId="6" xfId="0" applyFont="1" applyBorder="1"><alignment wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"><alignment wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="4" fillId="0" borderId="7" xfId="0" applyFont="1" applyBorder="1"><alignment wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="4" fillId="0" borderId="3" xfId="0" applyFont="1" applyBorder="1"><alignment wrapText="1"/></xf>',
    '<xf numFmtId="0" fontId="1" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>',
    "</cellXfs>",
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>',
    '<dxfs count="0"/>',
    "</styleSheet>",
  ].join("");
}

function workbookXml(sheetName: string) {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
    ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
    "<bookViews><workbookView/></bookViews>",
    `<sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets>`,
    "</workbook>",
  ].join("");
}

function workbookRelsXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
    "</Relationships>",
  ].join("");
}

function rootRelsXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>',
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>',
    "</Relationships>",
  ].join("");
}

function contentTypesXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>',
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
    "</Types>",
  ].join("");
}

function appXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"',
    ' xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">',
    "<Application>Meals That Connect</Application>",
    "</Properties>",
  ].join("");
}

function coreXml() {
  const now = new Date().toISOString();

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"',
    ' xmlns:dc="http://purl.org/dc/elements/1.1/"',
    ' xmlns:dcterms="http://purl.org/dc/terms/"',
    ' xmlns:dcmitype="http://purl.org/dc/dcmitype/"',
    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
    "<dc:creator>Meals That Connect</dc:creator>",
    `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>`,
    `<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>`,
    "</cp:coreProperties>",
  ].join("");
}

function textEntry(name: string, text: string): ZipEntry {
  return {
    name,
    data: new TextEncoder().encode(text),
  };
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (let index = 0; index < data.length; index += 1) {
    const byte = data[index];
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function uint16(value: number) {
  const data = new Uint8Array(2);
  new DataView(data.buffer).setUint16(0, value, true);
  return data;
}

function uint32(value: number) {
  const data = new Uint8Array(4);
  new DataView(data.buffer).setUint32(0, value, true);
  return data;
}

function concatUint8Arrays(chunks: Uint8Array[]) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
}

function zipEntries(entries: ZipEntry[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const name = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const compressedSize = entry.data.length;
    const uncompressedSize = entry.data.length;

    const localHeader = concatUint8Arrays([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(crc),
      uint32(compressedSize),
      uint32(uncompressedSize),
      uint16(name.length),
      uint16(0),
      name,
    ]);

    localParts.push(localHeader, entry.data);

    const centralHeader = concatUint8Arrays([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(crc),
      uint32(compressedSize),
      uint32(uncompressedSize),
      uint16(name.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      name,
    ]);

    centralParts.push(centralHeader);
    offset += localHeader.length + entry.data.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = concatUint8Arrays([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(centralDirectory.length),
    uint32(offset),
    uint16(0),
  ]);

  return concatUint8Arrays([...localParts, centralDirectory, endRecord]);
}

function buildXlsxBlob(workbook: WorkbookDefinition) {
  const entries = [
    textEntry("[Content_Types].xml", contentTypesXml()),
    textEntry("_rels/.rels", rootRelsXml()),
    textEntry("docProps/app.xml", appXml()),
    textEntry("docProps/core.xml", coreXml()),
    textEntry("xl/workbook.xml", workbookXml(workbook.sheetName)),
    textEntry("xl/_rels/workbook.xml.rels", workbookRelsXml()),
    textEntry("xl/styles.xml", stylesXml()),
    textEntry("xl/worksheets/sheet1.xml", worksheetXml(workbook)),
  ];

  return new Blob([zipEntries(entries)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function dateToExcelSerial(date: Date) {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - EXCEL_EPOCH_UTC) / MS_PER_DAY;
}

export function formatCalendarDayId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function idToDate(id: string) {
  const year = Number(id.slice(0, 4));
  const month = Number(id.slice(4, 6)) - 1;
  const day = Number(id.slice(6, 8));

  return new Date(year, month, day);
}

function formatShortDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function getMonthName(monthIndex: number) {
  return new Date(2000, monthIndex, 1).toLocaleString(undefined, { month: "long" });
}

function isWeekday(date: Date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function isSameSelectedMonth(date: Date | null, year: number, monthIndex: number) {
  return date != null && date.getFullYear() === year && date.getMonth() === monthIndex;
}

export function getSelectedMonthWeekdays(year: number, monthIndex: number) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const dates: Date[] = [];

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, monthIndex, day);
    if (isWeekday(date)) dates.push(date);
  }

  return dates;
}

function getDisplayWorkWeeks(year: number, monthIndex: number) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const lastOfMonth = new Date(year, monthIndex + 1, 0);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  let cursor = addDays(firstOfMonth, -mondayOffset);
  const weeks: Array<Array<Date | null>> = [];

  while (cursor <= lastOfMonth) {
    const week = Array.from({ length: WORKDAY_COUNT }, (_, index) => {
      const date = addDays(cursor, index);
      return isSameSelectedMonth(date, year, monthIndex) ? date : null;
    });

    if (week.some(Boolean)) weeks.push(week);
    cursor = addDays(cursor, 7);
  }

  return weeks;
}

function getNutritionWorkWeeks(year: number, monthIndex: number) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const lastOfMonth = new Date(year, monthIndex + 1, 0);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  let cursor = addDays(firstOfMonth, -mondayOffset);
  const weeks: Date[][] = [];

  while (cursor <= lastOfMonth) {
    const week = Array.from({ length: WORKDAY_COUNT }, (_, index) => addDays(cursor, index));

    if (week.some((date) => isSameSelectedMonth(date, year, monthIndex))) {
      weeks.push(week);
    }

    cursor = addDays(cursor, 7);
  }

  return weeks;
}

export function getCalendarExportMonths(year: number, monthIndex: number, format: MenuExportFormat): ExportMonth[] {
  if (format === "Display") {
    return [{ year, monthIndex }];
  }

  const months = new Map<string, ExportMonth>();

  getNutritionWorkWeeks(year, monthIndex)
    .flat()
    .forEach((date) => {
      const exportMonth = {
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      };

      months.set(`${exportMonth.year}-${exportMonth.monthIndex}`, exportMonth);
    });

  return Array.from(months.values());
}

function getCalendarDayMap(days: CalendarDayExport[]) {
  return new Map(days.map((day) => [day._id, day]));
}

function emptyCalendarDay(id: string): CalendarDayExport {
  return {
    _id: id,
    entrees: [],
    vegetables: [],
    fruits: [],
    grains: [],
    sides: [],
  };
}

function getCalendarDay(dayMap: Map<string, CalendarDayExport>, date: Date) {
  const id = formatCalendarDayId(date);
  return dayMap.get(id) ?? emptyCalendarDay(id);
}

function isExportRecipe(item: CalendarDayExportItem): item is ExportRecipe {
  return typeof item === "object" && item !== null && typeof item.name === "string";
}

function getDayItems(day: CalendarDayExport | undefined) {
  return [
    ...(day?.entrees ?? []),
    ...(day?.vegetables ?? []),
    ...(day?.fruits ?? []),
    ...(day?.grains ?? []),
    ...(day?.sides ?? []),
  ].filter(isExportRecipe);
}

function numberOrZero(value: number | null | undefined) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function sumNutrition(items: ExportRecipe[]): Nutrition {
  return items.reduce(
    (total, item) => ({
      calories: total.calories + numberOrZero(item.nutritional_info?.calories),
      sodium: total.sodium + numberOrZero(item.nutritional_info?.sodium),
      protein: total.protein + numberOrZero(item.nutritional_info?.protein),
      carbs: total.carbs + numberOrZero(item.nutritional_info?.carbs),
      fat: total.fat + numberOrZero(item.nutritional_info?.fat),
      fiber: total.fiber + numberOrZero(item.nutritional_info?.fiber),
    }),
    { calories: 0, sodium: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

function nutritionValues(nutrition: Partial<Nutrition> | undefined) {
  const fat = numberOrZero(nutrition?.fat);

  return [
    round(numberOrZero(nutrition?.calories)),
    round(numberOrZero(nutrition?.sodium)),
    round(numberOrZero(nutrition?.protein)),
    "--",
    "--",
    round(numberOrZero(nutrition?.carbs)),
    round(fat),
    round(fat * 9),
    "--",
    "--",
    "--",
    round(numberOrZero(nutrition?.fiber)),
    "--",
    "--",
  ];
}

function buildDisplayWorkbook(days: CalendarDayExport[], year: number, monthIndex: number): WorkbookDefinition {
  const dayMap = getCalendarDayMap(days);
  const weeks = getDisplayWorkWeeks(year, monthIndex);
  const rows: ExcelRow[] = [];

  weeks.forEach((week) => {
    const weekDays = week.map((date) => (date ? getCalendarDay(dayMap, date) : undefined));
    const maxItemsInWeek = Math.max(5, ...weekDays.map((day) => getDayItems(day).length));

    rows.push({
      height: 29.25,
      cells: week.map((date) => ({
        value: date ? dateToExcelSerial(date) : "",
        style: DISPLAY_STYLES.date,
        type: date ? "number" : "string",
      })),
    });

    for (let itemIndex = 0; itemIndex < maxItemsInWeek; itemIndex += 1) {
      const isLastRecipeRow = itemIndex === maxItemsInWeek - 1;
      rows.push({
        height: 29.25,
        cells: weekDays.map((day, dayIndex) => {
          const oddColumn = dayIndex % 2 === 0;
          const style = isLastRecipeRow
            ? oddColumn
              ? DISPLAY_STYLES.recipeBottomOdd
              : DISPLAY_STYLES.recipeBottomEven
            : oddColumn
              ? DISPLAY_STYLES.recipeOdd
              : DISPLAY_STYLES.recipeEven;

          return {
            value: getDayItems(day)[itemIndex]?.name ?? "",
            style,
          };
        }),
      });
    }
  });

  return {
    sheetName: "Menu",
    landscape: true,
    columns: Array.from({ length: WORKDAY_COUNT }, () => ({ width: 40.38 })),
    rows,
  };
}

function buildNutritionWorkbook(days: CalendarDayExport[], year: number, monthIndex: number): WorkbookDefinition {
  const dayMap = getCalendarDayMap(days);
  const weeks = getNutritionWorkWeeks(year, monthIndex);
  const rows: ExcelRow[] = [
    {
      height: 14.25,
      cells: [
        {},
        {},
        {
          value: `SLO Senior Nutrition Program: ${getMonthName(monthIndex)} ${year}`,
          style: NUTRITION_STYLES.title,
        },
      ],
    },
    {
      height: 12.75,
      cells: [
        {},
        {},
        ...NUTRITION_HEADERS.map((header) => ({
          value: header,
          style: NUTRITION_STYLES.header,
        })),
      ],
    },
  ];

  weeks.forEach((week, weekIndex) => {
    rows.push({
      height: 12.75,
      cells: [
        {},
        {},
        ...Array.from({ length: NUTRITION_HEADERS.length }, (_, index) => ({
          value: index === 0 ? `Week ${weekIndex + 1}` : "",
          style: NUTRITION_STYLES.weekDivider,
        })),
      ],
    });

    week.forEach((date, dayIndex) => {
      const day = getCalendarDay(dayMap, date);
      const items = getDayItems(day);
      const totals = sumNutrition(items);
      const dayValues = nutritionValues(totals);

      rows.push({
        height: 12.75,
        cells: [
          { style: NUTRITION_STYLES.title },
          { style: NUTRITION_STYLES.title },
          { value: `Day ${dayIndex + 1} (${formatShortDate(date)})`, style: NUTRITION_STYLES.totalLeft },
          { style: NUTRITION_STYLES.totalMiddle },
          { style: NUTRITION_STYLES.totalMiddle },
          ...dayValues.map((value, valueIndex) => ({
            value,
            style: valueIndex === dayValues.length - 1 ? NUTRITION_STYLES.totalRight : NUTRITION_STYLES.totalMiddle,
          })),
        ],
      });

      items.forEach((item) => {
        const itemValues = nutritionValues(item.nutritional_info);
        const cells: ExcelCell[] = Array.from({ length: NUTRITION_COLUMN_COUNT }, () => ({
          style: NUTRITION_STYLES.recipe,
        }));

        cells[2] = { value: `    ${item.name}`, style: NUTRITION_STYLES.recipe };
        cells[3] = { value: item.serving ?? 1, style: NUTRITION_STYLES.recipe };
        cells[4] = { value: "Serving", style: NUTRITION_STYLES.recipe };
        itemValues.forEach((value, valueIndex) => {
          cells[valueIndex + 5] = { value, style: NUTRITION_STYLES.recipe };
        });

        rows.push({
          height: 12.75,
          cells,
        });
      });
    });
  });

  return {
    sheetName: "Menu",
    landscape: true,
    margins: { top: 0.3, right: 0.3, bottom: 0.3, left: 0.3 },
    columns: [
      { width: 8.88, hidden: true },
      { width: 8.88, hidden: true },
      { width: 51.75 },
      { width: 8.25 },
      { width: 12 },
      ...Array.from({ length: NUTRITION_COLUMN_COUNT - 5 }, () => ({ width: 8.63 })),
    ],
    rows,
  };
}

export function buildMenuExportWorkbook(
  days: CalendarDayExport[],
  year: number,
  monthIndex: number,
  format: MenuExportFormat,
) {
  return format === "Display"
    ? buildDisplayWorkbook(days, year, monthIndex)
    : buildNutritionWorkbook(days, year, monthIndex);
}

export function buildMenuExportBlob(
  days: CalendarDayExport[],
  year: number,
  monthIndex: number,
  format: MenuExportFormat,
) {
  return buildXlsxBlob(buildMenuExportWorkbook(days, year, monthIndex, format));
}

export function downloadMenuPlanningExport({
  days,
  year,
  monthIndex,
  format,
}: {
  days: CalendarDayExport[];
  year: number;
  monthIndex: number;
  format: MenuExportFormat;
}) {
  const fileName = `${year}_${String(monthIndex + 1).padStart(2, "0")}_MTC_Menu_${format}.xlsx`;

  downloadBlob(buildMenuExportBlob(days, year, monthIndex, format), fileName);
}

export async function downloadMenuPlanningExportForView({
  calendarView,
  viewDates,
  format,
}: {
  calendarView: "Month" | "Week" | "Day";
  viewDates: Date[];
  format: MenuExportFormat;
}) {
  const exportDate = getExportMonthDate(calendarView, viewDates);
  const year = exportDate.getFullYear();
  const monthIndex = exportDate.getMonth();
  const exportMonths = getCalendarExportMonths(year, monthIndex, format);
  const responses = await Promise.all(
    exportMonths.map((exportMonth) =>
      fetch(`/api/calendar?year=${exportMonth.year}&month=${exportMonth.monthIndex + 1}&populate=nutrition`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
  const failedResponse = responses.find((response) => !response.ok);

  if (failedResponse) {
    throw new Error(`Failed to fetch calendar export data: ${failedResponse.status}`);
  }

  const calendarMonths: CalendarDayExport[][] = await Promise.all(
    responses.map((response) => response.json() as Promise<CalendarDayExport[]>),
  );

  downloadMenuPlanningExport({
    days: sortCalendarDays(calendarMonths.flat()),
    year,
    monthIndex,
    format,
  });
}

export function getExportMonthDate(calendarView: "Month" | "Week" | "Day", viewDates: Date[]) {
  if (calendarView === "Month") {
    return viewDates[0] ?? new Date();
  }

  if (calendarView === "Week") {
    return viewDates.find((date) => date.getDate() === 1) ?? viewDates[Math.floor(viewDates.length / 2)] ?? new Date();
  }

  return viewDates[0] ?? new Date();
}

export function sortCalendarDays(days: CalendarDayExport[]) {
  return [...days].sort((a, b) => idToDate(a._id).getTime() - idToDate(b._id).getTime());
}
