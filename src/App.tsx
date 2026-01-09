import { AppProvider } from './shared/context/AppContext.tsx'
import { Main } from './pages/Main/Main.tsx'
import type { ImageConfig, ImagesComparatorEvents } from './index.tsx'
import './App.css'

interface AppProps {
  instanceId?: string;
  initialConfig?: {
    images?: ImageConfig[];
    height?: number | string;
    showLabels?: boolean;
  };
  events?: ImagesComparatorEvents;
}

function App({ instanceId, initialConfig, events }: AppProps) {
  return (
    <AppProvider instanceId={instanceId} initialConfig={initialConfig} events={events}>
      <Main />
    </AppProvider>
  )
}

export default App
