import { useState, useCallback } from 'react';
import './App.css';
import type { Character, DrinkRecord } from './types';
import AgeGatePage from './pages/AgeGatePage';
import CharacterCreatePage from './pages/CharacterCreatePage';
import ModeSelectPage from './pages/ModeSelectPage';
import DrinkingPage from './pages/DrinkingPage';
import WhackAMolePage from './pages/WhackAMolePage';
import ResultPage from './pages/ResultPage';
import StoryPage from './pages/StoryPage';
import { checkAchievements } from './engine/achievements';
import type { Achievement, AchievementStats } from './engine/achievements';
import AchievementPopup from './components/game/AchievementPopup';

type AppPage = 'age-gate' | 'character' | 'mode-select' | 'drinking' | 'game' | 'result' | 'story';

function App() {
  const [page, setPage] = useState<AppPage>('age-gate');
  const [character, setCharacter] = useState<Character | null>(null);
  const [drinkRecords, setDrinkRecords] = useState<DrinkRecord[]>([]);
  const [maxBAC, setMaxBAC] = useState(0);
  const [gameBac, setGameBac] = useState(0);

  // Achievement State
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const handleAgeConfirm = useCallback(() => setPage('character'), []);

  const handleCharacterComplete = useCallback((char: Character) => {
    setCharacter(char);
    setPage('mode-select');
  }, []);

  const handleModeSelect = useCallback((mode: string) => {
    if (mode === 'story') {
      setPage('story');
    } else {
      setPage('drinking');
    }
  }, []);

  const handleStoryBack = useCallback(() => {
    setPage('mode-select');
  }, []);

  // Check achievements whenever stats update
  const handleStatsUpdate = useCallback((records: DrinkRecord[], currentMaxBAC: number) => {
    const stats: AchievementStats = {
      totalAlcohol: records.reduce((sum, r) => sum + r.alcoholGrams, 0),
      maxBAC: currentMaxBAC,
      drinksCount: records.length,
      drinkTypes: new Set(records.map(r => r.drinkId))
    };

    const newlyUnlocked = checkAchievements(stats, unlockedAchievements);

    if (newlyUnlocked.length > 0) {
      const newIds = newlyUnlocked.map(a => a.id);
      setUnlockedAchievements(prev => [...prev, ...newIds]);
      // Show the first one popup for now
      setCurrentAchievement(newlyUnlocked[0]);
    }
  }, [unlockedAchievements]);

  const handleCloseAchievement = useCallback(() => {
    setCurrentAchievement(null);
  }, []);

  const handleFinish = useCallback((records: DrinkRecord[], bac: number) => {
    setDrinkRecords(records);
    setMaxBAC(bac);
    setPage('result');
    // Final check
    handleStatsUpdate(records, bac);
  }, [handleStatsUpdate]);

  const handlePlayGame = useCallback((bac: number) => {
    setGameBac(bac);
    setPage('game');
  }, []);

  const handleGameBack = useCallback(() => setPage('drinking'), []);

  const handleRestart = useCallback(() => {
    setCharacter(null);
    setDrinkRecords([]);
    setMaxBAC(0);
    setPage('character');
  }, []);

  return (
    <>
      {/* Achievement Popup */}
      <AchievementPopup
        achievement={currentAchievement}
        onClose={handleCloseAchievement}
      />

      {/* Background particles */}
      <div className="bg-particles">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-particle"
            style={{
              width: 150 + i * 80,
              height: 150 + i * 80,
              left: `${10 + i * 15}%`,
              top: `${5 + i * 12}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + i * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Pages */}
      {page === 'age-gate' && (
        <AgeGatePage onConfirm={handleAgeConfirm} />
      )}
      {page === 'character' && (
        <CharacterCreatePage onComplete={handleCharacterComplete} />
      )}
      {page === 'mode-select' && (
        <ModeSelectPage onSelect={handleModeSelect} />
      )}
      {page === 'drinking' && character && (
        <DrinkingPage
          character={character}
          onFinish={handleFinish}
          onPlayGame={handlePlayGame}
          onUpdate={handleStatsUpdate}
        />
      )}
      {page === 'story' && (
        <StoryPage onBack={handleStoryBack} />
      )}
      {page === 'game' && (
        <WhackAMolePage bac={gameBac} onBack={handleGameBack} />
      )}
      {page === 'result' && character && (
        <ResultPage
          character={character}
          records={drinkRecords}
          maxBAC={maxBAC}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

export default App;
