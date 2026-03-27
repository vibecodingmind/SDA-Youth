import QRCode from 'qrcode';
import { nanoid } from 'nanoid';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate a unique check-in code
 */
export function generateCheckInCode(): string {
  return `BB-${nanoid(8).toUpperCase()}`;
}

/**
 * Generate QR code as data URL (base64)
 */
export async function generateQRCodeDataUrl(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 300,
    margin = 2,
    color = { dark: '#000000', light: '#ffffff' }
  } = options;

  try {
    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin,
      color,
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSvg(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 300,
    margin = 2,
    color = { dark: '#000000', light: '#ffffff' }
  } = options;

  try {
    const svg = await QRCode.toString(data, {
      type: 'svg',
      width: size,
      margin,
      color,
      errorCorrectionLevel: 'M',
    });
    return svg;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

/**
 * Generate QR code as Buffer (for file storage)
 */
export async function generateQRCodeBuffer(
  data: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const {
    size = 300,
    margin = 2,
    color = { dark: '#000000', light: '#ffffff' }
  } = options;

  try {
    const buffer = await QRCode.toBuffer(data, {
      width: size,
      margin,
      color,
      errorCorrectionLevel: 'M',
    });
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}

/**
 * Generate event check-in QR code URL
 * The QR code contains a URL that can be scanned to check in
 */
export async function generateEventCheckInQR(
  eventId: string,
  checkInCode: string,
  baseUrl: string
): Promise<string> {
  const checkInUrl = `${baseUrl}/checkin/${eventId}/${checkInCode}`;
  return generateQRCodeDataUrl(checkInUrl);
}

/**
 * Generate QR code for event registration
 */
export async function generateEventRegistrationQR(
  eventId: string,
  baseUrl: string
): Promise<string> {
  const registrationUrl = `${baseUrl}/events/${eventId}/register`;
  return generateQRCodeDataUrl(registrationUrl);
}

/**
 * Generate a batch of unique check-in codes for an event
 */
export function generateBatchCheckInCodes(count: number): string[] {
  const codes = new Set<string>();
  while (codes.size < count) {
    codes.add(generateCheckInCode());
  }
  return Array.from(codes);
}
