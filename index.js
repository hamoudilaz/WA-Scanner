import { makeWASocket, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys'

const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: Browsers.macOS('Google Chrome'),
        syncFullHistory: false,

    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (connection === 'open') {
            console.log('✅ Connected to WhatsApp')
        }

        if (connection === 'close') {
            console.log('❌ Disconnected')
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401
            if (shouldReconnect) startBot()
        }
    })
    sock.ev.on('messages.upsert', async ({ type, messages }) => {
        if (!['notify', 'append', 'replace'].includes(type)) return

        for (const msg of messages) {
            if (!msg.message) continue

            const sender = msg.key.remoteJid
            const type = Object.keys(msg.message)[0]
            const fromMe = msg.key.fromMe
            const author = msg.key.participant || msg.key.remoteJid


            // Unwrap ephemeral or view-once
            const content =
                msg.message?.ephemeralMessage?.message ||
                msg.message?.viewOnceMessage?.message ||
                msg.message

            const innerType = Object.keys(content)[0]
            let text = ''

            if (innerType === 'conversation') text = content.conversation
            else if (innerType === 'extendedTextMessage') text = content.extendedTextMessage.text

            if (text && !fromMe) {
                await sock.sendMessage(sender, { text: '🟢 Bot received your message.' })
            }

            console.log(`📥 From ${sender}: ${text || '[no text]'}`)
        }
    })

}

startBot()
