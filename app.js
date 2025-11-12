// Merlin

const initializeStore = () => {
    
    // 更新为10个新的资源包产品
    const products = [
        { id: 1, code: 'ICTWEB521', name: 'AI and Machine Learning', desc: 'Comprehensive guide to artificial intelligence and machine learning algorithms with practical projects.', price: 149.99, img: 'ai-ml.jpg' },
        { id: 2, code: 'ICTWEB777', name: 'Cybersecurity Fundamentals', desc: 'Essential cybersecurity principles, threat detection, and protection strategies for modern systems.', price: 159.99, img: 'cybersecurity.jpg' },
        { id: 3, code: 'ICTWEB999', name: 'Cloud Computing Essentials', desc: 'Master cloud services, deployment models, and infrastructure management across major platforms.', price: 129.99, img: 'cloud-computing.jpg' },
        { id: 4, code: 'ICTWEB555', name: 'Data Science and Analytics', desc: 'Complete data science toolkit with Python, statistical analysis, and machine learning techniques.', price: 139.99, img: 'data-science.jpg' },
        { id: 5, code: 'ICTWEB852', name: 'Web Development Fundamentals', desc: 'Modern web development with HTML5, CSS3, JavaScript, and responsive design principles.', price: 99.99, img: 'web-dev.jpg' },
        { id: 6, code: 'ICTWEB486', name: 'Mobile App Development', desc: 'Build native and cross-platform mobile applications for iOS and Android platforms.', price: 169.99, img: 'mobile-dev.jpg' },
        { id: 7, code: 'ICTWEB111', name: 'Python Programming Mastery', desc: 'From basics to advanced Python programming with real-world applications and projects.', price: 119.99, img: 'python.jpg' },
        { id: 8, code: 'ICTWEB222', name: 'Database Systems Design', desc: 'Design, implement, and optimize relational and NoSQL database systems.', price: 134.99, img: 'database.jpg' },
        { id: 9, code: 'ICTWEB444', name: 'Software Engineering', desc: 'Software development lifecycle, agile methodologies, and project management best practices.', price: 144.99, img: 'software-eng.jpg' },
        { id: 10, code: 'ICTWEB456', name: 'Network Security Pro', desc: 'Advanced network security, penetration testing, and enterprise security architecture.', price: 179.99, img: 'network-security.jpg' }
    ];
    
    // 按照code排序
    products.sort((a, b) => a.code.localeCompare(b.code));
    
    localStorage.setItem('products', JSON.stringify(products));
    
    if (!localStorage.users) {
        localStorage.setItem('users', JSON.stringify([]));
    }
};

const auth = {
    register: () => {
        const username = document.getElementById('regUser').value.trim();
        const password = document.getElementById('regPass').value.trim();

        if (!username || !password) {
            alert('Please fill all fields');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            alert('Username can only contain letters and numbers');
            return;
        }

        const users = JSON.parse(localStorage.users);
        if (users.some(u => u.username === username)) {
            alert('Username already exists!');
            return;
        }

        users.push({ username, password });
        localStorage.users = JSON.stringify(users);
        alert('Registration successful! Please login.');
        document.getElementById('regUser').value = '';
        document.getElementById('regPass').value = '';
        
        // 切换到登录标签
        if (typeof switchTab === 'function') {
            switchTab('login');
        }
    },

    login: () => {
        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value.trim();

        const users = JSON.parse(localStorage.users);
        const user = users.find(u => 
            u.username === username && u.password === password
        );

        if (user) {
            sessionStorage.setItem('currentUser', username);
            window.location.href = 'cart.html';
        } else {
            alert('Invalid credentials!');
        }
    },

    checkAuth: () => {
        const user = sessionStorage.getItem('currentUser');
        if (!user) {
            window.location.href = 'auth.html';
            return null;
        }
        return user;
    }
};

