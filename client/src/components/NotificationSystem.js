// --- NotificationSystem.js ---
// React component for the notification system of the workflow.
// Provides real-time notifications for document status changes, returns, and approvals.
// Supports swipe-to-dismiss gestures and role-based notification filtering.

import React, { useState, useEffect, useRef } from 'react';

/**
 * NotificationSystem Component
 * 
 * This component provides real-time notifications for the PDF workflow system.
 * It monitors localStorage for new notifications and displays them based on user role.
 * 
 * Features:
 * - Role-based notification filtering
 * - Real-time updates (checks every 2 seconds)
 * - Auto-dismiss after 15 seconds
 * - Swipe-to-dismiss gestures
 * - Click to open documents
 * - Dark/light theme support
 * - Smooth animations and transitions
 * 
 * @param {boolean} dark - Dark/light theme state
 * @param {function} onOpenDocument - Callback function when document is clicked
 */
const NotificationSystem = ({ dark, onOpenDocument }) => {
  // State management for notifications and UI interactions
  const [notifications, setNotifications] = useState([]); // Current notifications to display
  const [swipeStates, setSwipeStates] = useState({}); // Touch/swipe state for each notification
  const notificationRefs = useRef({}); // Refs to notification DOM elements for animations

  // Check for new notifications every 2 seconds
  useEffect(() => {
    const checkForNotifications = () => {
      const storedNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]'); // Get all notifications
      const currentUser = atob(sessionStorage.getItem('authUser') || ''); // Get current user
      const currentRole = atob(sessionStorage.getItem('authRole') || ''); // Get current role
      // Get shown notification IDs for this user from sessionStorage
      const shownKey = `shownNotifications_${currentUser}`;
      const shownIds = JSON.parse(sessionStorage.getItem(shownKey) || '[]');
      // Filter notifications based on user role and target stage
      const userNotifications = storedNotifications.filter(notification => {
        // Students see notifications for documents returned to them (Stage0)
        if (currentRole === 'student' && notification.targetUser === currentUser && notification.targetStage === 'Stage0') {
          return true;
        }
        // Librarians see notifications for documents in their review stage (Stage1)
        if (currentRole === 'librarian' && notification.targetStage === 'Stage1') {
          return true;
        }
        // Reviewers see notifications for documents in final approval stage (Stage2)
        if (currentRole === 'reviewer' && notification.targetStage === 'Stage2') {
          return true;
        }
        return false;
      });
      // Only show notifications that have not been shown in this session
      const newNotifications = userNotifications.filter(notification =>
        !shownIds.includes(notification.id) && !notifications.find(n => n.id === notification.id)
      );
      if (newNotifications.length > 0) {
        setNotifications(prev => [...prev, ...newNotifications]); // Add new notifications to state
        // Mark these notifications as shown in sessionStorage
        const updatedShown = [...shownIds, ...newNotifications.map(n => n.id)];
        sessionStorage.setItem(shownKey, JSON.stringify(updatedShown));
      }
    };
    checkForNotifications(); // Run immediately on mount
    const interval = setInterval(checkForNotifications, 2000); // Check every 2 seconds
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [notifications]);

  // Auto-remove notifications after 15 seconds
  useEffect(() => {
    const timeouts = notifications.map(notification => {
      return setTimeout(() => {
        removeNotification(notification.id); // Remove notification after timeout
      }, 15000); // 15 second timeout
    });

    return () => timeouts.forEach(timeout => clearTimeout(timeout)); // Cleanup timeouts on unmount
  }, [notifications]);

  /**
   * Remove a notification by ID
   * 
   * @param {string} id - The notification ID to remove
   */
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id)); // Remove from notifications array
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[id]; // Clean up swipe state
      return newState;
    });
  };

  /**
   * Handle swipe gestures on notifications
   * 
   * @param {string} id - The notification ID
   * @param {string} direction - The swipe direction ('up', 'down', 'left', 'right')
   */
  const handleSwipe = (id, direction) => {
    if (direction === 'up') {
      removeNotification(id); // Remove notification on upward swipe
    }
  };

  /**
   * Handle click on notification
   * 
   * @param {Object} notification - The notification object
   */
  const handleClick = (notification) => {
    if (onOpenDocument && notification.filename) {
      onOpenDocument(notification.filename); // Call parent callback to open document
    }
    removeNotification(notification.id); // Remove notification after click
  };

  /**
   * Handle touch start event for swipe detection
   * 
   * @param {string} id - The notification ID
   * @param {TouchEvent} e - The touch event
   */
  const handleTouchStart = (id, e) => {
    const touch = e.touches[0]; // Get first touch point
    setSwipeStates(prev => ({
      ...prev,
      [id]: { startY: touch.clientY, startTime: Date.now() } // Store initial touch position and time
    }));
  };

  /**
   * Handle touch move event for swipe animation
   * 
   * @param {string} id - The notification ID
   * @param {TouchEvent} e - The touch event
   */
  const handleTouchMove = (id, e) => {
    const touch = e.touches[0]; // Get current touch point
    const swipeState = swipeStates[id]; // Get stored swipe state
    
    if (swipeState) {
      const deltaY = swipeState.startY - touch.clientY; // Calculate vertical distance
      const element = notificationRefs.current[id]; // Get notification DOM element
      
      if (element && deltaY > 50) {
        element.style.transform = `translateY(-${deltaY}px)`; // Move element up
        element.style.opacity = Math.max(0, 1 - deltaY / 100); // Fade out based on distance
      }
    }
  };

  /**
   * Handle touch end event to determine if swipe should trigger dismissal
   * 
   * @param {string} id - The notification ID
   * @param {TouchEvent} e - The touch event
   */
  const handleTouchEnd = (id, e) => {
    const swipeState = swipeStates[id]; // Get stored swipe state
    const element = notificationRefs.current[id]; // Get notification DOM element
    
    if (swipeState && element) {
      const deltaY = swipeState.startY - e.changedTouches[0].clientY; // Calculate final distance
      const deltaTime = Date.now() - swipeState.startTime; // Calculate swipe duration
      
      // Dismiss if swiped up far enough or fast enough
      if (deltaY > 80 || (deltaY > 50 && deltaTime < 300)) {
        handleSwipe(id, 'up'); // Trigger swipe dismissal
      } else {
        element.style.transform = ''; // Reset position
        element.style.opacity = ''; // Reset opacity
      }
    }
  };

  /**
   * NotificationSystem Component - Comprehensive Styling Object
   * 
   * This object contains all the styling for the notification system.
   * Each style function takes theme parameters (dark/light mode) and returns
   * appropriate CSS properties for responsive, accessible design.
   */
  const styles = {
    // Container for all notifications with fixed positioning
    notificationContainer: {
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)', // Center horizontally
      zIndex: 10000, // High z-index to appear above other content
      display: 'flex',
      flexDirection: 'column',
      gap: 10, // Space between notifications
      pointerEvents: 'none', // Allow clicks to pass through container
    },
    // Individual notification styling with theme support
    notification: (dark, isVisible) => ({
      background: dark ? 'rgba(36, 18, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)', // Semi-transparent background
      border: `2px solid ${dark ? '#4F2683' : '#bbaed6'}`, // Theme-based border
      borderRadius: 12, // Rounded corners
      padding: '16px 20px', // Internal spacing
      minWidth: 300, // Minimum width
      maxWidth: 400, // Maximum width
      boxShadow: dark 
        ? '0 8px 32px rgba(79, 38, 131, 0.3)' 
        : '0 8px 32px rgba(0, 0, 0, 0.15)', // Theme-based shadow
      color: dark ? '#e0d6f7' : '#201436', // Theme-based text color
      fontFamily: "'BentonSans Book', sans-serif",
      fontSize: '14px',
      lineHeight: 1.4,
      cursor: 'pointer', // Indicate clickable
      pointerEvents: 'auto', // Enable clicks on notification
      transform: isVisible ? 'translateY(0)' : 'translateY(-100px)', // Slide in/out animation
      opacity: isVisible ? 1 : 0, // Fade in/out
      transition: 'all 0.3s ease', // Smooth transitions
      backdropFilter: 'blur(10px)', // Background blur effect
      borderLeft: `4px solid #dc2626`, // Red accent border for urgency
    }),
    // Header section with title and close button
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    // Notification title styling
    title: (dark) => ({
      fontWeight: 600,
      fontSize: '16px',
      color: dark ? '#e0d6f7' : '#201436',
      margin: 0,
    }),
    // Close button styling
    closeButton: (dark) => ({
      background: 'none',
      border: 'none',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: '18px',
      cursor: 'pointer',
      padding: 0,
      width: 24,
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: dark ? 'rgba(224, 214, 247, 0.1)' : 'rgba(32, 20, 54, 0.1)',
      },
    }),
    // Notification message styling
    message: (dark) => ({
      margin: 0,
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: '14px',
    }),
    // Swipe hint text styling
    swipeHint: (dark) => ({
      fontSize: '12px',
      color: dark ? 'rgba(224, 214, 247, 0.7)' : 'rgba(32, 20, 54, 0.7)',
      marginTop: 8,
      textAlign: 'center',
      fontStyle: 'italic',
    }),
  };

  return (
    <div style={styles.notificationContainer}>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          ref={el => notificationRefs.current[notification.id] = el}
          style={styles.notification(dark, true)}
          onClick={() => handleClick(notification)}
          onTouchStart={(e) => handleTouchStart(notification.id, e)}
          onTouchMove={(e) => handleTouchMove(notification.id, e)}
          onTouchEnd={(e) => handleTouchEnd(notification.id, e)}
        >
          <div style={styles.header}>
            <h4 style={styles.title(dark)}>📄 Document Returned</h4>
            <button
              style={styles.closeButton(dark)}
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = dark ? 'rgba(224, 214, 247, 0.1)' : 'rgba(32, 20, 54, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>
          </div>
          <p style={styles.message(dark)}>
            {notification.filename} has been sent back to you for review.
          </p>
          <p style={styles.swipeHint(dark)}>
            Tap to open • Swipe up to dismiss
          </p>
          <p style={{
            fontSize: '11px',
            color: dark ? 'rgba(224, 214, 247, 0.5)' : 'rgba(32, 20, 54, 0.5)',
            marginTop: 2,
            marginBottom: 0,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            (wait or click to dismiss)
          </p>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem; 