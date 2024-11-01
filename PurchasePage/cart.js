// 獲取所有的 ADD TO CART 按鈕
const addToCartButtons = document.querySelectorAll('.checkout-container .checkout button');

addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 查找當前 item 容器，獲取車型數據
        const itemContainer = button.closest('.item');
        
        // 提取車型名稱、價格和圖片
        const carName = itemContainer.querySelector('.topic').textContent;
        const carPrice = itemContainer.querySelector('.price').textContent.split(": ")[1];
        const carImageSrc = itemContainer.querySelector('img').src;
        
        // 檢查購物車是否已有相同車型
        let existingCartItem = Array.from(cartItemsContainer.children).find(item =>
            item.querySelector('.car-title').textContent.includes(carName)
        );

        if (existingCartItem) {
            // 若已存在此車型，增加數量
            const quantityDisplay = existingCartItem.querySelector('.quantity-display');
            let currentQuantity = parseInt(quantityDisplay.textContent.split(': ')[1]);
            currentQuantity++;
            quantityDisplay.textContent = `Quantity: ${currentQuantity}`;
            
            // 更新 LocalStorage
            updateCartItemInLocalStorage(carName, currentQuantity);
        } else {
            // 創建新 cart-item
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');

            // 汽車圖片
            const carImage = document.createElement('img');
            carImage.src = carImageSrc;
            carImage.alt = carName;
            carImage.style.width = '150px';

            // 汽車名稱和價格
            const carTitle = document.createElement('p');
            carTitle.textContent = `Model: ${carName}`;
            carTitle.classList.add('car-title');

            const carPriceElement = document.createElement('p');
            carPriceElement.textContent = `Price: ${carPrice}`;

            // 數量控制
            const quantityContainer = document.createElement('div');
            quantityContainer.classList.add('quantity-container');

            let quantity = 1;

            const quantityDisplay = document.createElement('span');
            quantityDisplay.textContent = `Quantity: ${quantity}`;
            quantityDisplay.classList.add('quantity-display');

            const incrementButton = document.createElement('button');
            incrementButton.textContent = '+';
            incrementButton.addEventListener('click', () => {
                quantity++;
                quantityDisplay.textContent = `Quantity: ${quantity}`;
                updateCartItemInLocalStorage(carName, quantity);
            });

            const decrementButton = document.createElement('button');
            decrementButton.textContent = '-';
            decrementButton.addEventListener('click', () => {
                if (quantity > 1) quantity--;
                quantityDisplay.textContent = `Quantity: ${quantity}`;
                updateCartItemInLocalStorage(carName, quantity);
            });

            quantityContainer.appendChild(decrementButton);
            quantityContainer.appendChild(quantityDisplay);
            quantityContainer.appendChild(incrementButton);

            // 取消按鈕
            const cancelButton = document.createElement('button');
            cancelButton.textContent = '✕';
            cancelButton.classList.add('cancel-btn');
            cancelButton.addEventListener('click', () => {
                cartItemsContainer.removeChild(cartItem);
                removeCartItemFromLocalStorage(carName);
            });

            // 添加元素到 cart-item
            cartItem.appendChild(cancelButton);
            cartItem.appendChild(carImage);
            cartItem.appendChild(carTitle);
            cartItem.appendChild(carPriceElement);
            cartItem.appendChild(quantityContainer);

            // 添加 cart-item 到 cartItemsContainer
            cartItemsContainer.appendChild(cartItem);

            // 保存新項目到 LocalStorage
            addCartItemToLocalStorage(carName, carPrice, carImageSrc, quantity);
        }
    });
});

// LocalStorage 相關函數
function addCartItemToLocalStorage(name, price, imageSrc, quantity) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItem = cartItems.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity = quantity;
    } else {
        cartItems.push({ name, price, imageSrc, quantity });
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function updateCartItemInLocalStorage(name, quantity) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const item = cartItems.find(item => item.name === name);
    if (item) item.quantity = quantity;
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function removeCartItemFromLocalStorage(name) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const updatedCartItems = cartItems.filter(item => item.name !== name);
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
}
