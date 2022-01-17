#built in Python 3.10
import discord
import os
from dotenv import load_dotenv
import socket
import time
import multiprocessing as mp

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

event = mp.Event()
t1 = mp.Process(target = server_setup, args = (1, event))
t2 = mp.Process(target = client_start)

if __name__ == '__main__':
    t1.start()
    t2.start()

    try:
        while(1):
            time.sleep(.5)
    except(KeyboardInterrupt):
        event.set()
    t1.terminate()
    t2.terminate()




