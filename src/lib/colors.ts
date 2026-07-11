export function getAverageColor(imageUrl: string, cacheKey: string): Promise<string> {
  return new Promise((resolve) => {
    // Check local storage cache first
    try {
      const cache = JSON.parse(localStorage.getItem('aetherMediaColors') || '{}');
      if (cache[cacheKey]) {
        resolve(cache[cacheKey]);
        return;
      }
    } catch (e) {
      console.error('Error reading color cache:', e);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('#e50914');
          return;
        }

        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);
        const imgData = ctx.getImageData(0, 0, 10, 10).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          const pr = imgData[i];
          const pg = imgData[i + 1];
          const pb = imgData[i + 2];
          
          // Calculate brightness (ITU-R BT.709)
          const brightness = (pr * 0.2126 + pg * 0.7152 + pb * 0.0722);
          
          // Exclude extremely dark or extremely white pixels for more vibrant colors
          if (brightness > 20 && brightness < 230) {
            r += pr;
            g += pg;
            b += pb;
            count++;
          }
        }

        if (count === 0) {
          resolve('#e50914');
          return;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Boost saturation slightly if the color is too muted
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        if (d < 30 && max > 50) {
          // Add a bit of vibrant color if it's too gray
          r = Math.min(255, Math.floor(r * 1.1));
          g = Math.floor(g * 0.9);
          b = Math.floor(b * 0.9);
        }

        const toHex = (c: number) => c.toString(16).padStart(2, '0');
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

        // Save to cache
        try {
          const cache = JSON.parse(localStorage.getItem('aetherMediaColors') || '{}');
          cache[cacheKey] = hex;
          localStorage.setItem('aetherMediaColors', JSON.stringify(cache));
        } catch (e) {
          console.error('Error saving color to cache:', e);
        }

        resolve(hex);
      } catch (err) {
        console.error('Error processing canvas color extraction:', err);
        resolve('#e50914'); // Fallback brand color
      }
    };

    img.onerror = () => {
      resolve('#e50914'); // Fallback
    };
  });
}

export function getCachedColor(cacheKey: string): string {
  try {
    const cache = JSON.parse(localStorage.getItem('aetherMediaColors') || '{}');
    return cache[cacheKey] || '#e50914';
  } catch (e) {
    return '#e50914';
  }
}
