import React, { useState, useEffect } from 'react';

export default function Home() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setIsLightMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: isLightMode ? '#ffffff' : '#121212',
      color: isLightMode ? '#121212' : '#ffffff',
      transition: 'all 0.3s ease',
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: isLightMode ? '#e0e0e0' : '#333333',
      color: isLightMode ? '#000000' : '#ffffff',
      marginTop: '1rem',
    }
  };

  return (
    <main style={styles.container}>
      <h1>XALT Port Status: Initiated</h1>
      <p>System migration in progress...</p>
      
      <button onClick={toggleTheme} style={styles.button}>
        Switch to {isLightMode ? 'Dark' : 'Light'} Mode
      </button>
    </main>
  );
}
