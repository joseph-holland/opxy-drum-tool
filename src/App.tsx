import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://op-patch.studio/';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ececec',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'IBM Plex Sans Condensed, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '3rem',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#2d2d2d',
          textTransform: 'lowercase'
        }}>
          op-patchstudio
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          color: '#666',
          lineHeight: '1.6',
          textTransform: 'lowercase'
        }}>
          we've moved to a new home!<br />
          redirecting you to the new website...
        </p>
        
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f8f8',
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}>
          <p style={{
            fontSize: '1rem',
            marginBottom: '1rem',
            color: '#555',
            textTransform: 'lowercase'
          }}>
            if you're not redirected automatically, click the link below:
          </p>
          
          <a 
            href="https://op-patch.studio/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2d2d2d',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
              textTransform: 'lowercase'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#404040'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2d2d2d'}
          >
            go to op-patch.studio
          </a>
        </div>
        
        <div style={{
          fontSize: '0.9rem',
          color: '#999',
          lineHeight: '1.5',
          textTransform: 'lowercase'
        }}>
          <p>
            thank you for using op-patchstudio!<br />
            the new site features improved tools and a better experience.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
