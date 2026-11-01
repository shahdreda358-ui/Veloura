/*
Pagination

ProductCount=8
PageCount=5
// ProductsData 40 items [........]
 ProductsData.slice(0 , 8) //Page-1
  ProductsData.slice(9 , 15) //Page-2
//   محتاجين مكان البدايه ومكان النهايه 
*/

function calculateCartTotal(cartItems) {
    return cartItems.reduce((total, product) => {
        const price = Number(product.price);
        const discount = Number(product.discount) || 0;
        const quantity = product.amount || 1;
        return total + price * (1 - discount / 100) * quantity;
    }, 0);
}
let OriginalProductsData = [];
let currentSortMode = 'default';
let itemsPerPage = 10;
const paginationButtonCount = 5;
let currentShopPage = 1;
let selectedShopCategory = 'All';
let currentSearchKeyword = '';

function getDiscountedPrice(product) {
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    return price * (1 - discount / 100);
}

function applyProductSorting() {
    const mode = String(currentSortMode || 'default').trim().toLowerCase();

    if (mode === 'low') {
        ProductsData.sort((a, b) => getDiscountedPrice(a) - getDiscountedPrice(b));
        return;
    }

    if (mode === 'high') {
        ProductsData.sort((a, b) => getDiscountedPrice(b) - getDiscountedPrice(a));
        return;
    }

    ProductsData = [...OriginalProductsData];
}

function getData(categoryOrPage = 'All') {
    const isShopPage = $('.shop_products').length > 0;

    if (isShopPage) {
        if (typeof categoryOrPage === 'number') {
            currentShopPage = categoryOrPage;
        } else {
            selectedShopCategory = categoryOrPage;
            currentShopPage = 1;
        }

        const category = selectedShopCategory.trim().toLowerCase();
        let filteredProducts = category === 'all'
            ? [...ProductsData]
            : ProductsData.filter((product) => String(product.category || '').toLowerCase() === category);

        if (currentSearchKeyword.trim()) {
            const keyword = currentSearchKeyword.trim().toLowerCase();
            filteredProducts = filteredProducts.filter((product) => {
                const searchText = `${product.name || ''} ${product.category || ''}`.toLowerCase();
                return searchText.includes(keyword);
            });
        }

        const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
        currentShopPage = Math.min(Math.max(currentShopPage, 1), Math.max(pageCount, 1));

        const start = (currentShopPage - 1) * itemsPerPage;
        const pageProducts = filteredProducts.slice(start, start + itemsPerPage);
        const items = pageProducts
            .map((product) => DisblayProCard(product, ProductsData.indexOf(product)))
            .join('');

        const visiblePageCount = Math.min(pageCount, 10);

        $('.shop_products').html(items);
        let btns = ''
        for (let i = 0; i < paginationButtonCount; i++) {
            btns += `<a href="#" onclick="getData(${i + 1})"class="pagination-btn">
            ${i + 1}</a>
            `
        }
        const pageButtons = Array.from({ length: visiblePageCount }, (_, index) => {
            const page = index + 1;

            return `
                <button
                    type="button"
                    class="${page === currentShopPage ? 'active' : ''}"
                    data-page="${page}"
                    aria-current="${page === currentShopPage ? 'page' : 'false'}">
                    ${page}
                </button>
            `;
        });

        const firstHalf = pageButtons.slice(0, 5).join('');
        const secondHalf = pageButtons.slice(5, 10).join('');
        $('.Pagination-box').html(`
            <div class="d-flex justify-content-center align-items-center flex-wrap gap-2">${firstHalf}</div>
            <div class="d-flex justify-content-center align-items-center flex-wrap gap-2">${secondHalf}</div>
        `);
        return;
    }

    const selectedCategory = String(categoryOrPage).trim().toLowerCase();
    const items = ProductsData
        .filter((product) =>
            (selectedCategory === 'all' && product.isAll) ||
            product.category.toLowerCase() === selectedCategory
        )
        .map((product) => DisblayProCard(product, ProductsData.indexOf(product)))
        .join('');

    $('.Products-box').html(`
        <div class="d-flex flex-column justify-content-center align-items-center gap-2 text-load" style="width:max-content">
            <div class="spinner-grow" role="status">
                <span class="visually-hidden">Loading…</span>
            </div>
            <p class="">Loading....</p>
        </div>`);
    $('.Products-box').addClass('Switch-Animation');

    setTimeout(() => {
        $('.Products-box').removeClass('Switch-Animation');
        $('.Products-box').html(items);
    }, 900);
}
$(document).on('click', '.Pagination-box [data-page]', function () {
    const page = Number($(this).data('page'));

    $('.shop_products').addClass('switch');

    setTimeout(() => {
        getData(page);

        const shopTop = $('.shop_products').offset()?.top || 0;
        $('html, body').animate({ scrollTop: Math.max(shopTop - 80, 0) }, 300);

        $('.shop_products').removeClass('switch');
    }, 500);
});
// Cart CRUD
function loadCartData() {
    const savedCart = localStorage.getItem('cartData');
    if (!savedCart) {
        return [];
    }

    try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
            return parsedCart;
        }

        console.error('Saved cart data is not an array.');
    } catch (error) {
        console.error('Failed to parse saved cart data:', error);
    }

    return [];
}

