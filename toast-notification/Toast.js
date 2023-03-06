const DEFAULT_OPTIONS = {
    autoClose: 5000,
    position: "top-right",
    onClose: () => {},
    canClose: true,
    showProgress: true,
}
export default class Toast {
    #toastElm
    #autoCloseInterval
    #removeBinded
    #timeVisible = 0
    #autoClose
    #progressInterval
    #isPaused = false
    #pause
    #unpause
    #visibilitychange
    #shouldUnPause
    constructor(options) {
        this.#toastElm = document.createElement('div')
        this.#toastElm.classList.add('toast')
        requestAnimationFrame(() => {
            this.#toastElm.classList.add('show')
        })
        this.#removeBinded = this.remove.bind(this)
        this.#unpause = () => this.#isPaused = false
        this.#pause = () => this.#isPaused = true
        this.#visibilitychange = () => {
            this.#shouldUnPause = document.visibilityState === "visible"
        }
        this.update({...DEFAULT_OPTIONS,...options})
    }

    set autoClose(value) {
        this.#autoClose = value;
        this.#timeVisible = 0;
        // this.#visibleSince = new Date()
        if(value === false) return
        let lastTime
        const timeFunc = time => {
            if (this.#shouldUnPause) {
                lastTime = null
                this.#shouldUnPause = false
            }
            if (lastTime == null) {
                lastTime = time
                this.#autoCloseInterval = requestAnimationFrame(timeFunc)
                return
            }
            if(!this.#isPaused) {
                this.#timeVisible += time - lastTime;
                if(this.#timeVisible >= this.#autoClose) {
                    this.remove()
                    return
                }
                this.#toastElm.style.setProperty('--progress', 1 - this.#timeVisible / this.#autoClose)
            }
            lastTime = time
            this.#autoCloseInterval = requestAnimationFrame(timeFunc)
        }
        this.#autoCloseInterval = requestAnimationFrame(timeFunc)
    }

    set position(value) {
        const currentContainer = this.#toastElm.parentElement;
        const selector = `.toast-container[data-position="${value}"]`;
        const container = document.querySelector(selector) || createContainer(value)
        container.append(this.#toastElm);
        if (currentContainer == null || currentContainer.hasChildNodes()) return
        currentContainer.remove()
    }

    set canClose(value) {
        this.#toastElm.classList.toggle('can-close', value)
        if(value) {
            this.#toastElm.addEventListener('click', this.#removeBinded)
        } else {
            this.#toastElm.removeEventListener('click', this.#removeBinded)
        }
    }

    set text(value) {
        this.#toastElm.textContent = value;
    }

    set showProgress(value) {
        this.#toastElm.classList.toggle('progress', value)
        this.#toastElm.style.setProperty('--progress', 1)
        if (value) {
            const timeFunc = () => {
                if(!this.#isPaused) {
                    this.#toastElm.style.setProperty('--progress', 1 - this.#timeVisible / this.#autoClose)
                }
                this.#progressInterval = requestAnimationFrame(timeFunc)
            }
            this.#progressInterval = requestAnimationFrame(timeFunc)
        }
    }

    set pauseOnHover(value) {
        this.#toastElm.classList.toggle('can-close', value)
        if(value) {
            this.#toastElm.addEventListener('mouseover', this.#pause)
            this.#toastElm.addEventListener('mouseleave', this.#unpause)
        } else {
            this.#toastElm.removeEventListener('mouseover', this.#pause)
            this.#toastElm.removeEventListener('mouseleave', this.#unpause)
        }
    }
    
    set pauseOnFocusLoss(value) {
        if(value) {
            document.addEventListener('visibilitychange', this.#visibilitychange)
        } else {
            document.removeEventListener('visibilitychange', this.#visibilitychange)
        }
    }

    show(){}
    update(options){
        Object.entries(options).forEach(([key, value]) => {
            this[key] = value;
        })
    }

    remove(){
        cancelAnimationFrame(this.#autoCloseInterval)
        cancelAnimationFrame(this.#progressInterval)
        const container = this.#toastElm.parentElement;
        this.#toastElm.classList.remove('show')
        this.#toastElm.addEventListener('transitionend', () => {
            this.#toastElm.remove()
            if (container.hasChildNodes()) return
            container.remove()
        })
        this.onClose();
    }
}

function createContainer(position) {
    const container = document.createElement('div')
    container.classList.add('toast-container')
    container.dataset.position = position;
    document.body.append(container)
    return container
}