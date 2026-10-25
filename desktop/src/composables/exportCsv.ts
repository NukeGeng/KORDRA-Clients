import type { DemoRow } from '../fixtures/mockData'

export interface CsvColumn { key: string; label: string }

function escapeCsv(value: unknown): string {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function toCsv(rows: DemoRow[], columns: CsvColumn[]): string {
  return [
    columns.map((column) => escapeCsv(column.label)).join(','),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column.key])).join(',')),
  ].join('\r\n')
}

export function downloadCsv(filename: string, rows: DemoRow[], columns: CsvColumn[]): void {
  const blob = new Blob(['\ufeff', toCsv(rows, columns)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