let CartData = loadCartData();

function DisblayCartItem(product, index) {
    const price = Number(product.price);
    const discount = Number(product.discount) || 0;
    const discountedPrice = price * (1 - discount / 100);
    const amount = product.amount || 1;
    return `
        <div class="cart-item w-100 d-flex align-items-start p-2">
            <img src="${product.image}" alt="${product.name}"class="rounded" style="width:60px">
            <div class="d-flex flex-column align-items-start gap-2 px-2 flex-grow-1">
                <b class="fw-semibold">${product.name}</b>
                <p class="mb-0">
                    <span class="text-orange">$${(discountedPrice * amount).toFixed(2)}</span>
                </p>
                <div class="d-flex align-items-center gap-2">
                    <button type="button" class="change-cart-quantity" data-index="${index}" data-change="-1" aria-label="Decrease quantity of ${product.name}">−</button>
                    <span aria-label="Quantity">${amount}</span>
                    <button type="button" class="change-cart-quantity" data-index="${index}" data-change="1" aria-label="Increase quantity of ${product.name}">+</button>
                </div>
            </div>
            <button class="rounded-circle delete-Product" data-index="${index}" aria-label="Remove ${product.name} from cart">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>`;
}

let cartAlertTimeout;

function showCartAlert(product, alreadyAdded = false) {
    const alertIcon = $('.alert-icon');
    const alertMessage = $('#alert-message-box');
    const icon = alertIcon.find('i');

    $('#alert-pro-name').text(product.name);

    if (alreadyAdded) {
        alertMessage.text('This product is already in your cart.');
        $('.alert-layout').addClass('duplicate-alert');
        alertIcon
            .removeClass('border-success-subtle text-success border-success text-success')
            .addClass('border-danger-subtle text-danger border-danger');
        icon.removeClass('fa-check fa-circle-exclamation').addClass('fa-xmark');
    } else {
        alertMessage.html('Product Is Added Successfully<br> To Your Cart');
        $('.alert-layout').removeClass('duplicate-alert');

        alertIcon
            .removeClass('border-danger-subtle text-danger border-danger')
            .addClass('border-success-subtle text-success');

        icon.removeClass('fa-xmark fa-circle-exclamation').addClass('fa-check');
    }

    // إظهار الـ Alert
    $('.alert-layout').addClass('active');
    clearTimeout(cartAlertTimeout);
    cartAlertTimeout = setTimeout(() => {
        $('.alert-layout').removeClass('active');
    }, 2500);
}

function AddToCart(number, element, quantity = 1) {
    if (element && element.disabled) {
        return;
    }

    const product = ProductsData[number];
    if (!product) {
        console.error('Product could not be added to cart at index:', number);
        return;
    }

    const requestedQuantity = Math.max(1, Number(quantity) || 1);
    const existingCartProduct = CartData.find((cartProduct) => cartProduct.id === product.id);
    const isQuickAddFromDetails = !!(element && element.classList && element.classList.contains('details-add-to-cart'));

    const originalButtonContent = element ? element.innerHTML : '';
    if (element) {
        element.disabled = true;
        $(element).text('Processing...');
    }

    if (existingCartProduct) {
        if (!isQuickAddFromDetails && requestedQuantity === 1) {
            showCartAlert(product, true);
            if (element) {
                setTimeout(() => {
                    element.innerHTML = originalButtonContent;
                    element.disabled = false;
                }, 1000);
            }
            return;
        }

        existingCartProduct.amount = (existingCartProduct.amount || 1) + requestedQuantity;
    } else {
        CartData.push({ ...product, amount: requestedQuantity });
    }

    handerCartData();
    showCartAlert(product);

    if (element) {
        setTimeout(() => {
            element.innerHTML = originalButtonContent;
            element.disabled = false;
        }, 1000);
    }
}

function handerCartData() {
    const total = calculateCartTotal(CartData);
    $('.Actions .cart span').text(`$${total.toFixed(2)}`);
    $('#Cart-Total-Box').text(`$${total.toFixed(2)}`);

    if (CartData.length === 0) {
        $('#cart-box').html(` <div class="fs-1 opacity-50">
                    <i class="fa-solid fa-cart-shopping"></i>
                </div>
                <p class="fw-bold">No Products in The Cart.</p>
                <a href="./shop.html" class="Shop-Link text-decoration-none rounded-pill py-2 px-4">Return To Shop</a>`);
        $('#cart-box').addClass('align-items-center justify-content-center');
    } else {
        $('#cart-box').removeClass('align-items-center justify-content-center');
        let items = '';
        CartData.forEach((product, index) => {
            items += DisblayCartItem(product, index);
        });
        $('#cart-box').html(items);
    }

    localStorage.setItem('cartData', JSON.stringify(CartData));
}

let pendingDeleteProductId = null;

