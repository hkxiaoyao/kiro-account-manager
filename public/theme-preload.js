(function () {
  try {
    const theme = localStorage.getItem('theme') || 'light'
    const colors = {
      light: '#f8fafc',
      dark: '#09090b',
      'dark-one': '#1b1e23',
      tech: '#020617',
      midnight: '#000000',
      purple: '#f5f3ff',
      green: '#f0fdf4',
      business: '#fffaf0',
      sunset: '#fff7ed',
      ocean: '#f0f9ff',
      forest: '#f0fdf4',
      rose: '#fff1f2',
      aurora: '#f0fdfa',
      sakura: '#fff5f7',
    }
    document.body.style.backgroundColor = colors[theme] || colors.light
  } catch (e) {
    document.body.style.backgroundColor = '#f8fafc'
  }
})()
