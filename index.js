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
  bot.sendMessage(msg.chat.id, "🔥 Bem-vindo! Escolha seu plano:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💸 Mensal R$9,90", callback_data: "mensal" }],
        [{ text: "🔥 Vitalício R$29,90", callback_data: "vitalicio" }]
      ]
    }
  });
});

// BOTÕES
bot.on('callback_query', async (query) => {
  const userId = query.from.id;

  if (query.data === 'mensal') {
    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: "VIP Telegram Mensal",
          quantity: 1,
          unit_price: 9.9
        }
      ],
      payment_methods: {
        excluded_payment_types: [],
        installments: 1
      },
      metadata: {
        user_id: userId,
        plano: "mensal"
      }
    });

    bot.sendMessage(userId, `💰 Assine mensal:\n${preference.body.init_point}`);
  }

  if (query.data === 'vitalicio') {
    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: "VIP Telegram Vitalício",
          quantity: 1,
          unit_price: 29.9
        }
      ],
      payment_methods: {
        excluded_payment_types: [],
        installments: 1
      },
      metadata: {
        user_id: userId,
        plano: "vitalicio"
      }
    });

    bot.sendMessage(userId, `🔥 Acesso vitalício:\n${preference.body.init_point}`);
  }
});

// WEBHOOK
app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;

    if (data.type === "payment") {
      const payment = await mercadopago.payment.findById(data.data.id);

      if (payment.body.status === "approved") {
        const userId = payment.body.metadata.user_id;
        const plano = payment.body.metadata.plano;

        if (plano === "mensal") {
          await bot.sendMessage(
            userId,
            `✅ Assinatura mensal ativa!\nAcesse o VIP:\n${LINK_VIP}`
          );
        }

        if (plano === "vitalicio") {
          await bot.sendMessage(
            userId,
            `🔥 Acesso vitalício liberado!\nBônus incluso!\nAcesse:\n${LINK_VIP}`
          );
        }
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
