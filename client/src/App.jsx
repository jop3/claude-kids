import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen.jsx';
import MyStuffScreen from './screens/MyStuffScreen.jsx';
import BuilderScreen from './screens/BuilderScreen.jsx';
import PlayScreen from './screens/PlayScreen.jsx';
import NamePickerScreen from './screens/NamePickerScreen.jsx';
import OnboardingScreen from './screens/OnboardingScreen.jsx';

const SCREENS = {
  home: HomeScreen,
  myStuff: MyStuffScreen,
  builder: BuilderScreen,
  play: PlayScreen,
  namePicker: NamePickerScreen,
  onboarding: OnboardingScreen,
};

export default function App() {
  const [screen, setScreen] = useState(
    localStorage.getItem('kompisen_onboarded') ? 'home' : 'onboarding'
  );
  const [screenParams, setScreenParams] = useState({});
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
        if (returnTo === 'builder') {
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
