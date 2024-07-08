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

let [userSocket, adminSocket] = [new WebSocket(endpoint), new WebSocket(endpoint)];
let conversationId = 82;

async function postData(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
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


const [usrOpenChatBtn,
    userSendMsgBtn,
    usrMsg,
    adminJoinChatBtn,
    adminSendMsgBtn,
    adminMsg,
    userChatHistory,
    adminChatHistory
] = [
    document.getElementById("btnUserOpenChatSession"),
    document.getElementById("btnUsrSendMsg"),
    document.getElementById("usrMsg"),
    document.getElementById("btnAdminJoinChatSession"),
    document.getElementById("btnAdminSendMsg"),
    document.getElementById("adminMsg"),
    document.getElementById("userChatHistory"),
    document.getElementById("adminChatHistory"),
];

function handleUserMsgFunc(event) {
    const msg = JSON.parse(event.data);
    switch (msg.msg_type) {
        case MessageTypes.TEXTING:
            const newChat = document.createElement('div')
            newChat.textContent = msg.content
            userChatHistory.appendChild(newChat)
            break;
        case MessageTypes.SYSTEM_USER_JOIN_RESPONSE:
            // conversationId = msg.conversation_id;
            break;
        case MessageTypes.ERROR:
            alert(msg.content);
            break;
    }
}

function handleAdminMsgFunc(event) {
    const msg = JSON.parse(event.data);
    switch (msg.msg_type) {
        case MessageTypes.TEXTING:
            const newChat = document.createElement('div')
            newChat.textContent = msg.content
            adminChatHistory.appendChild(newChat)
            break;
        case MessageTypes.SYSTEM_USER_JOIN_RESPONSE:
            break;
        case MessageTypes.ERROR:
            alert(msg.content);
            break;
    }
}

userSocket.addEventListener('message', handleUserMsgFunc)
adminSocket.addEventListener('message', handleAdminMsgFunc)

usrOpenChatBtn.addEventListener('click', function () {
    usrOpenChatBtn.textContent = "User opened chat session";
    userSocket.send(JSON.stringify({
        msg_type: MessageTypes.USER_JOIN,
        access_token: customerAccessToken,
    }))
})

userSendMsgBtn.addEventListener('click', function () {
    userSocket.send(JSON.stringify({
        msg_type: MessageTypes.TEXTING,
        content: usrMsg.value,
        conversation_id: conversationId,
        access_token: customerAccessToken,
    }));
    usrMsg.value = '';
})

adminJoinChatBtn.addEventListener('click', function () {
    adminJoinChatBtn.textContent = 'Admin joined chat'
    try {
        adminSocket.send(JSON.stringify({
            msg_type: MessageTypes.ADMIN_JOIN,
            access_token: adminAccessToken,
            conversation_id: conversationId
        }));
    } catch (error) {
        console.log(error)
    }
})

adminSendMsgBtn.addEventListener('click', function () {
    adminSocket.send(JSON.stringify({
        msg_type: MessageTypes.TEXTING,
        content: adminMsg.value,
        conversation_id: conversationId,
        access_token: adminAccessToken,
    }));
    adminMsg.value = '';
})

