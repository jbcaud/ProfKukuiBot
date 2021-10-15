import discord
import os
from dotenv import load_dotenv
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
client.run(TOKEN)