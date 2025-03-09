import json
import time
import threading
from twilio.rest import Client
from flask import Flask,jsonify,request

# Flask API
app = Flask(__name__)

def update_data():
    # Function to update data every 5 seconds.
    global data
    while True:
        with open("data.json", "r") as file:
            data = json.load(file)
        time.sleep(5)

# Start background thread
threading.Thread(target=update_data, daemon=True).start()

@app.route('/patientVitals',methods=['GET'])
def get_user_credentials():
    response = jsonify(data)
    response.headers.add('Access-Control-Allow-Origin','*')
    return response

# Twilio credentials
ACCOUNT_SID = ""
AUTH_TOKEN = ""
TWILIO_NUMBER = ""

client = Client(ACCOUNT_SID, AUTH_TOKEN)

@app.route("/makeDoctorCall", methods=["POST"])
def makeDoctorCall():
    data = request.json
    recipient_number = data.get("to")

    if not recipient_number:
        return jsonify({"error": "Phone number is required"}), 400

    call = client.calls.create(
        to=recipient_number,
        from_=TWILIO_NUMBER,
        twiml="<Response><Dial>+DoctorNumber</Dial></Response>"
    )

    return jsonify({"message": "Call initiated", "call_sid": call.sid})

@app.route("/makeFriendCall", methods=["POST"])
def makeFriendCall():
    data = request.json
    recipient_number = data.get("to")

    if not recipient_number:
        return jsonify({"error": "Phone number is required"}), 400

    call = client.calls.create(
        to=recipient_number,
        from_=TWILIO_NUMBER,
        twiml="<Response><Dial>+FrientNumber</Dial></Response>"
    )

    return jsonify({"message": "Call initiated", "call_sid": call.sid})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
