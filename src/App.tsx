import { Header } from './components/Header';
import { StellarMapPane } from './components/StellarMapPane';
import { CenterPane } from './components/CenterPane';
import { BottomPane } from './components/BottomPane';
import { InnerSolarSystemPane } from './components/InnerSolarSystemPane';
import { OuterSolarSystemPane } from './components/OuterSolarSystemPane';
import { SolarPlanetViewport } from './components/SolarPlanetViewport';
import { SolarSatelliteDataDesk } from './components/SolarSatelliteDataDesk';
import { usePlanetStore } from './store/usePlanetStore';

function App() {
  const viewMode = usePlanetStore((state) => state.viewMode);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Header />
      
      <main className="flex-1 flex overflow-hidden min-h-0">
        {viewMode === 'exoplanets' && (
          <>
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
          </>
        )}

        {viewMode === 'inner-solar' && (
          <>
            {/* Left: Solar System Map — 50% of horizontal space */}
            <InnerSolarSystemPane />

            {/* Right: Satellites Viewport (70%) + Satellite Data Desk (30%) — 50% of horizontal space */}
            <div className="w-1/2 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-[7] min-h-0 overflow-hidden border-b border-slate-800">
                <SolarPlanetViewport />
              </div>
              <div className="flex-[3] min-h-0 overflow-hidden">
                <SolarSatelliteDataDesk />
              </div>
            </div>
          </>
        )}
        
        {viewMode === 'outer-solar' && <OuterSolarSystemPane />}
      </main>
    </div>
  );
}

export default App;
