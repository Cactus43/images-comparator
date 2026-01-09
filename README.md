# Images Comparator

Una libreria React configurabile per comparare N immagini affiancate con slider interattivi per vedere i prima/dopo.

## Caratteristiche

- 🖼️ Comparazione di N immagini simultaneamente
- ↔️ Slider interattivi per visualizzare prima/dopo
- 🏷️ Etichette personalizzabili per ogni immagine
- 📱 Design responsive
- 🔧 API completa per controllo programmatico
- 📦 Utilizzabile come libreria standalone

## Struttura del Progetto

Il progetto segue una **Clean Architecture**:

```
src/
├── application/          # Use cases (logica applicativa)
│   └── use-cases/
├── domain/               # Entità e interfacce di dominio
│   ├── entities/
│   ├── repositories/
│   └── services/
├── infrastructure/       # Implementazioni concrete
│   ├── data/
│   ├── repositories/
│   └── services/
├── pages/               # Pagine dell'applicazione
│   └── Main/
├── shared/              # Contesto e utilities condivise
│   └── context/
└── ui/                  # Componenti UI
    └── components/
```

## Uso come Libreria

```javascript
import ImagesComparator from 'images-comparator';

// Crea l'istanza con configurazione ed eventi
const comparator = new ImagesComparator(
  // Configurazione
  {
    images: [
      { url: 'image1.jpg', label: 'Before' },
      { url: 'image2.jpg', label: 'After' }
    ],
    height: 500,
    showLabels: true,
  },
  // Eventi
  {
    onImageAdd: (image) => console.log('Added:', image),
    onImageRemove: (id) => console.log('Removed:', id),
    onSelectionChange: (ids) => console.log('Selected:', ids),
  }
);

// Monta su un elemento
comparator.render(document.getElementById('container'));

// API disponibili
comparator.addImage({ url: 'new-image.jpg', label: 'New' });
comparator.addImages([{ url: 'img1.jpg' }, { url: 'img2.jpg' }]);
comparator.removeImage('image-id');
comparator.clearImages();
comparator.selectImages(['id1', 'id2']);
comparator.selectAll();
comparator.clearSelection();
comparator.updateImageLabel('id', 'New Label');
comparator.getImages();
comparator.getSelectedIds();

// Smonta
comparator.unmount();
```

## Configurazione

| Opzione | Tipo | Default | Descrizione |
|---------|------|---------|-------------|
| `images` | `ImageConfig[]` | `[]` | Immagini iniziali |
| `height` | `number \| string` | `500` | Altezza della vista comparazione |
| `showLabels` | `boolean` | `true` | Mostra etichette sulle immagini |

### ImageConfig

```typescript
interface ImageConfig {
  id?: string;      // ID univoco (generato se omesso)
  url: string;      // URL dell'immagine
  label?: string;   // Etichetta da mostrare
  name?: string;    // Nome dell'immagine
}
```

## Eventi

| Evento | Parametri | Descrizione |
|--------|-----------|-------------|
| `onImageAdd` | `(image: ComparisonImage)` | Quando un'immagine viene aggiunta |
| `onImageRemove` | `(imageId: string)` | Quando un'immagine viene rimossa |
| `onSelectionChange` | `(selectedIds: string[])` | Quando la selezione cambia |
| `onSliderChange` | `(positions: number[])` | Quando gli slider si muovono |

## Scripts Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Build per produzione
- `npm run lint` - Esegue ESLint
- `npm run preview` - Preview della build di produzione

## Demo

Apri `library-demo.html` nel browser per vedere la demo interattiva.

## Tecnologie

- React 19
- TypeScript
- Vite (con Rolldown)
- Clean Architecture
