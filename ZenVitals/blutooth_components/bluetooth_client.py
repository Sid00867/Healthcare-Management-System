import socket

client = socket.socket(socket.AF_BLUETOOTH,socket.SOCK_STREAM,socket.BTPROTO_RFCOMM)
client.connect(("", 4))

normalData = {
    "HeartRate": [68, 72, 78, 74, 75, 70],  # Normal resting HR
    "bpm": 73,
    "spo2": 98,  # Normal SpO2 (95-100%)
    "systolic": 120,
    "diastolic": 80,
    "RespiratoryRate": 16,  # Normal (12-20 breaths/min)
    "SkinTemperature": 36.5,  # Normal body temperature
    "ActivityCalories": 450,  # Moderate activity
    "SleepTracking": "7h 30m"  # Healthy sleep duration
}

elevatedData = {
    "HeartRate": [85, 88, 92, 90, 89, 87],  # Elevated HR due to stress or exertion
    "BloodOxygen": 95,  # Slightly lower but normal SpO2
    "RespiratoryRate": 20,  # Higher breathing rate
    "SkinTemperature": 37.2,  # Slight fever or exertion
    "BloodPressure": "135/85",  # Pre-hypertension
    "ActivityCalories": 600,  # High activity
    "SleepTracking": "5h 45m"  # Lack of sleep    
}

criticalData = {
    "HeartRate": [110, 115, 120, 118, 122, 125],  # High HR (tachycardia)
    "BloodOxygen": 89,  # Hypoxia (below 90% is dangerous)
    "RespiratoryRate": 28,  # Rapid breathing
    "SkinTemperature": 39.0,  # High fever
    "BloodPressure": "160/100",  # Hypertension (Stage 2)
    "ActivityCalories": 200,  # Low due to illness or exhaustion
    "SleepTracking": "3h 20m"  # Severe sleep deprivation
}

try:
    while True:
        healthCondition = int(input("Health conditions:\n1 - Normal Health Condition\n2 - Elevated Health Condition\n3 - Critical health Condition\nEnter Health condition to send data: "))
        if healthCondition == 1:
            data = str(normalData)
        elif healthCondition == 2:
            data = str(elevatedData)
        elif healthCondition == 3:
            data = str(criticalData)
        else:
            break
        client.send(data.encode("utf-8"))
        print("Data Sent Successfully")
        response = client.recv(1024)
        print("Server response:", response.decode("utf-8"))
except OSError as e:
    pass

client.close()