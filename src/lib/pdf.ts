let notoBengaliFontLoaded = false;

export async function loadNotoSansBengaliFont() {
  if (notoBengaliFontLoaded) return;

  // Fetch Google Fonts CSS and extract a direct TTF URL
  const cssResp = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400&display=swap'
  );
  const cssText = await cssResp.text();

  const match = cssText.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.ttf)\)/);
  if (!match) return;

  const fontUrl = match[1];
  const fontResp = await fetch(fontUrl);
  const fontData = await fontResp.arrayBuffer();

  const base64 = btoa(String.fromCharCode(...new Uint8Array(fontData)));

  // jsPDF expects font data in its virtual file system
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jspdfAny = (await import('jspdf')) as any;
  jspdfAny.jsPDF.API.addFileToVFS('NotoSansBengali.ttf', base64);
  jspdfAny.jsPDF.API.addFont('NotoSansBengali.ttf', 'NotoSansBengali', 'normal');

  notoBengaliFontLoaded = true;
}
