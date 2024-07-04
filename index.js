// const endpoint = "ws://0.0.0.0:9876/chat";
// const loginEndpoint = "http://0.0.0.0:9876/login"
const endpoint = "wss://minhhungcar.xyz/chat";
const loginEndpoint = "https://minhhungcar.xyz/login"

const MessageTypes = {
    USER_JOIN: "USER_JOIN",
    ADMIN_JOIN: "ADMIN_JOIN",
    TEXTING: "TEXTING",
    SYSTEM_USER_JOIN_RESPONSE: "SYSTEM_USER_JOIN_RESPONSE",
    ERROR: "ERROR",
};

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
        {'phone_number': '0389068116', 'password': '2222'}
    )).data.access_token}`
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
            msg_type: MessageTypes.USER_JOIN,
            access_token: customerAccessToken,
        }))
    })

    socket.addEventListener('message', function (event) {
        const msg = JSON.parse(event.data);
        switch (msg.msg_type) {
            case MessageTypes.TEXTING:
                const newChat = document.createElement('div')
                newChat.textContent = msg.content
                chatHistory.appendChild(newChat)
                break;
            case MessageTypes.SYSTEM_USER_JOIN_RESPONSE:
                conversationId = msg.conversation_id;
                break;
            case MessageTypes.ERROR:
                alert(msg.content);
                break;
        }
    })
})

userSendMsgBtn.addEventListener('click', function () {
    socket.send(JSON.stringify({
        msg_type: MessageTypes.TEXTING,
        content: usrMsg.value,
        conversation_id: conversationId,
        access_token: customerAccessToken,
    }));
    usrMsg.value = '';
})

adminJoinChatBtn.addEventListener('click', function () {
    adminJoinChatBtn.textContent = 'Admin joined chat'
    socket.send(JSON.stringify({
        msg_type: MessageTypes.ADMIN_JOIN,
        access_token: adminAccessToken,
        conversation_id: conversationId
    }));
})

adminSendMsgBtn.addEventListener('click', function () {
    socket.send(JSON.stringify({
        msg_type: MessageTypes.TEXTING,
        content: adminMsg.value,
        conversation_id: conversationId,
        access_token: adminAccessToken,
    }));
    adminMsg.value = '';
})

