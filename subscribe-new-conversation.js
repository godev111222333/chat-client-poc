// const notiEndpoint = "ws://0.0.0.0:9876/admin/subscribe_conversation";
// const loginEndpoint = "http://0.0.0.0:9876/login"
const notiEndpoint = "wss://minhhungcar.xyz/admin/subscribe_conversation";
const loginEndpoint = "https://minhhungcar.xyz/login"

let adminAccessToken;
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
})()

let socket = new WebSocket(notiEndpoint)
const [new_conver_history,
    openSocketBtn] = [
        document.getElementById('new_conversation_history'),
        document.getElementById('openSocketBtn')
    ]

openSocketBtn.addEventListener('click', function () {
    socket.send(JSON.stringify({access_token: adminAccessToken}))
    openSocketBtn.textContent = 'socket opened'
})


socket.addEventListener('message', function (event) {
    const newConversation = JSON.parse(event.data)
    const newConv = document.createElement('div')
    newConv.textContent = JSON.stringify(newConversation)
    new_conver_history.appendChild(newConv)
})
