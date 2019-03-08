const subInformation = require('./sub-information'),
  db = require('./db'),
  TelegramBot = require('node-telegram-bot-api'),
  crypto = require('crypto');

db.client.connect(() => {
  db.client.query('SELECT * FROM auth_users').then(response => {
    const nowDate = Date.now();
    let removableIds = [];
    response.rows.forEach(value => {
      value.lifetime < nowDate && removableIds.push(value.id);
    });
    if (removableIds.length > 0) {
      removableIds = removableIds.join(', ');
      db.client.query(`DELETE FROM auth_users WHERE auth_users.id IN(${removableIds})`);
    }
  });
});

const bot = new TelegramBot(subInformation.token, {
  polling: true,
  request: {
    // proxy: 'http://191.252.185.161:8090/',
    proxy: 'http://51.38.71.101:8080/',
    // proxy: 'http://177.72.115.65:31164/',
  },
});

// Matches "/echo [whatever]"
bot.onText(/\/signin (.+) (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id,
    userId = msg.from.id,
    login = match[1],
    password = crypto
      .createHash('md5')
      .update(match[2])
      .digest('hex');

  db.client
    .query('SELECT * FROM users')
    .then(response => {
      const isAuth = response.rows.find(value =>
        value['name'] === login && value['hash_password'] === password ? true : false
      );
      return new Promise((resolve, reject) => {
        isAuth ? resolve(true) : reject(new Error('Аутентификация не пройдена'));
      });
    })
    .then(isAuth => {
      return db.client
        .query('SELECT * FROM auth_users')
        .then(response => {
          const userAlreadyAuth = response.rows.find(value => value['user_id'] === userId);
          return new Promise((resolve, reject) => {
            userAlreadyAuth
              ? reject(new Error('Вы уже аутентифицированы'))
              : resolve(userAlreadyAuth);
          });
        })
        .then(response => {
          const lifitime = Date.now() + subInformation.lifetime;
          return db.client.query(`INSERT INTO auth_users VALUES(DEFAULT, ${userId}, ${lifitime})`);
        });
      // .catch(error => {
      //   bot.sendMessage(chatId, error.message);
      // });
    })
    .then(response => {
      bot.sendMessage(chatId, 'Вы успешно аутентифицированы');
    })
    .catch(error => {
      bot.sendMessage(chatId, error.message);
      console.log(error);
    });
});

bot.onText(/\/request (.+)/, (msg, match) => {
  const userId = msg.chat.id;
  db.client
    .query('SELECT * FROM auth_users')
    .then(response => {
      const user = response.rows.find(value => (value['user_id'] === msg.from.id ? true : false));
      if (user) {
        db.client.query(`${match[1]}`).then(response => {
          response.rows !== undefined &&
            response.rows !== null &&
            bot.sendMessage(userId, JSON.stringify(response.rows));
        });
      } else {
        bot.sendMessage(userId, 'Вы не прошли аутентификацию для использования данной команды');
      }
    })
    .catch(error => {
      bot.sendMessage(userId, 'Неверно составлен запрос или данные отсутствуют');
      console.log(error);
    });
});

bot.onText(/^[^\/](.*?)/, (msg, match) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `Привет, ${msg.from.first_name}.
     Вот список доступных команд для бота:
     /signin login password - аутентификация пользователя;
     /info - информация настройки окружения для использования бота;
      Доступна только после аутентификации:
      /request sql_request - получение данных из БД;`
  );
});

bot.onText(/^\/info$/, (msg, match) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `Данный бот предоставляет информацию из базы данных по SQL запросу от пользователя.
    Прежде чем использовать возможности бота необходимо пройти аутентификацию,
    логин и пароль для которой можно найти по адресу https://github.com/vovaoecoyc/sql-request-telegram-bot`
  );
});

/*bot.on('message', msg => {
  const chatId = msg.chat.id;
  // console.log(moment.now());

  bot.sendMessage(
    chatId,
    `Привет, ${msg.from.first_name}.
     Вот список доступных команд для бота:
     /signin login password - аутентификация пользователя
      Доступны только после аутентификации:
      /request sql_request - получение данных из БД;`
  );
});*/