$(document).on('click', '.delete-Product', function () {
    const product = CartData[Number($(this).data('index'))];
    if (!product) {
        console.error('Product could not be found in the cart for removal.');
        return;
    }

    pendingDeleteProductId = product.id;
    $('#delete-confirmation-product').text(product.name);
    $('.delete-confirmation-layout').addClass('active').attr('aria-hidden', 'false');
});

$(document).on('click', '.cancel-delete-product', function () {
    pendingDeleteProductId = null;
    $('.delete-confirmation-layout').removeClass('active').attr('aria-hidden', 'true');
});

$(document).on('click', '.confirm-delete-product', function () {
    const productIndex = CartData.findIndex((product) => product.id === pendingDeleteProductId);
    if (productIndex === -1) {
        console.error('Product selected for removal is no longer in the cart.');
        pendingDeleteProductId = null;
        $('.delete-confirmation-layout').removeClass('active').attr('aria-hidden', 'true');
        return;
    }

    CartData.splice(productIndex, 1);
    pendingDeleteProductId = null;
    $('.delete-confirmation-layout').removeClass('active').attr('aria-hidden', 'true');
    handerCartData();
});

$(document).on('click', '.change-cart-quantity', function () {
    const index = Number($(this).data('index'));
    const change = Number($(this).data('change'));
    const product = CartData[index];

    if (!product || (change !== 1 && change !== -1)) {
        return;
    }

    product.amount = Math.max(1, (product.amount || 1) + change);
    handerCartData();
});

$(document).ready(handerCartData);

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
        </div>`);
    $('.Pro-Details-Layout').addClass('active');
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


/*Show-Filters-Start */
$('.show-btn').click(function () {
    $('.show-btn').removeClass('active')
    $(this).addClass('active')
    itemsPerPage = Number($(this).html())
    getData(1)
})
/*Show-Filters-End */


/*Sort Filter Start*/
// let test = [
//     { name: 'pro1', Price: 48393 },
//     { name: 'pro2', Price: 42917 },
//     { name: 'pro3', Price: 840281 },
//     { name: 'pro4', Price: 36281 },
//     { name: 'pro5', Price: 13242 },
//     { name: 'pro6', Price: 79504 },
//     { name: 'pro7', Price: 15474 },
//     { name: 'pro8', Price: 139487 },
//     { name: 'pro9', Price: 879605 },
//     { name: 'pro10', Price: 73658 },
//     { name: 'pro11', Price: 74849 }
// ]
// // من االعلي سعر الي الاقل سعر
// test.sort((a, b) => a.price - b.price) //low to high
// // من الاعلي للاقل سعر هتبي ازاي هعكس العمليه 
// test.sort((a, b) => b.price - a.price) //high to low

$('#sortInput').change(function () {
    currentSortMode = String($(this).val() || 'default');
    applyProductSorting();
    getData(1);
});
/*Sort Filter End*/


/*Search Start*/
$('#Main-Search-Input').on('input', function () {
    const keyword = String($(this).val() || '').trim().toLowerCase();
    const resultBox = $('#Search-Result');

    if (!keyword) {
        resultBox.addClass('d-none').removeClass('d-flex').html('');
        return;
    }

    let items = '';

    ProductsData.forEach((product) => {
        const name = String(product.name || '').toLowerCase();
        const category = String(product.category || '').toLowerCase();

        if (name.includes(keyword) || category.includes(keyword)) {
            const discountedPrice = Number(product.price) * (1 - (Number(product.discount) || 0) / 100);
            const productIndex = ProductsData.indexOf(product);

            items += '\n<div id="Search-Item" onclick="" class="p-1 rounded d-flex gap-1 align-items-center" data-product-index="' + productIndex + '">\n                    <div>\n                        <img src="' + product.image + '" class="rounded" width="80" height="50" alt="' + product.name + '">\n                    </div>\n                    <div class="d-flex flex-column flex-grow-1 border border-secondary rounded px-2 py-1">\n                        <span class="fw-bold">' + product.name + '</span>\n                        <span class="text-secondary">' + product.category + '</span>\n                        <div class="d-flex gap-2 align-items-center">\n                            <span class="text-decoration-line-through">$' + Number(product.price).toFixed(2) + '</span>\n                            <span class="fw-bold text-danger">$' + discountedPrice.toFixed(2) + '</span>\n                        </div>\n                    </div>\n                </div>\n            ';
        }
    });

    if (items.length > 0) {
        resultBox.removeClass('d-none').addClass('d-flex').html(items);
    } else {
        resultBox.removeClass('d-flex').addClass('d-none').html('');
    }
});

$(document).on('click', '#Search-Item', function () {
    const index = Number($(this).data('product-index'));
    const product = ProductsData[index];

    if (!product) return;

    $('#Main-Search-Input').val(product.name);
    $('#Search-Result').removeClass('d-flex').addClass('d-none').html('');
    DisplayProDetails(index);
});

$('.search-icon').on('click', function () {
    $('#Main-Search-Input').focus();
    $('#Main-Search-Input').trigger('input');
});
/*Search End */ 