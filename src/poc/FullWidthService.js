export default class FullWidthService {
    constructor() {
        this.left = 0;

        ['DOMContentLoaded'].forEach(event => {
            window.addEventListener(event, function () {
                FullWidthService.init();
            });
        });

        const onScroll = this.debounce(() => {
            FullWidthService.init();
        }, 200)


        window.addEventListener('resize', () => onScroll(), {
            capture: true,
            passive: true
        })
    }

    static init() {
        const innerElement = document.getElementById('pobo-inner-content');

        if (innerElement) {
            console.warn('FullWidthService: innerElement not found');
        }

        const {left, width, right} = innerElement.getBoundingClientRect();
        const { innerWidth } = window;

        const values = Object.values(innerElement.style);

        // if values contain marginLeft and Width, update inline style
        if (values.includes("marginLeft")) {
           // innerElement.style.marginLeft = `-${left}px`;
        } else {
         //   innerElement.style.marginLeft = `-${left}px`;
        }

        const getMarginFromStyle = innerElement.style.marginLeft;
        console.log('innerElement.getBoundingClientRect()', parseInt(getMarginFromStyle, 10))
        console.log('left', left)

        // if is negative


        if(left) {
            innerElement.style.marginLeft = `-${left}px`;
            innerElement.style.width = `${innerWidth}px`;
         //   innerElement.style.width = `100vw`;
            console.log('resize')
        }

    }

    debounce(func, wait, immediate, event) {
        let timeout
        return (event) => {
            const context = this
            const args = arguments
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                timeout = null
                if (!immediate) func.apply(context, args)
            }, wait)
            if (immediate && !timeout) func.apply(context, args)
        }
    }
}