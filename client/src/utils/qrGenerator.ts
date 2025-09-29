import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

const defaultOptions: QRCodeOptions = {
  width: 256,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'M'
};

/**
 * Generate a QR code as a data URL (base64 image)
 */
export async function generateQRCodeDataURL(
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const dataURL = await QRCode.toDataURL(text, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel
    });
    
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate a QR code as an SVG string
 */
export async function generateQRCodeSVG(
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel
    });
    
    return svg;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

/**
 * Download QR code as an image file
 */
export function downloadQRCode(dataURL: string, filename: string = 'qrcode.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate QR code with custom styling for the app theme
 */
export async function generateStyledQRCode(
  text: string,
  isDarkMode: boolean = true
): Promise<string> {
  const options: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: isDarkMode ? '#ffffff' : '#000000',
      light: isDarkMode ? '#1f2937' : '#ffffff' // gray-800 for dark, white for light
    },
    errorCorrectionLevel: 'M'
  };
  
  return generateQRCodeDataURL(text, options);
}
