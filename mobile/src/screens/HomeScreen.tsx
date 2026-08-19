import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { pakistaniCities } from '../constants/cities';

interface CounterBid {
  id: string;
  driverName: string;
  driverNameUr: string;
  driverPhone: string;
  truckNumber: string;
  truckType: string;
  route: string;
  originalPrice: number;
  offeredPrice: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  shipperCounterPrice?: number;
  shipperCounterNote?: string;
}

export default function HomeScreen() {
  const [role, setRole] = useState<'driver' | 'shipper' | 'fleet'>('driver');
  const [lang, setLang] = useState<'ur' | 'en'>('ur');

  // Driver Bids State
  const [bids, setBids] = useState<CounterBid[]>([
    {
      id: 'BID-901',
      driverName: 'Muhammad Aslam',
      driverNameUr: 'محمد اسلم',
      driverPhone: '+92 301 2345678',
      truckNumber: 'LHR-5678',
      truckType: 'Flatbed Trailer (25 Tons)',
      route: 'Multan → Karachi',
      originalPrice: 185000,
      offeredPrice: 178000,
      message: 'Ready to load today evening. Belts & double tarpaulin available.',
      status: 'pending',
    },
    {
      id: 'BID-902',
      driverName: 'Abdul Rasheed',
      driverNameUr: 'عبد الرشید',
      driverPhone: '+92 333 9876543',
      truckNumber: 'KHI-1234',
      truckType: 'Container Truck (20ft)',
      route: 'Faisalabad → Karachi',
      originalPrice: 165000,
      offeredPrice: 160000,
      message: 'Vehicle unloaded at Faisalabad dry port, ready for dispatch.',
      status: 'pending',
    },
  ]);

  // Modals State
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [targetBid, setTargetBid] = useState<CounterBid | null>(null);
  const [revisedPrice, setRevisedPrice] = useState('');
  const [shipperNote, setShipperNote] = useState('Final offer: Tolls included, loading labor on site.');

  // Direct Chat Modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatTarget, setChatTarget] = useState<CounterBid | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'driver', text: 'Assalam-o-Alaikum! Vehicle ready in Multan.', time: '02:30 PM' },
    { sender: 'shipper', text: 'Walaikum Assalam! Arrive at Gate 3 Bosan Road.', time: '02:32 PM' },
  ]);

  // Form State for Shipper Post Load
  const [pickupCity, setPickupCity] = useState('Multan');
  const [dropoffCity, setDropoffCity] = useState('Karachi');
  const [cargoType, setCargoType] = useState('Cotton Bales');
  const [offeredRate, setOfferedRate] = useState('185000');

  const handleAcceptBid = (bidId: string) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'accepted' } : b))
    );
    Alert.alert('✅ Bid Accepted', 'Escrow locked! Direct Chat unlocked with driver.');
  };

  const handleRejectBid = (bidId: string) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'rejected' } : b))
    );
  };

  const handleOpenCounterModal = (bid: CounterBid) => {
    setTargetBid(bid);
    setRevisedPrice((bid.offeredPrice + 3000).toString());
    setShowCounterModal(true);
  };

  const handleSubmitShipperCounter = () => {
    if (!targetBid) return;
    const priceNum = Number(revisedPrice);
    setBids((prev) =>
      prev.map((b) =>
        b.id === targetBid.id
          ? {
              ...b,
              shipperCounterPrice: priceNum,
              shipperCounterNote: shipperNote,
              message: `Shipper Counter Offer: Rs. ${priceNum.toLocaleString()} (${shipperNote})`,
            }
          : b
      )
    );
    setShowCounterModal(false);
    Alert.alert('📩 Counter Sent', `Revised offer of Rs. ${priceNum.toLocaleString()} sent back to driver.`);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: role,
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>🚚 SafarLoad Mobile</Text>
          <Text style={styles.subTitle}>سفر لوڈ لاجسٹکس پاکستان</Text>
        </View>

        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLang((prev) => (prev === 'en' ? 'ur' : 'en'))}
        >
          <Text style={styles.langBtnText}>{lang === 'en' ? 'اردو' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      {/* Role Switcher Tabs */}
      <View style={styles.roleBar}>
        <TouchableOpacity
          style={[styles.roleTab, role === 'driver' && styles.activeRoleTab]}
          onPress={() => setRole('driver')}
        >
          <Text style={[styles.roleTabText, role === 'driver' && styles.activeRoleTabText]}>
            👨‍✈️ Driver (ڈرائیور)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, role === 'shipper' && styles.activeRoleTab]}
          onPress={() => setRole('shipper')}
        >
          <Text style={[styles.roleTabText, role === 'shipper' && styles.activeRoleTabText]}>
            🏢 Shipper (شپر)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, role === 'fleet' && styles.activeRoleTab]}
          onPress={() => setRole('fleet')}
        >
          <Text style={[styles.roleTabText, role === 'fleet' && styles.activeRoleTabText]}>
            🚛 Fleet (فلیٹ)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* DRIVER ROLE MOBILE DASHBOARD */}
        {role === 'driver' && (
          <View>
            <View style={styles.bannerCard}>
              <Text style={styles.bannerTitle}>🟢 Ready for Return Load? (خالی گاڑی)</Text>
              <Text style={styles.bannerSub}>Broadcast your route to 10,000+ verified shippers across Pakistan.</Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Alert.alert('📡 Broadcast Active', 'Your vehicle is now visible on Shipper Return Radars!')}
              >
                <Text style={styles.actionBtnText}>📡 Broadcast Availability Live</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>📋 Available Cargo Loads & Bidding</Text>
            {bids.map((b) => (
              <View key={b.id} style={styles.bidCard}>
                <View style={styles.bidCardTop}>
                  <Text style={styles.bidRoute}>📍 {b.route}</Text>
                  <Text style={styles.bidPrice}>Rs. {b.offeredPrice.toLocaleString()}</Text>
                </View>

                <Text style={styles.bidDetail}>🚛 Truck: {b.truckType}</Text>
                <Text style={styles.bidDetail}>🏢 Shipper: Noor Textile Mills Ltd</Text>

                {b.shipperCounterPrice && (
                  <View style={styles.counterBox}>
                    <Text style={styles.counterTitle}>📩 Shipper Counter Offer:</Text>
                    <Text style={styles.counterPrice}>Rs. {b.shipperCounterPrice.toLocaleString()}</Text>
                    <Text style={styles.counterNote}>💬 "{b.shipperCounterNote}"</Text>
                  </View>
                )}

                <View style={styles.btnRow}>
                  {b.status === 'accepted' ? (
                    <TouchableOpacity
                      style={styles.chatBtn}
                      onPress={() => {
                        setChatTarget(b);
                        setShowChatModal(true);
                      }}
                    >
                      <Text style={styles.chatBtnText}>💬 Chat with Shipper</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => Alert.alert('🏷️ Counter Bid', `Bid of Rs. ${b.offeredPrice.toLocaleString()} submitted to Shipper.`)}
                    >
                      <Text style={styles.primaryBtnText}>⚡ Submit / Modify Counter Bid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SHIPPER ROLE MOBILE DASHBOARD */}
        {role === 'shipper' && (
          <View>
            <View style={styles.formCard}>
              <Text style={styles.sectionHeader}>📦 Post New Cargo Load</Text>

              <Text style={styles.label}>📍 Pickup City (پک اپ شہر):</Text>
              <TextInput style={styles.input} value={pickupCity} onChangeText={setPickupCity} />

              <Text style={styles.label}>🏁 Delivery City (ڈیلیوری شہر):</Text>
              <TextInput style={styles.input} value={dropoffCity} onChangeText={setDropoffCity} />

              <Text style={styles.label}>📦 Cargo Goods (سامان کی تفصیل):</Text>
              <TextInput style={styles.input} value={cargoType} onChangeText={setCargoType} />

              <Text style={styles.label}>💰 Freight Rate Offered (PKR):</Text>
              <TextInput style={styles.input} value={offeredRate} keyboardType="numeric" onChangeText={setOfferedRate} />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Alert.alert('🎉 Load Posted', `Freight load from ${pickupCity} to ${dropoffCity} published!`)}
              >
                <Text style={styles.actionBtnText}>🚀 Publish Freight Load</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>🏷️ Incoming Driver Counter Bids</Text>
            {bids.map((b) => (
              <View key={b.id} style={styles.bidCard}>
                <View style={styles.bidCardTop}>
                  <Text style={styles.bidDriver}>👨‍✈️ {b.driverName}</Text>
                  <Text style={styles.bidPrice}>Rs. {b.offeredPrice.toLocaleString()}</Text>
                </View>

                <Text style={styles.bidDetail}>🚛 Reg: {b.truckNumber} ({b.truckType})</Text>
                <Text style={styles.bidMessage}>💬 "{b.message}"</Text>

                <View style={styles.btnRow}>
                  {b.status === 'pending' ? (
                    <>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptBid(b.id)}>
                        <Text style={styles.acceptBtnText}>✅ Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.counterBtn} onPress={() => handleOpenCounterModal(b)}>
                        <Text style={styles.counterBtnText}>🔄 Counter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectBid(b.id)}>
                        <Text style={styles.rejectBtnText}>❌</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.chatBtn}
                      onPress={() => {
                        setChatTarget(b);
                        setShowChatModal(true);
                      }}
                    >
                      <Text style={styles.chatBtnText}>💬 Direct Chat with Driver</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* FLEET OWNER ROLE MOBILE DASHBOARD */}
        {role === 'fleet' && (
          <View>
            <View style={styles.bannerCard}>
              <Text style={styles.bannerTitle}>🏢 Al-Farooq Transport Co.</Text>
              <Text style={styles.bannerSub}>10 Trucks | 12 CNIC Verified Drivers | 100% Escrow Active</Text>
            </View>

            <Text style={styles.sectionHeader}>🚛 Fleet Vehicles & Driver Assignment</Text>
            {['LHR-5678 (Trailer)', 'KHI-1234 (Container)', 'FSD-9012 (Dumper)'].map((trk, i) => (
              <View key={i} style={styles.bidCard}>
                <Text style={styles.bidRoute}>🚛 {trk}</Text>
                <Text style={styles.bidDetail}>👨‍✈️ Driver: Muhammad Aslam (Active)</Text>
                <Text style={styles.bidDetail}>⛽ Fuel Meter: 85% | Status: En Route Karachi</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* SHIPPER COUNTER BID MODAL */}
      <Modal visible={showCounterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔄 Shipper Counter Offer</Text>

            <Text style={styles.label}>Your Revised Rate (PKR):</Text>
            <TextInput
              style={styles.input}
              value={revisedPrice}
              keyboardType="numeric"
              onChangeText={setRevisedPrice}
            />

            <Text style={styles.label}>Note / Terms to Driver:</Text>
            <TextInput style={styles.input} value={shipperNote} onChangeText={setShipperNote} />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => setShowCounterModal(false)}>
                <Text style={styles.rejectBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmitShipperCounter}>
                <Text style={styles.primaryBtnText}>📩 Send Counter Offer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DIRECT CHAT MODAL */}
      <Modal visible={showChatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.chatModalContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>💬 Direct Chat: {chatTarget?.driverName}</Text>
              <TouchableOpacity onPress={() => setShowChatModal(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatBody}>
              {chatMessages.map((m, i) => (
                <View
                  key={i}
                  style={[
                    styles.chatBubble,
                    m.sender === role ? styles.sentBubble : styles.receivedBubble,
                  ]}
                >
                  <Text style={styles.bubbleText}>{m.text}</Text>
                  <Text style={styles.bubbleTime}>{m.time}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type message..."
                placeholderTextColor="#94A3B8"
                value={chatInput}
                onChangeText={setChatInput}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendChat}>
                <Text style={styles.sendBtnText}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
  },
  subTitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  langBtnText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '600',
  },
  roleBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeRoleTab: {
    backgroundColor: '#10B981',
  },
  roleTabText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  activeRoleTabText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 12,
    marginTop: 8,
  },
  bidCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  bidCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bidRoute: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  bidDriver: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  bidPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  bidDetail: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  bidMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94A3B8',
    marginVertical: 6,
  },
  counterBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  counterTitle: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  counterPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  counterNote: {
    fontSize: 11,
    color: '#CBD5E1',
    fontStyle: 'italic',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  counterBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  counterBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F1F5F9',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  chatModalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    height: 500,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  chatHeader: {
    flexDirection: 'row',
    justify-content: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  closeText: {
    fontSize: 18,
    color: '#94A3B8',
  },
  chatBody: {
    flex: 1,
    marginVertical: 8,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  sentBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#10B981',
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  bubbleTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F1F5F9',
  },
  sendBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  sendBtnText: {
    fontSize: 16,
  },
});
