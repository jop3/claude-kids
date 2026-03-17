import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen.jsx';
import MyStuffScreen from './screens/MyStuffScreen.jsx';
import BuilderScreen from './screens/BuilderScreen.jsx';
import PlayScreen from './screens/PlayScreen.jsx';
import NamePickerScreen from './screens/NamePickerScreen.jsx';

const SCREENS = {
  home: HomeScreen,
  myStuff: MyStuffScreen,
  builder: BuilderScreen,
  play: PlayScreen,
  namePicker: NamePickerScreen,
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [screenParams, setScreenParams] = useState({});
  const Screen = SCREENS[screen] || HomeScreen;

  function navigate(screenName, params = {}) {
    setScreenParams(params);
    setScreen(screenName);
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
      <Screen navigate={navigate} {...screenParams} />
    </div>
  );
}
