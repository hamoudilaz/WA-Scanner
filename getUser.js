import { makeWASocket, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys'

const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: Browsers.macOS('Google Chrome')
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open') {
            console.log('✅ Connected')

            const targets = [
                // '46739488478@s.whatsapp.net',
            ]

            const count = 100

            for (const jid of targets) {
                for (let i = 0; i < count; i++) {
                    await sock.sendMessage(jid, {
                        text: `Test message from hamoudi, ignore.`
                    })
                }
            }
        }
    })
}

startBot()
