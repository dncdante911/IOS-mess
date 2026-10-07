/**
 * Файл для загрузки в RN — замена браузерного File/Blob из Windows-кода.
 *
 * В RN FormData принимает объект { uri, name, type } и сам стримит файл с
 * диска (без чтения в память), поэтому отдельный «large upload» не нужен.
 * Источники: expo-image-picker, expo-document-picker, expo-audio (запись),
 * expo-camera / vision-camera — у всех есть uri.
 */
export interface UploadFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

/** Имя File оставлено для совместимости с перенесёнными сигнатурами Windows. */
export type File = UploadFile;
export type Blob = UploadFile;

export function guessMime(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    pdf: 'application/pdf',
    zip: 'application/zip',
    apk: 'application/vnd.android.package-archive',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
  };
  return map[ext] ?? 'application/octet-stream';
}

export function toUploadFile(uri: string, name?: string, type?: string, size?: number): UploadFile {
  const fileName = name ?? uri.split('/').pop()?.split('?')[0] ?? 'file';
  return { uri, name: fileName, type: type ?? guessMime(fileName), size };
}

/** Добавляет файл в FormData в формате, который понимает RN-сеть. */
export function appendFile(form: FormData, field: string, file: UploadFile): void {
  form.append(field, { uri: file.uri, name: file.name, type: file.type || guessMime(file.name) } as unknown as string);
}
