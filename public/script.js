const serverURL = "http://127.0.0.1:4000/"

const formSend = document.querySelector(".formSend")
const loading = document.querySelector(".loading")
const message = document.getElementById("message")
const btnSend = document.querySelector(".btnSubmit")
const resultDiv = document.querySelector(".result")

// Load messages from db when page started
window.addEventListener("load", async () => {
  reloadMessages();
})

// Reload messages on timer
setInterval( async () => {
  reloadMessages();
}, 5000);

// Submit message on click on button
formSend.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideUiShowLoading();
  deleteMessagesFromPage()
  await sendMessage();
  let messages = await getUsersMessages()
  await insertMessages(messages);
  showUiHideLoading();
})

async function reloadMessages() {
  hideUiShowLoading();
  deleteMessagesFromPage()
  let messages = await getUsersMessages()
  await insertMessages(messages);
  showUiHideLoading();
}

async function sendMessage() {
  const formData = new FormData(formSend);

  let response = await fetch(`${serverURL}users/insert`, {
    method: "POST",
    body: formData,
  })

  let result = await response.json();
  message.value = "";
}

async function getUsersMessages() {
  const response = await fetch(`${serverURL}users/messages`, {
    method: "GET",
  })
  const result = await response.json()
  return result
}

async function insertMessages(msgArray) {
  let myMsgArray = msgArray;

  myMsgArray.map(msgObject => {
    const messageBlock = document.createElement("div")
    messageBlock.classList.add("messageBlock")
    
    messageBlock.innerHTML = `<span class="name">${msgObject.name}</span>
    <span class="time">${msgObject.msg_time}</span>
    <div class="msgText">${msgObject.message}</div>`;

    resultDiv.appendChild(messageBlock)
  })
}

// Delete all previous messages from page
function deleteMessagesFromPage() {
  if(resultDiv.lastChild) {
    while(resultDiv.firstChild) {
      resultDiv.removeChild(resultDiv.firstChild)
    }
  }
}

function hideUiShowLoading() {
  formSend.style.display = "none";
  loading.style.display = "flex";
}

function showUiHideLoading() {
  loading.style.display = "none";
  formSend.style.display = "flex";
}