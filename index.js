const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const mercadopago = require('mercadopago');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

const app = express();
app.use(express.json());

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 Bem-vindo! Assine para acessar o VIP.", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💰 Assinar VIP", callback_data: "assinar" }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const userId = query.from.id;

  if (query.data === 'assinar') {
    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: "VIP Telegram",
          quantity: 1,
          unit_price: 29
        }
      ]
    });

    bot.sendMessage(userId, `💰 Pague aqui:\n${preference.body.init_point}`);
  }
});

app.listen(3000, () => console.log("Rodando"));
