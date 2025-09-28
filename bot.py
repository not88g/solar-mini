from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[
        InlineKeyboardButton("Open Solar Mini ☀️", web_app={"url": "https://https://not88g.github.io/solar-mini/"})
    ]]
    await update.message.reply_text("Welcome to Solar Mini!", reply_markup=InlineKeyboardMarkup(keyboard))

app = ApplicationBuilder().token("8409487929:AAGmw8q3IzA9IEs3HDXBU214RXDJ-WNxTZE").build()
app.add_handler(CommandHandler("start", start))
app.run_polling()
