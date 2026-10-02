import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OnboardingScreen from './components/OnboardingScreen';
import BookingWizard from './components/BookingWizard';
import LiveTrackingMap from './components/LiveTrackingMap';
import BookingsList from './components/BookingsList';
import DriverPortal from './components/DriverPortal';
import VehicleSelector, { VEHICLE_TIERS } from './components/VehicleSelector';
import NotificationToast from './components/NotificationToast';
import AccountScreen from './components/AccountScreen';
import { triggerHaptic, configureStatusBar, hideSplashScreen } from './utils/nativeBridge';
import { Compass, Navigation, Clock, Truck, Wifi, Battery, Users, User } from 'lucide-react';

export default function App() {
  const [toggleMode, setToggleMode] = useState('Customer'); // 'Customer' or 'Driver'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Auth & Booking State from LocalStorage
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem('shiftly_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const storedAuth = localStorage.getItem('shiftly_auth_user');
      const storedBooking = localStorage.getItem('shiftly_current_booking');
      if (storedBooking) return 'track';
      if (storedAuth) return 'book';
      return 'welcome';
    } catch (e) {
      return 'welcome';
    }
  });

  useEffect(() => {
    hideSplashScreen();
    configureStatusBar(false);
  }, []);

  const [userBookings, setUserBookings] = useState(() => {
    try {
      const stored = localStorage.getItem('shiftly_user_bookings');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [currentBooking, setCurrentBooking] = useState(() => {
    try {
      const stored = localStorage.getItem('shiftly_current_booking');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [driverSyncedStatus, setDriverSyncedStatus] = useState(null);
  const [previewVehicle, setPreviewVehicle] = useState(VEHICLE_TIERS[1]);
  const [previewHelpers, setPreviewHelpers] = useState(2);

  // Shared 2-Way Realtime Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'driver',
      text: "Hi! I'm Marcus Vance, your Shiftly lead mover. I'm en route with our team and 26ft Box Truck.",
      time: '10:14 AM'
    },
    {
      id: 2,
      sender: 'driver',
      text: "Please let me know if there are any gate codes or parking restrictions at your pickup address.",
      time: '10:15 AM'
    }
  ]);

  // In-App Notification Toast
  const [activeToast, setActiveToast] = useState(null);

  const handleLogout = () => {
    try {
      localStorage.removeItem('shiftly_auth_user');
      localStorage.removeItem('shiftly_current_booking');
    } catch (e) {}
    setAuthUser(null);
    setCurrentBooking(null);
    setActiveTab('welcome');
    setActiveToast({
      icon: 'user',
      title: 'Signed Out',
      message: 'You have returned to the sign in screen'
    });
  };

  const handleSendCustomerMessage = (newMsg) => {
    setChatMessages((prev) => [...prev, newMsg]);
    // If user is currently looking at Driver portal, show toast
    if (toggleMode === 'Driver') {
      setActiveToast({
        icon: 'chat',
        title: 'New Customer Message (Sarah)',
        message: newMsg.text
      });
    }
  };

  const handleSendDriverMessage = (newMsg) => {
    setChatMessages((prev) => [...prev, newMsg]);
    // If user is looking at Customer mode, show toast
    if (toggleMode === 'Customer') {
      setActiveToast({
        icon: 'chat',
        title: 'Mover Marcus Vance',
        message: newMsg.text
      });
    }
  };

  const handleBookingConfirmed = (newBooking) => {
    setUserBookings((prev) => {
      const updated = [newBooking, ...prev];
      try {
        localStorage.setItem('shiftly_user_bookings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setCurrentBooking(newBooking);
    try {
      localStorage.setItem('shiftly_current_booking', JSON.stringify(newBooking));
    } catch (e) {}
    setActiveTab('track');
    setActiveToast({
      icon: 'truck',
      title: 'Mover Dispatched!',
      message: 'Marcus Vance (4.98 ★) accepted your move'
    });
  };

  const handleTrackExistingBooking = (booking) => {
    setCurrentBooking(booking);
    try {
      localStorage.setItem('shiftly_current_booking', JSON.stringify(booking));
    } catch (e) {}
    setActiveTab('track');
  };

  const handleDriverStatusSync = (newStatus, podData) => {
    setDriverSyncedStatus(newStatus);
    if (currentBooking) {
      setCurrentBooking((prev) => {
        const updated = { 
          ...prev, 
          status: newStatus,
          podCertificate: podData || prev?.podCertificate 
        };
        try {
          localStorage.setItem('shiftly_current_booking', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // Sync into user bookings history
      setUserBookings((prevList) => {
        const updatedList = prevList.map((b) => 
          b.id === currentBooking.id 
            ? { ...b, status: newStatus, podCertificate: podData || b.podCertificate } 
            : b
        );
        try {
          localStorage.setItem('shiftly_user_bookings', JSON.stringify(updatedList));
        } catch (e) {}
        return updatedList;
      });
    }

    const statusTitles = {
      driver_en_route: 'Driver En Route to Pickup',
      arrived_pickup: 'Driver Arrived at Pickup!',
      cargo_loaded: 'Cargo Verified & Secured',
      in_transit: 'Truck in Transit to Destination',
      completed: 'Move Completed! Proof of Delivery Signed ✓'
    };
    if (statusTitles[newStatus]) {
      setActiveToast({
        icon: 'truck',
        title: 'Move Status Update',
        message: statusTitles[newStatus]
      });
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Banner */}
      <NotificationToast 
        notification={activeToast} 
        onClose={() => setActiveToast(null)} 
        onClick={() => {
          if (activeToast?.icon === 'chat') {
            setActiveTab(toggleMode === 'Customer' ? 'track' : 'driver');
          }
          setActiveToast(null);
        }}
      />

      {/* Top Toggle Switch (Customer Mode | Driver Partner) */}
      <div className="top-toggle-pill">
        <button
          className={`top-toggle-btn ${toggleMode === 'Customer' ? 'active' : ''}`}
          onClick={() => {
            triggerHaptic('medium');
            setToggleMode('Customer');
            if (activeTab === 'driver') setActiveTab('book');
          }}
        >
          Customer Mode
        </button>
        <button
          className={`top-toggle-btn ${toggleMode === 'Driver' ? 'active' : ''}`}
          onClick={() => {
            triggerHaptic('medium');
            setToggleMode('Driver');
            setActiveTab('driver');
          }}
        >
          Driver Partner ⚡
        </button>
      </div>


      {/* Mobile Frame Container */}
      <div className={`mobile-frame ${isFullscreen ? 'fullscreen' : ''}`}>
        
        {/* Dynamic Island & iPhone Status Bar */}
        {!isFullscreen && (
          <div className="phone-notch-bar">
            <span className="screen-time">9:41</span>
            <div className="notch-island"></div>
            <div className="screen-icons">
              <Wifi size={14} />
              <Battery size={16} />
            </div>
          </div>
        )}

        <div className="mobile-screen">
          {activeTab !== 'welcome' && (
            <Header 
              setActiveTab={setActiveTab} 
              toggleMode={toggleMode}
              authUser={authUser}
              onLogout={handleLogout}
              onToggleMode={() => {
                const nextMode = toggleMode === 'Customer' ? 'Driver' : 'Customer';
                setToggleMode(nextMode);
                setActiveTab(nextMode === 'Driver' ? 'driver' : 'book');
              }}
            />
          )}

          {/* Main App Screens */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'welcome' && (
              <OnboardingScreen 
                onCompleteAuth={(userData) => {
                  setAuthUser(userData);
                  setActiveTab('book');
                }} 
              />
            )}

            {activeTab === 'book' && (
              <BookingWizard onBookingConfirmed={handleBookingConfirmed} />
            )}

            {activeTab === 'track' && (
              <LiveTrackingMap 
                booking={currentBooking} 
                syncedDriverStatus={driverSyncedStatus}
                sharedMessages={chatMessages}
                onSendCustomerMessage={handleSendCustomerMessage}
              />
            )}

            {activeTab === 'trips' && (
              <BookingsList
                bookings={userBookings}
                onTrackBooking={handleTrackExistingBooking}
                onNewBooking={() => setActiveTab('book')}
              />
            )}

            {activeTab === 'fleet' && (
              <div style={{ padding: '20px 20px 90px 20px', background: '#ffffff' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#000', fontWeight: 800, letterSpacing: '-0.5px' }}>
                    Shiftly Fleet
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Explore vehicle types & cargo capacities
                  </p>
                </div>

                <VehicleSelector
                  selectedVehicle={previewVehicle}
                  setSelectedVehicle={setPreviewVehicle}
                  helpersCount={previewHelpers}
                  setHelpersCount={setPreviewHelpers}
                />

                <div style={{ marginTop: '20px' }}>
                  <button
                    className="btn-black"
                    onClick={() => setActiveTab('book')}
                  >
                    Book {previewVehicle.name} Now
                  </button>
                </div>
              </div>
            )}

            {/* Account & Profile Screen */}
            {activeTab === 'account' && (
              <AccountScreen
                authUser={authUser}
                onLogout={handleLogout}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* Driver Partner Dispatch Portal */}
            {activeTab === 'driver' && (
              <DriverPortal 
                currentBooking={currentBooking}
                onSyncStatusWithCustomer={handleDriverStatusSync}
                sharedMessages={chatMessages}
                onSendDriverMessage={handleSendDriverMessage}
                onSwitchToCustomer={() => {
                  setToggleMode('Customer');
                  setActiveTab('book');
                }}
              />
            )}
          </main>

          {/* Bottom Nav Bar (visible in customer mode) */}
          {activeTab !== 'welcome' && activeTab !== 'driver' && (
            <nav className="bottom-nav">
              <button
                className={`nav-item ${activeTab === 'book' ? 'active' : ''}`}
                onClick={() => setActiveTab('book')}
              >
                <Compass size={20} />
                <span>Book Move</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                <Navigation size={20} />
                <span>Live Track</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'trips' ? 'active' : ''}`}
                onClick={() => setActiveTab('trips')}
              >
                <Clock size={20} />
                <span>My Trips</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <User size={20} />
                <span>Account</span>
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
