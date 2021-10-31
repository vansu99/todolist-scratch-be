const cron = require('node-cron');
const moment = require('moment')
const Card = require('../models/Card')
const socketHandler = require("../socketServer");
const Notification = require('../models/Notification')

let testJob;
async function cronJob() {
  const cards = await Card.find()
  for(let card of cards) {
    if(card.date === null) {
      console.log('null')
    } else {
      const date = moment(card.date, 'YYYY/MM/DD')
      const day = date.format('D')
      const month = date.format('M')
      const hour = date.get('hours')
      const minute = date.get('minutes')
      testJob = cron.schedule(`${minute} ${hour} ${day} ${month} *`, async () => {
        const notification = new Notification({
          sender: '617e91c0a920b710675a05c2',
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
            _id: 'system001',
            username: 'System',
            avatar: 'shorturl.at/zDMNS'
          },
          receiver: card.userId,
        });
      },{
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
      })
      testJob.start();
    }
  }

}

module.exports = cronJob