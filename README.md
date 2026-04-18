# Boss Gold — Landing Page

Landing page estática para la venta de bots de trading automatizado en XAUUSD (oro) con MetaTrader 4.

## Stack

- **HTML5** semántico con Schema markup JSON-LD
- **CSS3** — dark theme premium, paleta dorada, Playfair Display + DM Sans
- **JavaScript vanilla** — sin frameworks ni dependencias externas
- **Google Fonts** — única dependencia externa (CDN)

## Estructura de archivos

```
trading-bots-landing/
├── index.html              # Página principal (producción — usa .min)
├── sitemap.xml             # Sitemap para buscadores
├── README.md               # Este archivo
├── css/
│   ├── styles.css          # CSS fuente (desarrollo)
│   └── styles.min.css      # CSS minificado (producción) ← index.html apunta aquí
├── js/
│   ├── main.js             # JS fuente (desarrollo)
│   └── main.min.js         # JS minificado (producción) ← index.html apunta aquí
└── assets/
    └── images/             # Imágenes del proyecto
        └── og-cover.jpg    # PENDIENTE: imagen Open Graph 1200×630px
```

## Secciones de la página

| # | ID | Sección |
|---|-----|---------|
| — | `#hero` | Hero con timer de urgencia |
| — | `#estadisticas` | Estadísticas animadas |
| 2 | `#descripcion` | 3 pilares del sistema |
| 3 | `#buy` | Boss Gold BUY — ficha técnica |
| 4 | `#star` | Boss Gold STAR — ficha técnica |
| 5 | `#comparativa` | Tabla comparativa BUY vs STAR |
| 6 | `#ventajas` | 6 ventajas con íconos SVG |
| 7 | `#incluye` | Qué incluye la compra |
| 8 | `#requisitos` | Requisitos técnicos |
| — | `#testimonios` | 3 testimonios con estrellas |
| — | `#faq` | 5 preguntas frecuentes |
| — | `#footer-cta` | CTA final con botones de contacto |

## Personalización antes de publicar

### 1. Número de WhatsApp

Reemplaza `593XXXXXXXXX` con el número real (sin `+`, con código de país):

```
Buscar: 593XXXXXXXXX
Reemplazar: 593987654321   ← tu número real
```

Hay **7 ocurrencias** en `index.html`.

### 2. Usuario de Telegram

Reemplaza `tuusuario` con el username real:

```
Buscar: t.me/tuusuario
Reemplazar: t.me/BossGoldOficial
```

### 3. Dominio canónico

En el `<head>` de `index.html` y en `sitemap.xml`, reemplaza:

```
https://bossgold.com/  →  https://tudominio.com/
```

### 4. Imagen Open Graph

Coloca una imagen de 1200×630px en:

```
assets/images/og-cover.jpg
```

Esta imagen se muestra al compartir el link en WhatsApp, Facebook y LinkedIn.

### 5. Timer de urgencia

El timer se resetea desde `localStorage` cada 48 horas por usuario. Para cambiar la duración, edita en `js/main.js`:

```js
const DURATION = 48 * 60 * 60 * 1000;  // ← cambia 48 por las horas deseadas
```

Recuerda regenerar `main.min.js` después de cualquier cambio en `main.js`.

## Regenerar archivos minificados

Después de editar `styles.css` o `main.js`, ejecuta en PowerShell:

### CSS

```powershell
$css = Get-Content '.\css\styles.css' -Raw -Encoding UTF8
$css = [regex]::Replace($css, '/\*[\s\S]*?\*/', '')
$css = $css -replace '\s+', ' '
$css = ($css -replace '\s*{\s*', '{') -replace '\s*}\s*', '}'
$css = ($css -replace '\s*:\s*(?=[^/])', ':') -replace '\s*;\s*', ';'
$css = $css.Trim()
[System.IO.File]::WriteAllText((Resolve-Path '.\css\styles.min.css'), $css, [System.Text.Encoding]::UTF8)
```

### JS

```powershell
$js = Get-Content '.\js\main.js' -Raw
$js = [regex]::Replace($js, '(?m)^\s*//[^\n]*\n', '')
$js = [regex]::Replace($js, '/\*[\s\S]*?\*/', '')
$js = [regex]::Replace($js, '(\r?\n){2,}', "`n")
$js = [regex]::Replace($js, '(?m)^\s+', '')
$js = $js.Trim()
Set-Content '.\js\main.min.js' $js -Encoding UTF8
```

## Despliegue

La página es 100% estática. Puedes alojarla en:

- **Netlify** — arrastra la carpeta al dashboard o conecta con GitHub
- **Vercel** — `vercel --prod` desde la raíz del proyecto
- **GitHub Pages** — habilita Pages en el repositorio
- **Hosting tradicional** — sube todos los archivos vía FTP/SFTP

No requiere servidor, base de datos ni build step.

## SEO incluido

- Meta tags completos (title, description, keywords)
- Open Graph para redes sociales
- Twitter Card
- Schema JSON-LD: Organization, WebSite, Product ×2, FAQPage
- `sitemap.xml` con prioridades por sección
- Canonical URL
- `aria-label` en elementos interactivos
- Heading hierarchy correcta (1× H1, H2 por sección)
- `alt` descriptivo en imágenes/íconos interactivos

## Rendimiento (estimado sin servidor)

| Recurso | Original | Minificado |
|---------|----------|------------|
| CSS | ~42 KB | ~30 KB |
| JS | ~16 KB | ~12 KB |
| HTML | ~45 KB | — |
| Google Fonts | ~50 KB | — (CDN) |

**Total estimado:** ~137 KB sin imágenes.
