import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  FontAwesome, 
  Entypo 
} from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';

NavigationBar.setBackgroundColorAsync("white");

export default function UserProfileScreen() {
  const [activeTab, setActiveTab] = useState('profile');

  // Demo user data
  const userData = {
    name: "John",
    dob: "Feb 15, 1988",
    gender: "Male",
    height: "5'7\"",
    weight: "145 lbs",
    bloodGroup: "O+",
    allergies: ["Peanuts", "Dust", "Penicillin"],
    emergencyContact: {
      name: "Micheal",
      relation: "Friend",
      phone: "+91 8987-6543-23"
    },
    connectedDevices: [
      { name: "Apple Watch Series 7", lastSync: "Today, 10:23 AM", status: "Connected" },
      { name: "Fitbit Charge 5", lastSync: "Yesterday, 8:15 PM", status: "Disconnected" }
    ],
    medicalHistory: [
      { condition: "Asthma", diagnosedYear: 2010, status: "Active" },
      { condition: "Appendectomy", diagnosedYear: 2015, status: "Resolved" }
    ],
    medications: [
      { name: "Albuterol", dosage: "90mcg", frequency: "As needed" },
      { name: "Vitamin D", dosage: "1000 IU", frequency: "Daily" }
    ],
    vaccinations: [
      { name: "COVID-19", date: "Jan 2023", brand: "Pfizer" },
      { name: "Flu Shot", date: "Oct 2024", brand: "N/A" }
    ],
    doctor: {
      name: "Dr. David",
      specialty: "Internal Medicine",
      phone: "+91 8987-6543-23",
      nextAppointment: "Nov 15, 2024 at 2:30 PM"
    }
  };

  // Content components for each tab
  const ProfileInfoContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.profileHeaderSection}>
        <Image
          source={{ uri: 'https://www.w3schools.com/howto/img_avatar.png' }} 
          style={styles.profileImage}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{userData.name}</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="cake-variant" size={16} color="#FF6B6B" />
            <Text style={styles.infoText}>{userData.dob}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#4ECDC4" />
            <Text style={styles.infoText}>{userData.gender}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Physical Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFD166' }]}>
              <MaterialCommunityIcons name="human-male-height" size={20} color="white" />
            </View>
            <Text style={styles.detailLabel}>Height</Text>
            <Text style={styles.detailValue}>{userData.height}</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#06D6A0' }]}>
              <FontAwesome5 name="weight" size={18} color="white" />
            </View>
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>{userData.weight}</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#EF476F' }]}>
              <FontAwesome5 name="tint" size={20} color="white" />
            </View>
            <Text style={styles.detailLabel}>Blood</Text>
            <Text style={styles.detailValue}>{userData.bloodGroup}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Allergies</Text>
        <View style={styles.allergiesContainer}>
          {userData.allergies.map((allergy, index) => (
            <View key={index} style={styles.allergyTag}>
              <Text style={styles.allergyText}>{allergy}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <View style={styles.emergencyContactCard}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="call" size={24} color="white" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{userData.emergencyContact.name}</Text>
            <Text style={styles.contactRelation}>{userData.emergencyContact.relation}</Text>
            <Text style={styles.contactPhone}>{userData.emergencyContact.phone}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const DevicesContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Connected Devices</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color="#4ECDC4" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        {userData.connectedDevices.map((device, index) => (
          <View key={index} style={styles.deviceCard}>
            <View style={[styles.deviceIconContainer, 
              { backgroundColor: device.status === "Connected" ? "#4ECDC4" : "#ccc" }]}>
              <FontAwesome5 
                name={device.name.includes("Apple") ? "apple" : "fitbit"} 
                size={20} 
                color="white" 
              />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceSyncInfo}>Last sync: {device.lastSync}</Text>
            </View>
            <View style={styles.deviceStatusContainer}>
              <View style={[styles.statusIndicator, 
                { backgroundColor: device.status === "Connected" ? "#4ECDC4" : "#ccc" }]} />
              <Text style={[styles.statusText, 
                { color: device.status === "Connected" ? "#4ECDC4" : "#999" }]}>
                {device.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const MedicalRecordsContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Medical Conditions</Text>
        {userData.medicalHistory.map((condition, index) => (
          <View key={index} style={styles.medicalConditionCard}>
            <View style={[styles.conditionIconContainer, 
              { backgroundColor: condition.status === "Active" ? "#FF6B6B" : "#4ECDC4" }]}>
              <FontAwesome5 
                name={condition.condition.toLowerCase().includes("asthma") ? "lungs" : "hospital"} 
                size={20} 
                color="white" 
              />
            </View>
            <View style={styles.conditionInfo}>
              <Text style={styles.conditionName}>{condition.condition}</Text>
              <Text style={styles.conditionDetails}>Diagnosed in {condition.diagnosedYear}</Text>
            </View>
            <View style={[styles.statusBadge, 
              { backgroundColor: condition.status === "Active" ? "#FFE0E0" : "#E0F8F7" }]}>
              <Text style={[styles.statusBadgeText, 
                { color: condition.status === "Active" ? "#FF6B6B" : "#4ECDC4" }]}>
                {condition.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Medications</Text>
        {userData.medications.map((medication, index) => (
          <View key={index} style={styles.medicationCard}>
            <View style={[styles.medicationIconContainer, { backgroundColor: "#FFD166" }]}>
              <FontAwesome5 name="pills" size={18} color="white" />
            </View>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <Text style={styles.medicationDetails}>
                {medication.dosage} • {medication.frequency}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Vaccination History</Text>
        {userData.vaccinations.map((vaccination, index) => (
          <View key={index} style={styles.vaccinationCard}>
            <View style={[styles.vaccinationIconContainer, { backgroundColor: "#06D6A0" }]}>
              <FontAwesome5 name="syringe" size={18} color="white" />
            </View>
            <View style={styles.vaccinationInfo}>
              <Text style={styles.vaccinationName}>{vaccination.name}</Text>
              <Text style={styles.vaccinationDetails}>
                {vaccination.date} • {vaccination.brand}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Medical Documents</Text>
        <TouchableOpacity style={styles.uploadDocButton}>
          <Ionicons name="cloud-upload-outline" size={24} color="#4ECDC4" />
          <Text style={styles.uploadDocText}>Upload Medical Documents</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const DoctorContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.doctorCardContainer}>
        <View style={styles.doctorHeader}>
          <View style={styles.doctorImageContainer}>
            <Image
              source={{ uri: 'https://www.w3schools.com/howto/img_avatar.png' }} 
              style={styles.doctorImage}
            />
          </View>
          <View style={styles.doctorHeaderInfo}>
            <Text style={styles.doctorName}>{userData.doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{userData.doctor.specialty}</Text>
            <View style={styles.callButtonContainer}>
              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call" size={16} color="white" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton}>
                <Ionicons name="chatbubble" size={16} color="white" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.appointmentSection}>
          <Text style={styles.appointmentSectionTitle}>Next Appointment</Text>
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentIconContainer}>
              <Ionicons name="calendar" size={24} color="white" />
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentDate}>{userData.doctor.nextAppointment}</Text>
              {/* <TouchableOpacity style={styles.rescheduleButton}>
                <Text style={styles.rescheduleText}>Reschedule</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.notesSectionTitle}>Doctor's Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>No recent notes from your doctor.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.findNewDoctorButton}>
          <Ionicons name="search" size={20} color="white" />
          <Text style={styles.findNewDoctorText}>Find New Doctor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render tab selector and content
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          {/* <Ionicons name="settings-outline" size={24} color="#333" /> */}
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]} 
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name="person" 
            size={22} 
            color={activeTab === 'profile' ? '#4ECDC4' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'devices' && styles.activeTab]} 
          onPress={() => setActiveTab('devices')}
        >
          <MaterialCommunityIcons 
            name="watch" 
            size={22} 
            color={activeTab === 'devices' ? '#FF6B6B' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'devices' && styles.activeTabText]}>Devices</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'medical' && styles.activeTab]} 
          onPress={() => setActiveTab('medical')}
        >
          <FontAwesome5 
            name="notes-medical" 
            size={22} 
            color={activeTab === 'medical' ? '#FFD166' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>Medical</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'doctor' && styles.activeTab]} 
          onPress={() => setActiveTab('doctor')}
        >
          <FontAwesome5 
            name="user-md" 
            size={22} 
            color={activeTab === 'doctor' ? '#06D6A0' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'doctor' && styles.activeTabText]}>Doctor</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {activeTab === 'profile' && <ProfileInfoContent />}
        {activeTab === 'devices' && <DevicesContent />}
        {activeTab === 'medical' && <MedicalRecordsContent />}
        {activeTab === 'doctor' && <DoctorContent />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginTop: 30
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginEnd : 15
  },
  editButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  tabContent: {
    padding: 16,
  },
  
  // Profile Info Section
  profileHeaderSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  nameContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },

  // Common section styles
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Physical details section
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    width: '30%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // Allergies section
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyTag: {
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  allergyText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },

  // Emergency contact section
  emergencyContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactDetails: {
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactRelation: {
    fontSize: 14,
    color: '#666',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Device section
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  deviceSyncInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  deviceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Medical records section
  medicalConditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  conditionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  conditionDetails: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Medication section
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  medicationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  medicationDetails: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  // Vaccination section
  vaccinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  vaccinationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaccinationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vaccinationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  vaccinationDetails: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  // Document upload
  uploadDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadDocText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Doctor section
  doctorCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  doctorImage: {
    width: 80,
    height: 90,
    borderRadius: 12,
  },
  doctorHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  callButtonContainer: {
    flexDirection: 'row',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  callButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  messageButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Appointment section
  appointmentSection: {
    marginBottom: 16,
  },
  appointmentSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  appointmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD166',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  rescheduleButton: {
    marginTop: 4,
  },
  rescheduleText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },

  // Notes section
  notesSection: {
    marginBottom: 16,
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },

  // Find new doctor button
  findNewDoctorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06D6A0',
    paddingVertical: 12,
    borderRadius: 8,
  },
  findNewDoctorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
