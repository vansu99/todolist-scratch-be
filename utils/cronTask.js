const cron = require('node-cron');
const moment = require('moment')
const Card = require('../models/Card')
const socketHandler = require("../socketServer");
const Notification = require('../models/Notification')
const nodeMailer = require('nodemailer')

let testJob;
const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PWD
  }
})
async function cronJob() {
  const cards = await Card.find().populate('userId')
  for(let card of cards.sort((a,b) => a.date > b.date ? 1 : a.date < b.date ? -1 : 0)) {
    if(card.date === null) {
      console.log('null')
    } else if(card.date !== null && !card.completed) {
      const date = moment(card.date).format('DD/MM/YYYY');
      const today = moment().format('DD/MM/YYYY');
      const mailOptions = {
        from: 'tt8532006@gmail.com',
        to: 'vansutran99@gmail.com',
        subject: 'NHẮC VIỆC',
        html: `
          <p>Dear ${card.userId.username},</p>
          <p><b>Lưu ý:</b> Bạn có một công việc sắp phải hoàn thành là <b>${card.title}</b></p>
        `
      };
      testJob = cron.schedule(`0 0 * * 0-6`, async () => {
        // chay moi ngay vao luc 00h00 de check neu ngay hien tai = voi ngay due date => thong bao
        if(today === date) {
          console.log('run cron day')
          transporter.sendMail(mailOptions, (err, info) => {
            if(err) {
              console.log(err)
            }else {
              console.log('send success')
            }
          })
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