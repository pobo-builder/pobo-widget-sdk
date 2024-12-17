function smoothScroll() {
    const totalHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
    ) - window.innerHeight;

    let currentPosition = 0;
    const scrollStep = 1;
    const scrollInterval = 1;

    const scrollTimer = setInterval(() => {
        if (currentPosition >= totalHeight) {
            clearInterval(scrollTimer);
            return;
        }

        window.scrollTo(0, currentPosition);
        currentPosition += scrollStep;
    }, scrollInterval);
}

// Spuštění scrollování
smoothScroll();
