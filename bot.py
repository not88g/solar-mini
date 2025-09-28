from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from flask import Flask
import threading

# --- Fake web server for Render ---
app = Flask(__name__)

@app.route('/')
def home():
    return "☀️ Solar Mini Bot is running"

def run_flask():
    app.run(host='0.0.0.0', port=10000)

# --- Telegram Bot ---
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[
        InlineKeyboardButton("Open Solar Mini 🚀", web_app={"url": "https://https://not88g.github.io/solar-mini/"})
    ]]
    await update.message.reply_text(
        "Welcome to Solar Mini!\nTap below to open the app 👇",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

app_bot = ApplicationBuilder().token("8409487929:AAGmw8q3IzA9IEs3HDXBU214RXDJ-WNxTZE").build()
app_bot.add_handler(CommandHandler("start", start))

# --- Run both Flask + Bot ---
threading.Thread(target=run_flask).start()
app_bot.run_polling()
