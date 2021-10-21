import discord
import os
from dotenv import load_dotenv
import socket
import threading
import time

client = discord.Client()
load_dotenv()
TOKEN = os.getenv('disctoken')



@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('!pokemon'):
        await message.channel.send('Hello!')



def server_setup(arg, kill):
    HOST = '127.0.0.1'
    PORT = 12345

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((HOST, PORT))
    s.listen()

    while True:
        conn, addr = s.accept()
        print(conn, addr)
        while not kill.is_set():
            data = conn.recv(1024)
            print(data)
        break

def client_start():
    client.run(TOKEN)

kill = threading.Event()
t1 = threading.Thread(target = server_setup, args = (1, kill))
t2 = threading.Thread(target = client_start)


t1.start()
time.sleep(.5)
t2.start()

try:
    while(1):
        time.sleep(.5)
except(KeyboardInterrupt):
    kill.set()
t1.join()
t2.join()




