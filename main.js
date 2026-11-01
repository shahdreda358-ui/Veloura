/*Info-DropDown*/
$('.drop-down-box').mouseenter(function () {
    $('.drop-down').slideDown(300)
})
$('.drop-down-box').mouseleave(function () {
    $('.drop-down').slideUp(300);
})
/*Info-DropDown*/

const storefrontHeader = document.querySelector('header');
if (storefrontHeader) {
    const updateHeaderOnScroll = () => {
        storefrontHeader.classList.toggle('header-scrolled', window.scrollY > 40);
    };

    window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
    updateHeaderOnScroll();
}

const collectionInfoPanel = document.getElementById('collectionInfoPanel');
const collectionInfoImage = document.getElementById('collectionInfoImage');
const collectionInfoTag = document.getElementById('collectionInfoTag');
const collectionInfoTitle = document.getElementById('collectionInfoTitle');
const collectionInfoPrice = document.getElementById('collectionInfoPrice');
const collectionInfoDescription = document.getElementById('collectionInfoDescription');
const collectionInfoClose = document.getElementById('collectionInfoClose');

const openCollectionInfo = (card) => {
    if (!collectionInfoPanel || !card) return;

    const title = card.dataset.title || card.querySelector('h4')?.textContent || 'Collection';
    const tag = card.dataset.tag || 'Featured';
    const price = card.dataset.price || 'From $199';
    const description = card.dataset.description || 'Explore a hand-picked selection of premium pieces for your home.';
    const image = card.querySelector('img')?.src || '';

    collectionInfoImage.src = image;
    collectionInfoImage.alt = title;
    collectionInfoTag.textContent = tag;
    collectionInfoTitle.textContent = title;
    collectionInfoPrice.textContent = price;
    collectionInfoDescription.textContent = description;
    collectionInfoPanel.classList.add('active');
};

const closeCollectionInfo = () => {
    if (collectionInfoPanel) {
        collectionInfoPanel.classList.remove('active');
    }
};

if (collectionInfoClose) {
    collectionInfoClose.addEventListener('click', closeCollectionInfo);
}

if (collectionInfoPanel) {
    collectionInfoPanel.addEventListener('click', (event) => {
        if (event.target === collectionInfoPanel) {
            closeCollectionInfo();
        }
    });
}

const collectionCards = document.querySelectorAll('.collection-card');
collectionCards.forEach((card) => {
    const openCardInfo = () => openCollectionInfo(card);

    card.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('.collection-quick-view');
        if (clickedButton) {
            event.stopPropagation();
        }
        openCardInfo();
    });

    const quickViewButton = card.querySelector('.collection-quick-view');
    if (quickViewButton) {
        quickViewButton.addEventListener('click', (event) => {
            event.stopPropagation();
            openCardInfo();
        });
    }
});

// Hero Splide
if (document.querySelector('.Hero-Slide')) {
    const splide = new Splide('.Hero-Slide', {
        type: 'loop',
        perPage: 1,
        autoplay: true,
        interval: 5000,
        speed: 2500,
        direction: 'ltr',
        arrows: false,
        pagination: false,
    });
    splide.mount();
    $('#prev-arrow').on('click', function () {
        splide.go('-1');
    });

    $('#next-arrow').on('click', function () {
        splide.go('+1');
    });

    const buttons = document.querySelectorAll('.hero-Pagination span');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            splide.go(Number(btn.dataset.slide));
        })
    })
    splide.on('move', () => {
        buttons.forEach((btn, index) => {
            btn.classList.toggle('active', index === splide.index);
        });
    });
}
const cats = $('.Best.Sellers .categories span')
let selectedCategory = 'All';
// cats.each((index, span) => {
//     span.click(function () { 
//         cats.removeClass('active');
//         this.classList.add('active')
//     })
// })
cats.click(function () {
    cats.removeClass('active');
    $(this).addClass('active');
    selectedCategory = $(this).text().trim();
    getData(selectedCategory);
});

