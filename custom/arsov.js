
document.addEventListener("DOMContentLoaded", function() {
    const carousels = document.querySelectorAll(".arsov-carousel");
    const carouselContainer = document.createElement("div");
    const carouselNav = document.createElement("div");
    carouselContainer.className = "arsov-carousel__container";
    carouselNav.className = "arsov-carousel__nav";

    const smallImgs = [];

    carousels.forEach((carousel, index) => {
        const imgSrc = carousel.querySelector(".arsov-carousel__img").src;
        const smallImg = document.createElement("img");
        smallImg.src = imgSrc;
        smallImg.className = "arsov-carousel__small-img";
        smallImg.dataset.index = index;
        smallImg.classList.add("arsov-carousel__nav");
        carouselNav.appendChild(smallImg);
        smallImgs.push(smallImg);
    });

    carouselContainer.appendChild(carouselNav);


    function showCarousel(index) {
        carousels.forEach((carousel, i) => {
            carousel.style.display = i === index ? "block" : "none";

            if(carousel.style.display === "block"){
                carousel.appendChild(carouselContainer);
            }
        });
        smallImgs.forEach((smallImg, i) => {
            smallImg.classList.toggle("selected", i === index);
        });
    }

    smallImgs.forEach((img, index) => {
        img.addEventListener("click", () => {
            showCarousel(index);
        });
    });

    showCarousel(0);
});
