const cron = require('node-cron');
const moment = require('moment')
const Card = require('../models/Card')
const socketHandler = require("../socketServer");
const Notification = require('../models/Notification')

let testJob;
async function cronJob() {
  const cards = await Card.find()
  for(let card of cards.sort((a,b) => a.date > b.date ? 1 : a.date < b.date ? -1 : 0)) {
    if(card.date === null) {
      console.log('null')
    } else if(card.date !== null && !card.completed) {
      const date = moment(card.date).format('DD/MM/YYYY');
      const today = moment().format('DD/MM/YYYY');
      testJob = cron.schedule(`30 23 * * 0-6`, async () => {
        // chay moi ngay vao luc 23h30p de check neu ngay hien tai = voi ngay due date => thong bao
        if(today === date) {
          console.log('run cron day')
          const notification = new Notification({
            sender: '6051cf7fae8b0629c4a32ccd',
            receiver: card.userId,
            notificationType: "remind",
            date: Date.now(),
            notificationData: {
              cardId: card._id,
            },
          });

          await notification.save();
          socketHandler.sendNotification(req, {
            ...notification.toObject(),
            sender: {
              _id: card.userId,
              username: 'System',
              avatar: 'https://media.wired.com/photos/5b6df22751297c21002b4536/1:1/w_1272,h_1272,c_limit/HackerBot.jpg'
            },
            receiver: card.userId,
          });
        }
      },{
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
      })
      testJob.start();
    }
  }

}

module.exports = cronJob