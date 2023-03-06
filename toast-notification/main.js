import Toast from './Toast'
import './style.css'
import "./main.css"

// document.querySelector('#app').innerHTML = `<div class="toast">Test Message</div>`

document.querySelector('button').addEventListener('click', () => {
    const toast = new Toast({ text: "Hello World", autoClose: 5000, pauseOnHover: true, pauseOnFocusLoss: true })
})


/* setTimeout(() => {
    toast.update({ position: 'top-left' })
}, 2000) */