// const endpoint = "ws://0.0.0.0:9876/chat";
// const loginEndpoint = "http://0.0.0.0:9876/login"
const endpoint = "wss://minhhungcar.xyz/chat";
const loginEndpoint = "https://minhhungcar.xyz/login"

const MessageTypeUserJoin = "USER_JOIN"
const MessageTypeAdminJoin = "ADMIN_JOIN"
const MessageTypeTexting = "TEXTING"
const MessageTypeSystemResponseType = "SYSTEM_USER_JOIN_RESPONSE"

let adminAccessToken, customerAccessToken;

async function postData(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

(async function () {
    adminAccessToken = `Bearer ${(await postData(
        loginEndpoint,
        {'phone_number': 'admin', 'password': 'admin'}
    )).data.access_token}`
    customerAccessToken = `Bearer ${(await postData(
        loginEndpoint,
        {'phone_number': '2222222222', 'password': 'admin'}
    )).data.access_token}`
    console.log(`admin access token ${adminAccessToken}`)
    console.log(`customer access token ${customerAccessToken}`)
})()



let socket;
let conversationId;

const [usrOpenChatBtn,
    userSendMsgBtn,
    usrMsg,
    adminJoinChatBtn,
    adminSendMsgBtn,
    adminMsg,
    chatHistory,
] = [
    document.getElementById("btnUserOpenChatSession"),
    document.getElementById("btnUsrSendMsg"),
    document.getElementById("usrMsg"),
    document.getElementById("btnAdminJoinChatSession"),
    document.getElementById("btnAdminSendMsg"),
    document.getElementById("adminMsg"),
    document.getElementById("chatHistory"),
];

usrOpenChatBtn.addEventListener('click', function () {
    socket = new WebSocket(endpoint);
    usrOpenChatBtn.textContent = "User opened chat session";
    socket.addEventListener('open', function () {
        socket.send(JSON.stringify({
            msg_type: MessageTypeUserJoin,
            access_token: customerAccessToken,
        }))
    })

    socket.addEventListener('message', function (event) {
        const msg = JSON.parse(event.data);
        switch (msg.msg_type) {
            case MessageTypeTexting:
                const newChat = document.createElement('div')
                newChat.textContent = msg.content
                chatHistory.appendChild(newChat)
                break;
            case MessageTypeSystemResponseType:
                conversationId = msg.conversation_id;
        }
    })
})

userSendMsgBtn.addEventListener('click', function () {
    socket.send(JSON.stringify({
        msg_type: MessageTypeTexting,
        content: usrMsg.value,
        conversation_id: conversationId,
        access_token: customerAccessToken,
    }));
    usrMsg.value = '';
})

adminJoinChatBtn.addEventListener('click', function () {
    adminJoinChatBtn.textContent = 'Admin joined chat'
    socket.send(JSON.stringify({
        msg_type: MessageTypeAdminJoin,
        access_token: adminAccessToken,
        conversation_id: conversationId
    }));
})

adminSendMsgBtn.addEventListener('click', function () {
    socket.send(JSON.stringify({
        msg_type: MessageTypeTexting,
        content: adminMsg.value,
        conversation_id: conversationId,
        access_token: adminAccessToken,
    }));
    adminMsg.value = '';
})

