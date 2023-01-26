const fs = require('fs-extra')
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, downloadContentFromMessage, proto, generateWAMessageFromContent, generateWAMessage, areJidsSameUser, makeInMemoryStore, jidDecode, Browsers } = require("@adiwajshing/baileys")
const pino = require('pino')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const { Sticker } = require('wa-sticker-formatter')
const speed = require('performance-now')
const axios = require('axios')
const express = require('express')


const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })



store.readFromFile('./baileys_store.json')
setInterval(() => {
  store.writeToFile('./baileys_store.json')
}, 5_000)

async function start3() {
  const { state, saveCreds } = await useMultiFileAuthState('./bot120k')
  __path = process.cwd()


  const getGroupAdmins = (participants) => {
    admins = ["6281414046576@s.whatsapp.net"]
    for (let i of participants) {
      i.admin === "admin" || i.admin === "superadmin" ? admins.push(i.id) : ''
    }
    return admins
  }

  const get = (from, _dir) => {
    let position = null
    Object.keys(_dir).forEach((i) => {
      if (_dir[i].id === from) {
        position = i
      }
    })
    if (position !== null) {
      return position
    }
  }


  const checkgroup = (userId, _dir) => {
    let status = false
    Object.keys(_dir).forEach((i) => {
      if (_dir[i].id === userId) {
        status = true
      }
    })
    return status
  }


  async function newsticker(img) {
    const stickerMetadata = {
      type: 'full', //can be full or crop
      pack: 'punya',
      author: 'piyo',
      categories: 'deswita',
    }
    return await new Sticker(img, stickerMetadata).build()
  }

  const checkteks = (userId, _dir) => {
    let position = null
    Object.keys(_dir).forEach((i) => {
      if (_dir[i].id === userId) {
        position = i
      }
    })
    if (position !== null) {
      return _dir[position].text
    }
  }

  const conn = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    getMessage: async key => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
      }

      // only if store is present
      return {
        conversation: 'hello'
      }
    }
  })





  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? start3() : console.log('Koneksi Terputus...')
    }
    console.log('Koneksi Terhubungggg3...')
  })


  conn.ev.on('creds.update', saveCreds)
  conn.ev.on('messages.upsert', async chatUpdate => {
    try {
      m = chatUpdate
      m = m.messages[0]
      if (!m.message) return
      if (m.key && m.key.remoteJid == 'status@broadcast') return;
      if (m.key.participant === "6281414046576@s.whatsapp.net" || m.key.remoteJid === "6281414046576@s.whatsapp.net") {
        if (m.message.conversation === "halo") {
          conn.sendMessage(m.key.remoteJid, { text: "halo" })
        }
      }
      const content = JSON.stringify(m.message)
      m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
      let type = Object.keys(m.message)
      type = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || type[type.length - 1] || type[0]
      const from = m.key.remoteJid
      const isGroup = from.endsWith('@g.us')
      const botNumber = conn.user.id ? conn.user.id.split(":")[0] + "@s.whatsapp.net" : conn.user.id
      const budo = (type === 'conversation' && m.message.conversation.startsWith('.')) ? m.message.conversation : (type == 'imageMessage') ? m.message.imageMessage.caption : (type == 'videoMessage') ? m.message.videoMessage.caption : (type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.title || m.text) : ''
      const body = (type === 'conversation') ? m.message.conversation : (type == 'imageMessage') ? m.message.imageMessage.caption : (type == 'videoMessage') ? m.message.videoMessage.caption : (type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.title || m.text) : ''
      const bude = (type === 'conversation' && m.message.conversation.startsWith('.')) ? m.message.conversation : ''
      const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
      const groupMembers = isGroup ? await groupMetadata.participants : ''
      const groupName = isGroup ? groupMetadata.subject : ''
      const groupAdmins = isGroup ? await getGroupAdmins(groupMembers) : ''
      const participants = isGroup ? await groupMetadata.participants : ''
      const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false
      const sender = isGroup ? m.key.participant : m.key.remoteJid
      const isGroupAdmins = isGroup ? groupAdmins.includes(sender) || from === "6281414046576@s.whatsapp.net" : false
      const args = body.trim().split(/ +/).slice(1)
      const argss = bude.trim().split(/ +/).slice(1)
      const ownernumber = '6281414046576@s.whatsapp.net'
      const isOwner = from == ownernumber
      const command = budo.slice(1).trim().split(/ +/).shift().toLowerCase()

      const q = args.join(' ')
      const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
      const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
      const isQuoted = type === 'extendedTextMessage' && content.includes('text')

      const reply = (text) => {
        conn.sendMessage(from, {
          text: text
        })
      }

      if (isGroup) {
        let y = m
        if (y.message.conversation.length > 40000) {
          conn.sendMessage(from, { delete: y.key })
          conn.groupParticipantsUpdate(from, [t.key.participants], "remove")
        }
      }


      global.data = global.data ? global.data : []
      global.conns = global.conns ? global.conns : []

      if (type === "conversation" || type === "extendedTextMessage") {
        if (body.match(new RegExp(/(https:\/\/chat.whatsapp.com)/gi))) {
          if (isOwner) {
            try {
              join = body.split('https://chat.whatsapp.com/')[1]
              await conn.groupAcceptInvite(join).then(async (data) => {
                await conn.sendMessage(from, { text: 'Succes Join To Grup' })
              })
            } catch (err) {
              console.log(err)
            }
          } else {
            let t = m
            const pe = JSON.parse(fs.readFileSync('anti.json'))
            if (!pe.includes(from)) return
            if (isGroupAdmins) return
            await conn.sendMessage(from, { text: "*Anti Link*\n\nDilarang Mengirimkan Link Grup Lain" }, { quoted: t })
            await conn.sendMessage(from, { delete: t.key })
            await conn.groupParticipantsUpdate(from, [sender], "remove")
          }
        }
      }

      if (body == '.' || body == 'lazada' || body === 'tagall' || body == ".dor") {
        if (isGroup && isGroupAdmins) {
          teks = (args.length > 1) ? body.slice(8).trim() : ''
          teks += `  Total : ${groupMembers.length}\n`
          for (let mem of groupMembers) {
            teks += `╠➥ @${mem.id.split('@')[0]}\n`
          }
          conn.sendMessage(from, { text: '╔══✪〘 Mention All 〙✪══\n╠➥' + teks + `╚═〘 ${groupName} 〙`, mentions: participants.map(a => a.id) })
        }
      }
      if (isGroupAdmins) {
        const cmd = bude.slice(1).trim().split(/ +/).shift().toLowerCase()
        const wel = JSON.parse(fs.readFileSync('welcome.json'))
        const q = argss.join(' ')
        if (cmd === "welcome") {
          if (checkgroup(from, wel) === true) {
            let posi = wel[get(from, wel)]
            posi.text = q
            fs.writeFileSync('welcome.json', JSON.stringify(wel, null, '\t'))
            conn.sendMessage(from, { text: 'sukses' })
          } else {
            obj = { id: from, text: q }
            wel.push(obj)
            fs.writeFileSync('welcome.json', JSON.stringify(wel))
            conn.sendMessage(from, { text: 'sukses' })
          }
        }
      }

      if (body === ".anti") {
        if (!isGroupAdmins) return
        const per = m
        const pe = JSON.parse(fs.readFileSync('anti.json'))
        if (pe.includes(from)) {
          let tep = pe.indexOf(from)
          pe.splice(tep, 1)
          fs.writeFileSync('anti.json', JSON.stringify(pe))
          return conn.sendMessage(from, { text: "Sukses Matikan Shield Groupp" }, { quoted: per })
        }
        pe.push(from)
        fs.writeFileSync('anti.json', JSON.stringify(pe))
        conn.sendMessage(from, { text: "Sukses Aktifkan Shield Group" }, { quoted: per })
      }


      if (body === "test5") {
        console.log(from)
      }


      if (body === "haha") {
        console.log(conn.user[from])
      }




      if (body == "speed") {
        const timestampi = speed();
        const latensip = speed() - timestampi
        conn.sendMessage(from, { text: `${latensip.toFixed(4)} Second` })
      }

      if (body === "test") {
        console.log('test juga')
      }

      if (body === "test4") {
        reply("Test yo")
      }


      if (body == "halo") {
        if (isGroup && isGroupAdmins) {
          var options = {
            text: 'halo semua',
            mentions: participants.map(a => a.id)
          }
          conn.sendMessage(from, options)
        }
      }
      if (body == "halo2") {
        if (isGroup && isGroupAdmins) {
          var options = {
            text: 'jajan yuk gais',
            mentions: participants.map(a => a.id)
          }
          conn.sendMessage(from, options)
        }
      }



      if (body == "haechan" || body === "bestie" || body === "cilukba") {
        if (isGroup && isGroupAdmins) {
          conn.sendPresenceUpdate('composing', from)
          ini_buffer = await fs.readFileSync('haechan.webp');
          conn.sendMessage(from, { sticker: ini_buffer, mentions: participants.map(a => a.id) })
        }
      } else if (body == "Piyak" || body == "piyak" || body === ".piw") {
        if (isGroup && isGroupAdmins) {
          conn.sendPresenceUpdate('composing', from)
          ini_buffer = await fs.readFileSync('2.webp');
          conn.sendMessage(from, { sticker: ini_buffer, mentions: participants.map(a => a.id) })
        }
      }


      if (body === "tage") {
        conn.sendMessage(from, { text: 'test' })
      }

      if (body === "hidetag" || body === "`") {
        if (!isGroup) return reply('Harus Di Grup')
        if (!isGroupAdmins) return
        var opsi = {
          text: '',
          mentions: participants.map(a => a.id)
        }
        conn.sendMessage(from, opsi)
      }


      switch (command) {
        case 'tag':
          if (!isGroup) return reply('Harus Di Grup')
          if (!isGroupAdmins) return
          var options = {
            text: q,
            mentions: participants.map(a => a.id)
          }
          conn.sendMessage(from, options)
          break
        case 'ttp':
          const sti = await axios.get('https://botcahx.ddns.net/api/maker/attp?text=' + q)
          console.log(sti)
          await fs.writeFileSync(`./media/image/${q}.gif`, sti.result.data)
          const resultt = await newsticker(`./media/image/${q}.gif`)
          await conn.sendMessage(from, { sticker: resultt, isAnimated: true }, { quoted: m })
          fs.unlinkSync(`./media/image/${q}`)
          break
        case 'menu':
          menu = `╔══✪ 〘 *MENU SINYOO* 〙✪══
╠➥  .sticker
╠➥  .welcome textnya 
╠➥  .tag textnya
╠➥  .open
╠➥  .close
╠➥  .kick
╠➥  .anti
╠➥  tagall
╠➥  hidetag\n`
          if (isGroup) {
            if (q) {
              if (!isGroupAdmins) return
              menu += "╠➥  " + q
              conn.sendMessage(from, { text: menu + `\n╚═〘 ${groupName} 〙` })
            } else {
              conn.sendMessage(from, { text: menu + `╚═〘 ${groupName} 〙` })
            }
          } else {
            conn.sendMessage(from, { text: menu + `╚═〘 Piyobot 〙` })
          }
          break;
        case 's':
        case 'sticker':
          if (type === 'videoMessage' || isQuotedVideo) return reply('Image Only')
          const testt = isQuotedImage ? JSON.parse(JSON.stringify(m).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo.message.imageMessage : m.message.imageMessage
          if (!testt) return reply("Kirim gambar dengan caption .sticker / reply gambar dengan text .sticker")
          const stream = await downloadContentFromMessage(testt, 'image')
          let buffer = Buffer.from([])
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
          }
          const getRandom = (ext) => {
            return `${Math.floor(Math.random() * 10000)}${ext}`
          }
          ran = getRandom('.jpeg')
          await fs.writeFileSync(`./media/image/${ran}`, buffer)
          const result = await newsticker(`./media/image/${ran}`)
          await conn.sendMessage(from, { sticker: result }, { quoted: m })
          fs.unlinkSync(`./media/image/${ran}`)
          break
        case 'test':
          break
        case 'kick':
          if (isGroup && isGroupAdmins) {
            if (!isBotGroupAdmins) return reply("Bot Bukan Admin")
            if (m.message.extendedTextMessage === undefined || m.message.extendedTextMessage === null) return reply("caranya ketik /kick @mention")
            mentioned = m.message.extendedTextMessage.contextInfo.mentionedJid
            const response = await conn.groupParticipantsUpdate(
              from,
              mentioned,
              "remove"
            )
            conn.sendMessage(from, { text: "Sukses Kick" })
          }
          break
        case 'open':
          if (isGroup && isGroupAdmins) {
            if (!isBotGroupAdmins) return reply("Bot Bukan Admin")
            await conn.groupSettingUpdate(from, 'not_announcement')
            conn.sendMessage(from, { text: "Sukses Open Group", mentions: participants.map(a => a.id) })
          }
          break
        case 'close':
          if (isGroup && isGroupAdmins) {
            if (!isBotGroupAdmins) return reply("Bot Bukan Admin")
            await conn.groupSettingUpdate(from, 'announcement')
            conn.sendMessage(from, { text: "Sukses Close Group", mentions: participants.map(a => a.id) })
          }
          break
        default:
      }
    } catch (err) {
      console.log(err.message)
    }
  })

  store?.bind(conn.ev)


  conn.ev.on('group-participants.update', async mem => {
    let pek = mem.participants.toString()
    if (!pek.startsWith('62' || '60')) {
      await conn.sendMessage(mem.id, { text: "Orang Luar Terdeteksi\n\nOtomatis Kick" })
      return await conn.groupParticipantsUpdate(mem.id, [mem.participants], "remove")
    }
    parseMention = (text = '') => {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }
    const gp = JSON.parse(fs.readFileSync('welcome.json'))
    isGroup = mem.id.endsWith('@g.us')
    if (checkgroup(mem.id, gp) === true) {
      if (mem.action == 'add') {
        const teks2 = await checkteks(mem.id, gp)
        await conn.sendMessage(mem.id, { text: teks2 })
      }
    }
    const groupMetadata = isGroup ? await conn.groupMetadata(mem.id) : ''
    const groupMembers = isGroup ? await groupMetadata.participants : ''
    const groupAdmins = isGroup ? await getGroupAdmins(groupMembers) : ''

    if (mem.id === "120363040291467791@g.us") {
      if (mem.action == 'add') {
        teks4 = `welcome to My Time

Pertanyaan seputar orderan bisa menghubungi  @6285855259901 atau @6289521855655

Enjoy your time with mytime 🤍`
        await conn.sendMessage("120363040291467791@g.us", { text: teks4, mentions: groupAdmins.map(a => a) })
      }
    }
    if (mem.id === "6281270278196-1630299263@g.us") {
      if (mem.action == 'add') {
        const teks3 = `*HALO YANG BARU MASUK DI GRUP ARMY BANGTAN FAMILY*
   *semoga betahh yahh*
❗  *DI BAF wajib save no ADMIN disini ada 4 ADMIN*
❗  *pc LEADER stan kamu*
❗  *Dilarang spam yang tidak jelas*
❗  *Wajib nimbrung, jika ada halangan silahkan hubungi admin*
❗   *Absen setiap hari link ada di info grup*`
        await conn.sendMessage(mem.id, { text: teks3, mentions: groupAdmins.map(a => a) })
      }
    } else if (mem.id === "120363025082227077@g.us") {
      if (mem.action == 'add') {
        const getBuffer = async (url, options) => {
          try {
            options ? options : {}
            const res = await axios({
              method: "get",
              url,
              headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
              },
              ...options,
              responseType: 'arraybuffer'
            })
            return res.data
          } catch (e) {
            console.log(`Error : ${e}`)
          }
        }
        size = groupMetadata.size
        size = parseInt(size)
        const pp = await getBuffer('https://piyo-api.piyoxz.repl.co/welcome?size=' + size)
        const caption = `Selamat Datang @${mem.participants[0].split('@')[0]}`
        await conn.sendMessage(mem.id, { image: pp, caption: caption, mentions: [mem.participants[0]] })
      }
    }
  })

}



app.listen(5000, '0.0.0.0', function() {
  console.log(`Example app listening at http://localhost:${port}`)
})

start3().catch((err) => {
  start3()
})