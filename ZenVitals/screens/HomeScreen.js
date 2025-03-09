import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

let PatientVitalData;

const vitals = {
    "HeartRate": [68, 72, 78, 74, 75, 70],
    "bpm": 73,
    "spo2": 98,
    "systolic": 120,
    "diastolic": 80,
    "RespiratoryRate": 16,
    "SkinTemperature": 36.5,
    "ActivityCalories": 450,
    "SleepTracking": "7h 30m"
}

const HomeScreen = () => {
    const screenWidth = Dimensions.get('window').width;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchData = async () => {
        try {
            const response = await fetch('http://YOURAPILINK/patientVitals');
            const result = await response.json();
            setData(result);
        } catch (error) {
            setError(error.message);
            setData(vitals);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData,5000);
        return () => clearInterval(intervalId);
    }, []);
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    PatientVitalData = data;

    // Health Vitals Functions
    const heartRateData = {
        labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
        datasets: [{
                data: data.HeartRate,
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                strokeWidth: 2
            }],
    };
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Health Metrics</Text>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Heart Rate Card with Line Chart */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="heart-pulse" size={24} color="#e74c3c" />
                        <Text style={styles.cardTitle}>Heart Rate</Text>
                        <Text style={styles.currentValue}>{data.bpm} BPM</Text>
                    </View>
                    <LineChart
                        data={heartRateData}
                        width={screenWidth - 45}
                        height={180}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: '6',
                                strokeWidth: '2',
                                stroke: '#e74c3c',
                            },
                        }}
                        bezier
                        style={styles.chart}
                    />
                </View>

                {/* Blood Oxygen */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="water-percent" size={24} color="#3498db" />
                        <Text style={styles.cardTitle}>Blood Oxygen</Text>
                        <Text style={styles.currentValue}>{data.spo2}%</Text>
                    </View>
                    <Text style={styles.cardDescription}>Your SpO2 levels are normal</Text>
                </View>

                {/* Respiratory Rate */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="lungs" size={24} color="#9b59b6" />
                        <Text style={styles.cardTitle}>Respiratory Rate</Text>
                        <Text style={styles.currentValue}>{data.RespiratoryRate}/min</Text>
                    </View>
                    <Text style={styles.cardDescription}>Your breathing rate is within normal range</Text>
                </View>

                {/* Skin Temperature */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="temperature-high" size={24} color="#f39c12" />
                        <Text style={styles.cardTitle}>Skin Temperature</Text>
                        <Text style={styles.currentValue}>{data.SkinTemperature}°C</Text>
                    </View>
                    <Text style={styles.cardDescription}>Your skin temperature is normal</Text>
                </View>

                {/* Blood Pressure */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="gauge" size={24} color="#e67e22" />
                        <Text style={styles.cardTitle}>Blood Pressure</Text>
                        <Text style={styles.currentValue}>{data.systolic}/{data.diastolic}</Text>
                    </View>
                    <Text style={styles.cardDescription}>Your blood pressure is normal</Text>
                </View>

                {/* Activity Calories */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="fire" size={24} color="#e74c3c" />
                        <Text style={styles.cardTitle}>Activity Calories</Text>
                        <Text style={styles.currentValue}>{data.ActivityCalories} kcal</Text>
                    </View>
                    <Text style={styles.cardDescription}>You've burned 65% of your daily goal</Text>
                </View>

                {/* Sleep Tracking */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="moon" size={24} color="#34495e" />
                        <Text style={styles.cardTitle}>Sleep Tracking</Text>
                        <Text style={styles.currentValue}>{data.SleepTracking}</Text>
                    </View>
                    <Text style={styles.cardDescription}>1h 45m deep sleep, 4h 20m light sleep, 1h 10m REM</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}; 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginLeft: 8,
        flex: 1,
    },
    currentValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    cardDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 4,
    },
    chart: {
        marginVertical: 8,
        marginHorizontal: -25,
        borderRadius: 16,
    },
});

export default HomeScreen;
export {PatientVitalData};
