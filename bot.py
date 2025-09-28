from flask import Flask, request
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler

TOKEN = "8409487929:AAGmw8q3IzA9IEs3HDXBU214RXDJ-WNxTZE"
WEBHOOK_URL = "https://solar-0hxn.onrender.com"  # your Render URL

app = Flask(__name__)
application = Application.builder().token(TOKEN).build()

async def start(update: Update, context):
    keyboard = [[
        InlineKeyboardButton("Open Solar Mini ☀️", web_app={"url": "https://not88g.github.io/solar-mini"})
    ]]
    await update.message.reply_text(
        "Welcome to Solar Mini!\nTap below to open the app 👇",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

application.add_handler(CommandHandler("start", start))

# Flask route for Telegram updates
@app.route("/", methods=["POST"])
def webhook():
    update = Update.de_json(request.get_json(force=True), application.bot)
    application.update_queue.put_nowait(update)
    return "OK"

@app.route("/", methods=["GET"])
def home():
    return "☀️ Solar Mini Bot running (webhook mode)"

if __name__ == "__main__":
    # Set webhook on startup
    application.bot.set_webhook(url=WEBHOOK_URL)
    print("✅ Webhook set for:", WEBHOOK_URL)
    app.run(host="0.0.0.0", port=10000)
