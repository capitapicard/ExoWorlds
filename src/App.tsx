import { Header } from './components/Header';
import { StellarMapPane } from './components/StellarMapPane';
import { CenterPane } from './components/CenterPane';
import { BottomPane } from './components/BottomPane';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Header />
      
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Stellar Map — 50% of horizontal space */}
        <StellarMapPane />

        {/* Right: Orbit view (70%) + Data Desk (30%) stacked vertically — 50% of horizontal space */}
        <div className="w-1/2 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-[7] min-h-0 overflow-hidden">
            <CenterPane />
          </div>
          <div className="flex-[3] min-h-0 overflow-hidden">
            <BottomPane />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
