const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });

const app = express();
app.use(express.json());

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 Bem-vindo! Clique abaixo para assinar.", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Assinar VIP", callback_data: "assinar" }]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  bot.sendMessage(query.from.id, "💰 Link de pagamento aqui (vamos integrar depois)");
});

app.get('/', (req, res) => {
  res.send("Bot rodando 🚀");
});

app.listen(3000, () => console.log("Rodando"));
