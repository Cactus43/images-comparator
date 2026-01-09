import { AppProvider } from './shared/context/AppContext.tsx'
import { Main } from './pages/Main/Main.tsx'
import type { ImageConfig, ImagesComparatorEvents } from './index.tsx'
import './App.css'

interface AppProps {
  initialConfig?: {
    images?: ImageConfig[];
    height?: number | string;
    showLabels?: boolean;
  };
  events?: ImagesComparatorEvents;
}

function App({ initialConfig, events }: AppProps) {
  return (
    <AppProvider initialConfig={initialConfig} events={events}>
      <Main />
    </AppProvider>
  )
}

export default App
