const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const mercadopago = require('mercadopago');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

const app = express();
app.use(express.json());

const LINK_VIP = "https://t.me/+noqJJklGN1g5YmZh";

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🔥 Bem-vindo! Assine para acessar o VIP.", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💰 Assinar VIP", callback_data: "assinar" }]
      ]
    }
  });
});

// PAGAMENTO
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

    // 🔥 ENTREGA AUTOMÁTICA (versão simples)
    setTimeout(() => {
      bot.sendMessage(userId, `✅ Pagamento aprovado! Acesse o VIP:\n${LINK_VIP}`);
    }, 10000); // 10 segundos depois
  }
});

app.listen(3000, () => console.log("Rodando"));
