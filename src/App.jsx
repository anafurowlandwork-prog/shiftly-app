import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OnboardingScreen from './components/OnboardingScreen';
import BookingWizard from './components/BookingWizard';
import LiveTrackingMap from './components/LiveTrackingMap';
import BookingsList from './components/BookingsList';
import DriverPortal from './components/DriverPortal';
import VehicleSelector, { VEHICLE_TIERS } from './components/VehicleSelector';
import NotificationToast from './components/NotificationToast';
import AuthModal from './components/AuthModal';
import { 
  subscribeToAuthState, 
  subscribeToBookings, 
  saveBooking, 
  updateBookingInCloud,
  sendChatMessage,
  logoutUser 
} from './services/firebase';
import { triggerHaptic, configureStatusBar, hideSplashScreen } from './utils/nativeBridge';
import { Compass, Navigation, Clock, Truck, Wifi, Battery, Users } from 'lucide-react';

export default function App() {
  const [toggleMode, setToggleMode] = useState('Customer'); // 'Customer' or 'Driver'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome', 'book', 'track', 'trips', 'fleet', 'driver'

  // User & Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRoleTarget, setAuthRoleTarget] = useState('customer');

  // Bookings & Fleet State
  const [userBookings, setUserBookings] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
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

  useEffect(() => {
    hideSplashScreen();
    configureStatusBar(false);

    // Subscribe to Authentication State
    const unsubscribeAuth = subscribeToAuthState((user) => {
      setCurrentUser(user);
    });

    // Subscribe to Cloud / Persistent Bookings
    const unsubscribeBookings = subscribeToBookings(currentUser?.uid, (bookings) => {
      if (bookings && bookings.length > 0) {
        setUserBookings(bookings);
        if (!currentBooking) {
          setCurrentBooking(bookings[0]);
        }
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeBookings) unsubscribeBookings();
    };
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setActiveToast({
      icon: 'check',
      title: 'Welcome!',
      message: `Signed in as ${user.displayName || user.email}`
    });
    if (user.role === 'driver') {
      setToggleMode('Driver');
      setActiveTab('driver');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setActiveToast({
      icon: 'check',
      title: 'Signed Out',
      message: 'You have been successfully signed out.'
    });
  };

  const handleSendCustomerMessage = async (newMsg) => {
    setChatMessages((prev) => [...prev, newMsg]);
    if (currentBooking?.id) {
      await sendChatMessage(currentBooking.id, newMsg);
    }
    if (toggleMode === 'Driver') {
      setActiveToast({
        icon: 'chat',
        title: `Message from ${currentUser?.displayName || 'Sarah'}`,
        message: newMsg.text
      });
    }
  };

  const handleSendDriverMessage = async (newMsg) => {
    setChatMessages((prev) => [...prev, newMsg]);
    if (currentBooking?.id) {
      await sendChatMessage(currentBooking.id, newMsg);
    }
    if (toggleMode === 'Customer') {
      setActiveToast({
        icon: 'chat',
        title: 'Mover Marcus Vance',
        message: newMsg.text
      });
    }
  };

  const handleBookingConfirmed = async (newBooking) => {
    const saved = await saveBooking({
      ...newBooking,
      userId: currentUser?.uid || 'guest_user',
      customerName: currentUser?.displayName || 'Sarah Jenkins',
      customerEmail: currentUser?.email || 'sarah@example.com'
    });

    setUserBookings((prev) => [saved, ...prev]);
    setCurrentBooking(saved);
    setActiveTab('track');
    setActiveToast({
      icon: 'truck',
      title: 'Move Confirmed & Saved!',
      message: `Booking #${saved.id} is synced to cloud.`
    });
  };

  const handleTrackExistingBooking = (booking) => {
    setCurrentBooking(booking);
    setActiveTab('track');
  };

  const handleDriverStatusSync = async (newStatus) => {
    setDriverSyncedStatus(newStatus);
    if (currentBooking) {
      setCurrentBooking((prev) => ({
        ...prev,
        status: newStatus
      }));
      await updateBookingInCloud(currentBooking.id, { status: newStatus });
    }
    const statusTitles = {
      driver_en_route: 'Driver En Route to Pickup',
      arrived_pickup: 'Driver Arrived at Pickup!',
      cargo_loaded: 'Cargo Verified & Secured',
      in_transit: 'Truck in Transit to Destination',
      completed: 'Move Completed! Payout Deposited'
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
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialRole={authRoleTarget}
      />

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
              currentUser={currentUser}
              onOpenAuthModal={() => {
                setAuthRoleTarget(toggleMode === 'Driver' ? 'driver' : 'customer');
                setIsAuthModalOpen(true);
              }}
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
                onCompleteAuth={() => setActiveTab('book')} 
                onOpenSignIn={() => {
                  setAuthRoleTarget('customer');
                  setIsAuthModalOpen(true);
                }}
              />
            )}

            {activeTab === 'book' && (
              <BookingWizard 
                onBookingConfirmed={handleBookingConfirmed} 
                currentUser={currentUser}
                onRequireAuth={() => {
                  setAuthRoleTarget('customer');
                  setIsAuthModalOpen(true);
                }}
              />
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

            {/* Driver Partner Dispatch Portal */}
            {activeTab === 'driver' && (
              <DriverPortal 
                currentUser={currentUser}
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
                className={`nav-item ${activeTab === 'fleet' ? 'active' : ''}`}
                onClick={() => setActiveTab('fleet')}
              >
                <Truck size={20} />
                <span>Fleet Types</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'trips' ? 'active' : ''}`}
                onClick={() => setActiveTab('trips')}
              >
                <Clock size={20} />
                <span>My Trips</span>
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
