import React, { useState } from 'react';
import { createProject, saveProject } from './lib/projectStore.js';
import { hasProfile } from './lib/creatorProfile.js';
import HomeScreen from './screens/HomeScreen.jsx';
import MyStuffScreen from './screens/MyStuffScreen.jsx';
import BuilderScreen from './screens/BuilderScreen.jsx';
import PlayScreen from './screens/PlayScreen.jsx';
import NamePickerScreen from './screens/NamePickerScreen.jsx';
import OnboardingScreen from './screens/OnboardingScreen.jsx';
import SetupProfileScreen from './screens/SetupProfileScreen.jsx';
import WizardScreen from './screens/WizardScreen.jsx';
import PlaygroundScreen from './screens/PlaygroundScreen.jsx';
import ResultScreen from './screens/ResultScreen.jsx';
import PlayerScreen from './screens/PlayerScreen.jsx';

const SCREENS = {
  home: HomeScreen,
  myStuff: MyStuffScreen,
  builder: BuilderScreen,
  play: PlayScreen,
  namePicker: NamePickerScreen,
  onboarding: OnboardingScreen,
  setupProfile: SetupProfileScreen,
  wizard: WizardScreen,
  playground: PlaygroundScreen,
  result: ResultScreen,
  player: PlayerScreen,
};

function getInitialScreen() {
  // Deep link: ?play=filename.html
  const params = new URLSearchParams(window.location.search);
  const playFile = params.get('play');
  if (playFile) return { screen: 'player', params: { file: playFile } };

  if (!localStorage.getItem('kompisen_onboarded')) return { screen: 'onboarding', params: {} };
  if (!hasProfile()) return { screen: 'setupProfile', params: {} };
  return { screen: 'home', params: {} };
}

export default function App() {
  const initial = getInitialScreen();
  const [screen, setScreen] = useState(initial.screen);
  const [screenParams, setScreenParams] = useState(initial.params);
  const Screen = SCREENS[screen] || HomeScreen;

  function navigate(screenName, params = {}) {
    setScreenParams(params);
    setScreen(screenName);
  }

  // Build props: for namePicker, inject onConfirm so it navigates back to builder
  const screenProps = { navigate, ...screenParams };
  if (screen === 'namePicker') {
    const { returnTo, ...rest } = screenParams;
    screenProps.params = {
      ...rest,
      onConfirm: (pickedName) => {
        if (returnTo === 'saveResult') {
          const proj = createProject(rest.category, rest.answers, rest.file, pickedName);
          if (rest.thumb) proj.thumb = rest.thumb;
          saveProject(proj);
          navigate('myStuff', { justSaved: true, newCategory: rest.category });
        } else if (returnTo === 'builder') {
          navigate('builder', { ...rest, name: pickedName });
        } else {
          navigate(returnTo || 'home', { ...rest, name: pickedName });
        }
      },
    };
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      color: '#fff',
    }}>
      <Screen {...screenProps} />
    </div>
  );
}
