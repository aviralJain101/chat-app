const socket = io()

// socket.on('countUpdated',(count)=>{ //a callback function that recieves argument emitted from server
//     console.log('count updated',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     socket.emit('increment')
// })

const messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = ()=>{
    //new message element
    const $newMessage = messages.lastElementChild

    //height of the new messages
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = messages.offsetHeight

    //height of the messages container
    const containerHeight = messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    const html = Mustache.render(locationTemplate,{
        username:url.username,
        locationUrl:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')

messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sentMessage',message,(messageAckn)=>{
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()

        console.log(messageAckn)
    })
})

const locationButton = document.querySelector('#send-location')
locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by this browser')
    }
    locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            locationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join',{username, room},(error)=>{
    if(error){
        location.href = '/'
        alert(error)
    }
})