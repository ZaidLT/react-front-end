import React from 'react';
import { Colors, Typography } from '../../styles';

// Static tiles rendered as simple HTML for server-side rendering

interface StaticHomeLayoutProps {
  isMobileApp: boolean;
}

/**
 * Server-rendered static layout that appears immediately
 * Contains all the static content that doesn't require JavaScript
 */
export default function StaticHomeLayout({ isMobileApp }: StaticHomeLayoutProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: isMobileApp ? 'transparent' : Colors.LIGHT_BLUE_BACKGROUND,
      position: 'relative',
    }}>
      {/* Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: isMobileApp ? '100vh' : '50vh',
        backgroundImage: 'url(/assets/home-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }} />

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: isMobileApp ? '380px' : '330px',
        paddingBottom: isMobileApp ? '100px' : '20px',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '30px',
          width: '100%',
          maxWidth: '600px',
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: isMobileApp ? '20px' : '24px',
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
            margin: 0,
          }}>
            What's up today
          </h1>
          
          {/* Refresh Button Placeholder */}
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              border: '2px solid #1976d2',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        </div>

        {/* Static Tiles Section - Simple HTML for server rendering */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '600px',
          marginBottom: '30px',
        }}>
          {/* First Row: House + My Hive */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobileApp ? '4px' : '8px',
            marginBottom: '-10px',
            zIndex: 2,
          }}>
            {/* House Tile */}
            <div style={{
              width: isMobileApp ? '100px' : '120px',
              height: isMobileApp ? '100px' : '120px',
              backgroundColor: Colors.WHITE,
              border: `2px solid ${Colors.LIGHT_GREY}`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '8px',
              }}>🏠</div>
              <span style={{
                fontSize: '12px',
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.DARK_GREY,
                textAlign: 'center',
              }}>House</span>
            </div>

            {/* My Hive Tile */}
            <div style={{
              width: isMobileApp ? '100px' : '120px',
              height: isMobileApp ? '100px' : '120px',
              backgroundColor: Colors.WHITE,
              border: `2px solid ${Colors.LIGHT_GREY}`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '8px',
              }}>👨‍👩‍👧‍👦</div>
              <span style={{
                fontSize: '12px',
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.DARK_GREY,
                textAlign: 'center',
              }}>My Hive</span>
            </div>
          </div>

          {/* Second Row: Eeva */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
          }}>
            {/* Eeva Tile */}
            <div style={{
              width: isMobileApp ? '100px' : '120px',
              height: isMobileApp ? '100px' : '120px',
              backgroundColor: Colors.WHITE,
              border: `2px solid ${Colors.LIGHT_GREY}`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '8px',
              }}>🤖</div>
              <span style={{
                fontSize: '12px',
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.DARK_GREY,
                textAlign: 'center',
              }}>Eeva</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Placeholder */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          padding: '20px',
          backgroundColor: Colors.WHITE,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: `1px solid ${Colors.LIGHT_GREY}`,
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e3f2fd',
            borderTop: '3px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{
            color: Colors.DARK_GREY,
            fontSize: '14px',
            margin: 0,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          }}>
            Loading your tasks and events...
          </p>
        </div>
      </div>

      {/* CSS Animations - Using regular style tag for server components */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}
