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

// BOTÃO PAGAMENTO
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
      ],
      metadata: {
        user_id: userId
      }
    });

    bot.sendMessage(userId, `💰 Pague aqui:\n${preference.body.init_point}`);
  }
});

// WEBHOOK (SÓ AQUI LIBERA ACESSO)
app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;

    if (data.type === "payment") {
      const payment = await mercadopago.payment.findById(data.data.id);

      if (payment.body.status === "approved") {
        const userId = payment.body.metadata.user_id;

        await bot.sendMessage(
          userId,
          `✅ Pagamento confirmado!\nAcesse o VIP:\n${LINK_VIP}`
        );
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.log("Erro webhook:", error);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => {
  res.send("Bot rodando");
});

app.listen(3000, () => console.log("Servidor rodando"));
