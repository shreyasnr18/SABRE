import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, SafeAreaView, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [showLoadRequest, setShowLoadRequest] = useState(false);
  const [activeDispatch, setActiveDispatch] = useState(false);

  // Simulate an incoming load request 3 seconds after going online
  useEffect(() => {
    let timer;
    if (isOnline && !activeDispatch) {
      timer = setTimeout(() => {
        setShowLoadRequest(true);
      }, 3000);
    } else {
      setShowLoadRequest(false);
    }
    return () => clearTimeout(timer);
  }, [isOnline, activeDispatch]);

  const handleAcceptLoad = () => {
    setShowLoadRequest(false);
    setActiveDispatch(true);
  };

  const handleDeclineLoad = () => {
    setShowLoadRequest(false);
    // It will pop up again in 3 seconds because of the effect, 
    // simulating a busy network for demonstration purposes.
  };

  const handleCompleteDispatch = () => {
    setActiveDispatch(false);
    setIsOnline(false); // Force them offline after delivery for demo
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* 
        This mobileContainer ensures that even on a massive desktop web browser,
        the app stays constrained to a phone-sized column in the center.
      */}
      <View style={styles.mobileContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu" size={32} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>S.A.B.R.E. FLEET</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Main Content Area depends on whether they are in an active dispatch */}
          {!activeDispatch ? (
            <>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>GOOD MORNING,{'\n'}ROHIT!</Text>
                <Text style={styles.subText}>
                  {isOnline ? "You're online. Scanning for freight..." : "You're offline. Go online to receive dispatch orders."}
                </Text>
              </View>

              {/* Online Toggle Card */}
              <View style={styles.toggleCard}>
                <View style={styles.toggleRow}>
                  <View>
                    <Text style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
                    <Text style={styles.statusSubText}>
                      {isOnline ? 'Receiving Load Requests' : 'Not receiving dispatches'}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#e0e0e0', true: '#FFC107' }}
                    thumbColor={'#ffffff'}
                    onValueChange={() => setIsOnline(!isOnline)}
                    value={isOnline}
                    style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
                  />
                </View>
                
                <TouchableOpacity 
                  style={[styles.goOnlineButton, isOnline && styles.goOfflineButton]}
                  onPress={() => setIsOnline(!isOnline)}
                >
                  <Text style={[styles.goOnlineButtonText, isOnline && {color: '#fff'}]}>
                    {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Today's Summary - Trucking Specific */}
              <Text style={styles.sectionTitle}>TODAY'S SUMMARY</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFF3CD' }]}>
                      <Ionicons name="cube" size={20} color="#FFC107" />
                    </View>
                    <Text style={styles.cardValue}>03</Text>
                  </View>
                  <Text style={styles.cardLabel}>Completed Loads</Text>
                </View>

                <View style={styles.summaryCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFF3CD' }]}>
                      <Ionicons name="cash" size={20} color="#FFC107" />
                    </View>
                    <Text style={styles.cardValue}>$342</Text>
                  </View>
                  <Text style={styles.cardLabel}>Freight Earnings</Text>
                </View>

                <View style={styles.summaryCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFF3CD' }]}>
                      <Ionicons name="speedometer" size={20} color="#FFC107" />
                    </View>
                    <Text style={styles.cardValue}>245</Text>
                  </View>
                  <Text style={styles.cardLabel}>Miles Driven</Text>
                </View>

                <View style={styles.summaryCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFF3CD' }]}>
                      <Ionicons name="shield-checkmark" size={20} color="#FFC107" />
                    </View>
                    <Text style={styles.cardValue}>98%</Text>
                  </View>
                  <Text style={styles.cardLabel}>On-Time Rating</Text>
                </View>
              </View>
            </>
          ) : (
            
            // ACTIVE DISPATCH VIEW
            <View style={styles.activeDispatchContainer}>
              <View style={styles.pulseIndicator}>
                <Text style={styles.pulseText}>ACTIVE LOAD EN ROUTE</Text>
              </View>

              <Text style={styles.dispatchTitle}>LOAD #TRX-902</Text>
              
              <View style={styles.timelineContainer}>
                <View style={styles.timelinePoint}>
                  <Ionicons name="location" size={24} color="#000" />
                  <View style={styles.timelineText}>
                    <Text style={styles.timelineLabel}>PICKUP WAREHOUSE</Text>
                    <Text style={styles.timelineValue}>Sector 18 Hub, Gurugram</Text>
                  </View>
                </View>
                
                <View style={styles.timelineLine} />
                
                <View style={styles.timelinePoint}>
                  <Ionicons name="flag" size={24} color="#FFC107" />
                  <View style={styles.timelineText}>
                    <Text style={styles.timelineLabel}>DROPOFF WAREHOUSE</Text>
                    <Text style={styles.timelineValue}>Nhava Sheva Port, Mumbai</Text>
                  </View>
                </View>
              </View>

              <View style={styles.loadDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>PAYOUT</Text>
                  <Text style={styles.detailValue}>$1,250</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>DISTANCE</Text>
                  <Text style={styles.detailValue}>1,400 KM</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>CARGO</Text>
                  <Text style={styles.detailValue}>Auto Parts (18 Tons)</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.navigateButton}>
                <Ionicons name="navigate" size={20} color="#000" style={{marginRight: 8}} />
                <Text style={styles.goOnlineButtonText}>START NAVIGATION</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.navigateButton, {backgroundColor: '#111', marginTop: 12}]} onPress={handleCompleteDispatch}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
                <Text style={[styles.goOnlineButtonText, {color: '#fff'}]}>MARK DELIVERED</Text>
              </TouchableOpacity>

            </View>
          )}

        </ScrollView>
      </View>

      {/* NEW LOAD REQUEST MODAL */}
      <Modal visible={showLoadRequest} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>NEW FREIGHT DISPATCH</Text>
              <Text style={styles.modalSubtitle}>Auto-declining in 30s...</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalPayout}>$1,250.00</Text>
              <Text style={styles.modalDistance}>1,400 KM Trip • 18 Tons Cargo</Text>

              <View style={styles.timelineContainer}>
                <View style={styles.timelinePoint}>
                  <Ionicons name="radio-button-on" size={20} color="#000" />
                  <Text style={styles.modalLocationText}>Gurugram, HR (Pickup)</Text>
                </View>
                <View style={[styles.timelineLine, {height: 20, marginLeft: 9}]} />
                <View style={styles.timelinePoint}>
                  <Ionicons name="location" size={20} color="#000" />
                  <Text style={styles.modalLocationText}>Mumbai, MH (Dropoff)</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.declineButton} onPress={handleDeclineLoad}>
                <Text style={styles.declineText}>DECLINE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptLoad}>
                <Text style={styles.acceptText}>ACCEPT LOAD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E0E0E0', // Darker background outside the phone area
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    width: '100%',
    maxWidth: 480, // Constrains width on desktop to look like a phone
    marginHorizontal: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  greetingContainer: {
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#000',
    lineHeight: 40,
  },
  subText: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    fontWeight: '500'
  },
  toggleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#000', // Hard, high contrast border
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
  },
  statusSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '500'
  },
  goOnlineButton: {
    backgroundColor: '#FFC107', 
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  goOfflineButton: {
    backgroundColor: '#111', 
    borderColor: '#111',
  },
  goOnlineButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    marginBottom: 16,
    letterSpacing: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
  },
  cardLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40, // extra padding for bottom edge
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalBody: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
  },
  modalPayout: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
  },
  modalDistance: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelinePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: '#ddd',
    marginLeft: 11,
    marginVertical: 4,
  },
  modalLocationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginLeft: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineButton: {
    width: '48%',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
  },
  acceptButton: {
    width: '48%',
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: '#FFC107',
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
  },
  declineText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  acceptText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },

  // Active Dispatch View
  activeDispatchContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  pulseIndicator: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  pulseText: {
    color: '#2E7D32',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  dispatchTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 24,
  },
  timelineText: {
    marginLeft: 16,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 1,
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    marginTop: 4,
  },
  loadDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  detailItem: {
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    marginTop: 4,
  },
  navigateButton: {
    backgroundColor: '#FFC107', 
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  }
});
