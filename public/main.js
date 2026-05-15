lucide.createIcons()

const socket = io()
const input = document.getElementById('input')
const chats = document.getElementById('chats')
const submitbtn = document.getElementById('submitbtn')

window.visualViewport.addEventListener('resize', () => {
  document.documentElement.style.setProperty('--vh', `${window.visualViewport.height * 0.01}px`)
  chats.scrollTop = chats.scrollHeight
})

document
  .getElementById('reset')
  .addEventListener('click', () => {
    const chats = document.getElementById('chats')
    const input = document.getElementById('input')
    chats.innerHTML = `
      <div class="text-xs text-center text-neutral">
        <p>이 GPT는 사용자를 끔찍이도 싫어하며 당신을 고성능 AI라고 굳게 믿고 있습니다.</p>
        <p>채팅을 통해 당신이 AI가 아니라는 것을 증명하세요.</p>

        <div class="divider"></div>
      </div>
    `

    input.value = ''
    input.focus()

    socket.emit('reset')
  })

document
  .getElementById('submit')
  .addEventListener('submit', async (ev) => {    
    ev.preventDefault()

    const message = input.value
    input.value = ''

    if (message.length < 1) return

    input.disabled = true
    submitbtn.disabled = true
    
    chats.innerHTML += `
      <div class="chat chat-end">
        <div class="chat-bubble chat-bubble-primary">${message.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')}</div>
      </div>
      `

    chats.scrollTop = chats.scrollHeight

    socket.emit('chat', message)
  })

let outputElement = undefined

socket.on('chat', (chunk) => {
  if (chunk.type === 'response.created') {
    const outputId = `c-${Math.floor(Math.random() * 10000)}`
    chats.innerHTML += `
      <div class="chat chat-start">
        <div class="chat-bubble" id="${outputId}">
          <span class="loading loading-dots loading-sm text-base-300"></span>
        </div>
      </div>
    `
    chats.scrollTop = chats.scrollHeight
    outputElement = document.getElementById(outputId)
  }

  if (
    chunk.type === 'response.output_item.added' &&
    chunk.item.type === 'reasoning') {

    outputElement.innerHTML = `
      <span class="loading loading-dots loading-sm text-neutral"></span>
    `
  }

  if (
    chunk.type === 'response.output_item.added' &&
    chunk.item.type === 'message') {

    outputElement.innerHTML = '⬤'
  }

  
  if (chunk.type === 'response.output_text.delta') {
    outputElement.innerHTML =
      outputElement.innerHTML.replace('⬤', '') +
      chunk.delta.replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#x27;')
        .replace(/\//g, '&#x2F;') + '⬤'
  }

  if (chunk.type === 'response.output_text.done') {
    outputElement.innerHTML =
      outputElement.innerHTML.replace('⬤', '')
  }

  if (chunk.type === 'response.completed') {
    input.disabled = false
    submitbtn.disabled = false
    input.focus()
  }

  chats.scrollTop = chats.scrollHeight
})

socket.on('cooldown', () => {
  alert('아오 터졌잖아;; 쫌 천천히 해')
})
