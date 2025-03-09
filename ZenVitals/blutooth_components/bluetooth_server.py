import ast
import json
import socket

# Blutooth Server
server = socket.socket(socket.AF_BLUETOOTH,socket.SOCK_STREAM,socket.BTPROTO_RFCOMM)
server.bind(("", 4))
server.listen(1)

client,addr = server.accept()

try:
    while True:
        data = client.recv(1024)
        if not data:
            break
        data = data.decode('utf-8')
        data = ast.literal_eval(data)
        print(f'Data: {data}')
        client.send("Data received successfully".encode("utf-8"))

        json_object = json.dumps(data, indent=4)
        with open("D:/kevin files/kevin home/Projects/RPM - Vitals Collection - Health Care Platform Application/ZenVitals/blutooth_components/data.json", "w") as file:
            file.write(json_object) 

except OSError as e:
    pass

client.close()
server.close()