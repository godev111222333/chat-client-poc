// const endpoint = "ws://0.0.0.0:9876/chat";
const endpoint = "wss://minhhungcar.xyz/chat";

const MessageTypeUserJoin = "USER_JOIN"
const MessageTypeAdminJoin = "ADMIN_JOIN"
const MessageTypeTexting = "TEXTING"
const MessageTypeSystemResponseType = "SYSTEM_USER_JOIN_RESPONSE"

const AuthorizeAccessToken = "1"

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
            access_token: AuthorizeAccessToken,
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
    }));
    usrMsg.value = '';
})

adminJoinChatBtn.addEventListener('click', function () {
    adminJoinChatBtn.textContent = 'Admin joined chat'
    socket.send(JSON.stringify({
        msg_type: MessageTypeAdminJoin,
    }));
})

adminSendMsgBtn.addEventListener('click', function () {
    socket.send(JSON.stringify({
        msg_type: MessageTypeTexting,
        content: adminMsg.value,
        conversation_id: conversationId,
    }));
    adminMsg.value = '';
})

