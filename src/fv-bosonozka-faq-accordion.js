window.FV_POBO_UTILS = {
    accordionToggle: () => {
        Array.from(document.querySelectorAll('.fv-bosonozka-faq-wrapper__faq-item') || []).forEach((item)=> {
            item.addEventListener('click', ()=> {
                item.classList.toggle('showed')
            })
        })
    }
}

window.FV_POBO_UTILS.accordionToggle()