const mobileCategoryToggle = document.querySelector('.list');
const mobileCategoryMenu = document.getElementById('categoriesList');
if (mobileCategoryToggle && mobileCategoryMenu) {
    mobileCategoryToggle.setAttribute('aria-expanded', 'false');

    mobileCategoryToggle.addEventListener('click', function (event) {
        event.preventDefault();
        const isOpen = mobileCategoryMenu.classList.toggle('show');
        mobileCategoryToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', function (event) {
        const clickedToggle = mobileCategoryToggle.contains(event.target);
        const clickedInsideMenu = mobileCategoryMenu.contains(event.target);

        if (!clickedToggle && !clickedInsideMenu) {
            mobileCategoryMenu.classList.remove('show');
            mobileCategoryToggle.setAttribute('aria-expanded', 'false');
        }
    });

    mobileCategoryMenu.querySelectorAll('.num').forEach((item) => {
        item.addEventListener('click', function () {
            mobileCategoryMenu.classList.remove('show');
            mobileCategoryToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// API------------- 
let ProductsData = []
function DisblayProCard(pro, index) {
    const originalPrice = Number(pro.price);
    const discount = Number(pro.discount) || 0;
    const discountedPrice = originalPrice * (1 - discount / 100);
    return `
                
                <div>
                    <div class="card bg-white p-2 rounded">
                        <div class="card-head fs-14 d-flex justify-content-between align-items-center">
                            ${discount > 0 ? `<div class="discount rounded-pill py-1 px-3 text-white fw-semibold">-${discount}%</div>` : ''}
                            <i class="fa-regular fa-heart text-secondary"></i>
                        </div>
                        <div class="card-img">
                            <img src="${pro.image}" alt="${pro.name}" class="rounded-2">
                        </div>
                        <div class="Card-body">
                            <div class="text-capitalize ms-3 product-title-wrap">
                                <b class="Pro-Title fw-semibold w-75">${pro.name}</b>
                                <div class="rate">
                                    <span class="text-secondary">${pro.rating}</span>
                                    <i class="fa-solid fa-star text-orange"></i>
                                </div>
                            </div>
                            <div class="pro-cat my-2 text-capitalize text-secondary">${pro.category}</div>
                            <div class="Price fw-bolder d-flex align-items-center gap-2">
                                ${discount > 0 ? `<span class="text-secondary text-decoration-line-through fw-normal">$${originalPrice.toFixed(2)}</span>` : ''}
                                <span class="text-orange">$${discountedPrice.toFixed(2)}</span>
                            </div>
                            <div class="Cart-Info mt-3 text-nowrap d-flex justify-content-between align-items-center gap-2">
                                <button onclick="AddToCart(${index},this)" class="d-flex AddToCart px-md-3 py-1 rounded-pill">
                                Add To Cart
                                </button>
                                <button type="button" onclick="DisplayProDetails(${index})" class="view-more-eye d-flex rounded-circle align-items-center justify-content-center">
<i class="fa-regular fa-eye"></i>
                                </button>
                            </div>
                        </div> 
                    </div>
                </div>`

}
function changeDetailsQuantity(button, change) {
    const wrap = button.closest('.details-quantity-wrap');
    const valueNode = wrap.querySelector('.details-quantity-value');
    const currentValue = Number(valueNode.textContent) || 1;
    valueNode.textContent = Math.max(1, currentValue + change);
}

function addDetailsProduct(index, button) {
    const info = button.closest('.details-info');
    const valueNode = info.querySelector('.details-quantity-value');
    const quantity = Number(valueNode.textContent) || 1;
    AddToCart(index, button, quantity);
}

function DisplayProDetails(index) {
    const ProDetails = ProductsData[index];
    if (!ProDetails) {
        console.error('Product details could not be found for index:', index);
        return;
    }

    const originalPrice = Number(ProDetails.price);
    const discount = Number(ProDetails.discount) || 0;
    const discountedPrice = originalPrice * (1 - discount / 100);

    $('.Pro-Details-Box #Details-Content').html(`
        <div class="details-image-panel">
            ${discount > 0 ? `<span class="details-discount">-${discount}% OFF</span>` : ''}
            <img src="${ProDetails.image}" alt="${ProDetails.name}" class="details-image">
        </div>
        <div class="details-info">
            <span class="details-eyebrow">Featured product</span>
            <h2 class="details-title">${ProDetails.name}</h2>
            <div class="details-meta">
                <span class="details-category">${ProDetails.category}</span>
                <span class="details-rating"><i class="fa-solid fa-star"></i> ${ProDetails.rating}</span>
            </div>
            <div class="details-price">
                <span class="details-current-price">$${discountedPrice.toFixed(2)}</span>
                ${discount > 0 ? `<span class="details-original-price">$${originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <p class="details-note">Explore this pick from our ${ProDetails.category} collection.</p>
            <div class="details-quantity" aria-label="Choose quantity for ${ProDetails.name}">
                <span class="details-quantity-label">Quantity</span>
                <div class="details-quantity-wrap">
                    <button type="button" class="details-quantity-btn" data-change="-1" aria-label="Decrease quantity" onclick="changeDetailsQuantity(this, -1)">−</button>
                    <span class="details-quantity-value">1</span>
                    <button type="button" class="details-quantity-btn" data-change="1" aria-label="Increase quantity" onclick="changeDetailsQuantity(this, 1)">+</button>
                </div>
            </div>
            <button type="button" class="AddToCart details-add-to-cart" data-index="${index}" onclick="addDetailsProduct(${index}, this)">
                <i class="fa-solid fa-bag-shopping"></i>
                Add To Cart
            </button>
        </div>`)
    $('.Pro-Details-Layout').addClass('active')

}

$('#Close').click(function () {
    $('.Pro-Details-Layout').removeClass('active')

})

$('.Actions .cart').on('click', function () {
    $('.Cart-LayOut').addClass('active')
})

$('.Actions .cart').on('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        $('.Cart-LayOut').addClass('active')
    }
})

$('#CloseCart').click(function () {
    $('.Cart-LayOut').removeClass('active')
})

$(document).on('click', '.Shop-Link', function () {
    $('.Cart-LayOut').removeClass('active')
})

$('.Cart-LayOut').click(function (event) {
    if (event.target === this) {
        $(this).removeClass('active')
    }
})

$('.Pro-Details-Layout').click(function () {
    $(this).removeClass('active')
}
)
$('.Pro-Details-Box').click(function (e) {
    e.stopPropagation()
})

$.ajax({
    method: 'GET',
    url: './products.json',
    dataType: 'json',
    success: function (data) {
        ProductsData = data;
        OriginalProductsData = [...data];
        if (typeof applyProductSorting === 'function') {
            applyProductSorting();
        }
        getData(selectedCategory);
    },
    error: function (err) {
        console.error('Failed to load products:', err);
    }
});