const cart = {
    addToCart: (productId, quantity = 1) => {
        const user = sessionStorage.getItem('currentUser');
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        
        const cartKey = `cart_${user}`;
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        const products = JSON.parse(localStorage.products);
        const product = products.find(p => p.id === productId);
        
        if (product) {
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({...product, quantity});
            }
            localStorage.setItem(cartKey, JSON.stringify(cart));
            alert(`Added ${product.name} to cart!`);
        }
    },

    getCart: () => {
        const user = auth.checkAuth();
        if (!user) return [];
        return JSON.parse(localStorage.getItem(`cart_${user}`)) || [];
    },

    clearCart: () => {
        const user = auth.checkAuth();
        if (!user) return;
        localStorage.removeItem(`cart_${user}`);
    },

    removeFromCart: (productId) => {
        const user = auth.checkAuth();
        if (!user) return;
        
        const cartKey = `cart_${user}`;
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart();
    },

    updateQuantity: (productId, change) => {
        const user = auth.checkAuth();
        if (!user) return;
        
        const cartKey = `cart_${user}`;
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(item => item.id !== productId);
            }
            localStorage.setItem(cartKey, JSON.stringify(cart));
            loadCart();
        }
    }
};

const orders = {
    createOrder: () => {
        const user = auth.checkAuth();
        const cartItems = cart.getCart();
        
        if (cartItems.length === 0) {
            alert('Cart is empty!');
            return null;
        }

        const order = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: [...cartItems], // 创建副本
            total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        const orderKey = `orders_${user}`;
        const allOrders = JSON.parse(localStorage.getItem(orderKey)) || [];
        allOrders.push(order);
        localStorage.setItem(orderKey, JSON.stringify(allOrders));

        return order;
    },

    downloadAllOrders: () => {
        const user = auth.checkAuth();
        if (!user) return;
        
        const orderKey = `orders_${user}`;
        const allOrders = JSON.parse(localStorage.getItem(orderKey)) || [];
        
        if (allOrders.length === 0) {
            alert('No orders found!');
            return;
        }

        let orderText = `Order History for ${user}\n`;
        orderText += `Generated on: ${new Date().toLocaleString()}\n`;
        orderText += "========================================\n\n";
        
        allOrders.forEach((order, index) => {
            orderText += `Order #${index + 1} (ID: ${order.id})\n`;
            orderText += `Date: ${new Date(order.date).toLocaleString()}\n`;
            orderText += "Items:\n";
            
            order.items.forEach((item, i) => {
                orderText += `  ${i + 1}. ${item.name} - $${item.price.toFixed(2)} x ${item.quantity}\n`;
            });
            
            orderText += `Total: $${order.total.toFixed(2)}\n`;
            orderText += "----------------------------------------\n\n";
        });

        const blob = new Blob([orderText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${user}_order_history_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    downloadOrder: (orderId) => {
        const user = auth.checkAuth();
        if (!user) return;
        
        const orderKey = `orders_${user}`;
        const allOrders = JSON.parse(localStorage.getItem(orderKey)) || [];
        const order = allOrders.find(o => o.id === orderId);
        
        if (!order) {
            alert('Order not found!');
            return;
        }

        let orderText = `Order Details\n`;
        orderText += `Order ID: ${order.id}\n`;
        orderText += `Date: ${new Date(order.date).toLocaleString()}\n`;
        orderText += "========================================\n";
        orderText += "Items Purchased:\n\n";
        
        order.items.forEach((item, i) => {
            orderText += `  ${i + 1}. ${item.name}\n`;
            orderText += `     Code: ${item.code}\n`;
            orderText += `     Description: ${item.desc}\n`;
            orderText += `     Price: $${item.price.toFixed(2)} x ${item.quantity}\n`;
            orderText += `     Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
        });
        
        orderText += "========================================\n";
        orderText += `Total Amount: $${order.total.toFixed(2)}\n`;
        orderText += "Thank you for your purchase!\n";

        const blob = new Blob([orderText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order_${order.id}_${new Date(order.date).toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    getAllOrders: () => {
        const user = auth.checkAuth();
        return JSON.parse(localStorage.getItem(`orders_${user}`)) || [];
    }
};

const loadProductsForHome = () => {
    const products = JSON.parse(localStorage.products);
    const productList = document.getElementById('productList');
    if (!productList) return;
    
    productList.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-code">${product.code}</div>
            <h3>${product.name}</h3>
            <img src="${product.img}" alt="${product.name}" style="width: 150px" onerror="this.src='https://picsum.photos/150/150?random=${product.id}'">
            <p>${product.desc}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <!-- 移除首页的Add to Cart按钮 -->
        </div>
    `).join('');
};

const addToCartFromHome = (productId) => {
    const user = sessionStorage.getItem('currentUser');
    if (!user) {
        alert('Please login to add items to cart.');
        window.location.href = 'auth.html';
        return;
    }
    cart.addToCart(productId);
};

const loadCart = () => {
    const user = auth.checkAuth();
    if (!user) return;
    
    const products = JSON.parse(localStorage.products);
    console.log(`Loaded ${products.length} products`);
    
    const productList = document.getElementById('productList');
    if (!productList) return;
    
    productList.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-code">${product.code}</div>
            <h3>${product.name}</h3>
            <img src="${product.img}" alt="${product.name}" style="width: 150px" onerror="this.src='https://picsum.photos/150/150?random=${product.id}'">
            <p>${product.desc}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button onclick="cart.addToCart(${product.id})" class="add-to-cart">Add to Cart</button>
        </div>
    `).join('');

    const cartItems = document.getElementById('cartItems');
    const items = cart.getCart();
    cartItems.innerHTML = items.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name} (${item.code})</h4>
                <p>Price: $${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button onclick="cart.updateQuantity(${item.id}, -1)">-</button>
                    <span> Quantity: ${item.quantity} </span>
                    <button onclick="cart.updateQuantity(${item.id}, 1)">+</button>
                </div>
                <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button onclick="cart.removeFromCart(${item.id})" class="remove-item">Remove</button>
        </div>
    `).join('');
};

const loadOrder = () => {
    auth.checkAuth();
    const items = cart.getCart();
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('orderSummary').innerHTML = `
        <div class="order-summary">
            ${items.map(item => `
                <div class="order-item">
                    <p>${item.name} (${item.code}) - $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `).join('')}
            <hr>
            <h3>Total: $${total.toFixed(2)}</h3>
        </div>
    `;
};

const loadOrderHistory = () => {
    const user = auth.checkAuth();
    if (!user) return;

    const orderHistory = document.getElementById('orderHistory');
    const userOrders = orders.getAllOrders();

    if (userOrders.length === 0) {
        orderHistory.innerHTML = '<p>No orders found. Start shopping!</p>';
        return;
    }

    orderHistory.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Order #${order.id} (${new Date(order.date).toLocaleString()})</h3>
                <button onclick="orders.downloadOrder(${order.id})" class="download-order-btn">
                    Download Order
                </button>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <p>${item.name} (${item.code}) - $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                `).join('')}
            </div>
            <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
            <hr>
        </div>
    `).join('');
};

const confirmOrder = () => {
    const order = orders.createOrder();
    if (order) {
        // 不清空购物车，允许重复下单
        alert('Order confirmed!');
      
        if (confirm('Would you like to download your order receipt?')) {
            orders.downloadOrder(order.id);
        }
        // 留在确认页面，不清空购物车
    }
};

const handleLogout = () => {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
        // 不清空购物车，保留购物车数据
        sessionStorage.removeItem('currentUser');
    }
    
    let seconds = 2;
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        const interval = setInterval(() => {
            seconds--;
            countdownEl.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(interval);
                window.location.href = 'index.html';
            }
        }, 1000);
    } else {
        setTimeout(() => window.location.href = 'index.html', 2000);
    }
};

const updateUserStatus = () => {
    const userStatus = document.getElementById('userStatus');
    if (!userStatus) return;

    const user = sessionStorage.getItem('currentUser');
    userStatus.textContent = user ? `Logged in as: ${user}` : '';
};

document.addEventListener('DOMContentLoaded', () => {
    initializeStore();
    updateUserStatus();
    
    if (window.location.pathname.includes('cart.html')) {
        loadCart();
    } else if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadProductsForHome();
    }
});