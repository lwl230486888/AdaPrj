document.addEventListener('DOMContentLoaded', function() {
    console.log('Staff Dashboard loaded');
    loadOrders();
    
    // 綁定篩選事件
    const orderStatus = document.getElementById('orderStatus');
    if (orderStatus) {
        orderStatus.addEventListener('change', loadOrders);
    }

    // 綁定搜尋事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => loadOrders(), 300);
        });
    }

    // Modal 關閉按鈕
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // 點擊 Modal 外部關閉
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('orderModal');
        if (event.target === modal) {
            closeModal();
        }
    });
});

function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function loadOrders() {
    const status = document.getElementById('orderStatus')?.value || 'all';
    const searchInput = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
    const tableBody = document.getElementById('ordersTableBody');
    
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    
    tableBody.innerHTML = '<tr><td colspan="7" class="loading"><div class="spinner"></div><p>Loading orders...</p></td></tr>';

    fetch(`get_orders.php?status=${status}`)
        .then(response => response.json())
        .then(response => {
            if (!response.success || !response.data || response.data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="no-orders">No insurance requests found</td>
                    </tr>`;
                return;
            }

            const filteredOrders = response.data.filter(order => {
                const searchStr = `${order.insuranceID} ${order.customer_name} ${order.vehicle_model}`.toLowerCase();
                return searchStr.includes(searchInput);
            });

            if (filteredOrders.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="no-orders">No matching orders found</td>
                    </tr>`;
                return;
            }

            tableBody.innerHTML = '';
            filteredOrders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.insuranceID}</td>
                    <td>${formatDate(order.request_date)}</td>
                    <td>${order.customer_name || 'N/A'}</td>
                    <td>${order.vehicle_model || 'N/A'}</td>
                    <td>${order.cc || 'N/A'}</td>
                    <td>
                        <span class="status-badge status-${order.status.toLowerCase()}">
                            ${getStatusText(order.status)}
                        </span>
                    </td>
                    <td>
                        <button onclick="viewOrderDetails(${order.insuranceID})" class="btn-view">
                            View Details
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        Error loading orders: ${error.message}
                    </td>
                </tr>`;
        });
}

function viewOrderDetails(orderId) {
    const modal = document.getElementById('orderModal');
    const detailsContainer = document.getElementById('orderDetails');
    
    if (!modal || !detailsContainer) {
        console.error('Modal or container not found');
        return;
    }

    detailsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading details...</p>
        </div>`;
    modal.style.display = 'block';

    fetch(`get_order_details.php?id=${orderId}`)
        .then(response => response.json())
        .then(response => {
            if (!response.success) {
                throw new Error(response.error || 'Failed to load order details');
            }

            const order = response.data;
            let html = `
                <div class="insurance-details">
                    <div class="details-header">
                        <h2>Insurance Application #${order.insuranceID}</h2>
                        <span class="status-badge status-${order.status.toLowerCase()}">
                            ${getStatusText(order.status)}
                        </span>
                    </div>

                    <div class="section">
                        <h3>Basic Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Vehicle Model</label>
                                <span>${order.vehicle_model || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <label>CC</label>
                                <span>${order.cc || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <label>Driver Age</label>
                                <span>${order.driver_age || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <label>Request Date</label>
                                <span>${formatDate(order.request_date)}</span>
                            </div>
                        </div>
                    </div>`;

            // 如果係 pending 狀態，顯示自動報價按鈕
            if (order.status === 'pending') {
                html += `
                    <div class="section">
                        <h3>Quote Generation</h3>
                        <p>Generate quotes automatically based on the application details.</p>
                        <div class="quote-actions">
                            <button onclick="generateQuotes(${order.insuranceID})" class="btn-generate">
                                Generate Quotes
                            </button>
                        </div>
                    </div>`;
            } 
            // 如果已經有計劃，顯示計劃詳情
            else if (order.plans && order.plans.length > 0) {
                html += `
                    <div class="section">
                        <h3>Insurance Plans</h3>
                        <div class="plans-grid">
                            ${order.plans.map(plan => `
                                <div class="plan-card ${order.selected_plan_id === plan.plan_id ? 'selected' : ''}">
                                    <div class="plan-header">
                                        <h4>${plan.template_id === 1 ? 'Basic' : plan.template_id === 2 ? 'Standard' : 'Premium'} Plan</h4>
                                        <div class="plan-price">
                                            <span class="currency">HK$</span>
                                            <span class="amount">${formatCurrency(plan.premium_amount)}</span>
                                        </div>
                                        <div class="plan-ncd">
                                            <span class="ncd-badge">${plan.ncd_percentage}% NCD</span>
                                        </div>
                                    </div>
                                    <div class="plan-content">
                                        <div class="plan-section">
                                            <h5>Coverage</h5>
                                            <div class="plan-item">
                                                <label>TPPD Limit</label>
                                                <span>HK$${formatCurrency(plan.tppd_limit)}</span>
                                            </div>
                                            <div class="plan-item">
                                                <label>TPBI Limit</label>
                                                <span>HK$${formatCurrency(plan.tpbi_limit)}</span>
                                            </div>
                                        </div>
                                        <div class="plan-section">
                                            <h5>Excess Details</h5>
                                            <div class="plan-item">
                                                <label>Basic</label>
                                                <span>HK$${formatCurrency(plan.excess_tppd)}</span>
                                            </div>
                                            <div class="plan-item">
                                                <label>Young Driver</label>
                                                <span>HK$${formatCurrency(plan.excess_young_driver)}</span>
                                            </div>
                                            <div class="plan-item">
                                                <label>Inexperienced</label>
                                                <span>HK$${formatCurrency(plan.excess_inexperienced)}</span>
                                            </div>
                                            <div class="plan-item">
                                                <label>Unnamed Driver</label>
                                                <span>HK$${formatCurrency(plan.excess_unnamed)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
            }

            // 訊息系統
            html += `
                <div class="section messages-section">
                    <h3>Messages</h3>
                    <div class="messages-container" id="messagesContainer">
                        ${order.messages && order.messages.length > 0 ? 
                            order.messages.map(msg => `
                                <div class="message ${msg.sender_type}">
                                    <div class="message-header">
                                        <span class="sender">${msg.sender_name}</span>
                                        <span class="time">${formatDate(msg.created_at)}</span>
                                    </div>
                                    <div class="message-content">
                                        ${escapeHtml(msg.message)}
                                    </div>
                                </div>
                            `).join('') : 
                            '<div class="no-messages">No messages yet</div>'
                        }
                    </div>
                    <div class="message-form">
                        <textarea id="messageInput" 
                                 placeholder="Type your message here..."
                                 rows="3"
                                 maxlength="500"></textarea>
                        <button onclick="sendMessage(${order.insuranceID})" class="btn-send">
                            Send Message
                        </button>
                    </div>
                </div>`;

            if (order.status === 'accepted' || order.status === 'rejected') {
                html += `
                    <div class="action-buttons">
                        <button onclick="completeOrder(${order.insuranceID})" class="btn-complete">
                            Complete Order
                        </button>
                    </div>`;
            }

            html += `</div>`;
            
            detailsContainer.innerHTML = html;

            const messagesContainer = document.getElementById('messagesContainer');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            detailsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    Error loading order details: ${error.message}
                </div>`;
        });
}

function generateQuotes(orderId) {
    if (!confirm('Are you sure you want to generate quotes for this application?')) {
        return;
    }

    fetch(`calculate_plans.php?id=${orderId}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showNotification('Quotes generated successfully', 'success');
                viewOrderDetails(orderId);
            } else {
                throw new Error(result.error || 'Failed to generate quotes');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error generating quotes: ' + error.message, 'error');
        });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${message}
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function sendMessage(orderId) {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) {
        showNotification('Please enter a message', 'warning');
        return;
    }

    fetch('send_message.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requestId: orderId,
            message: message
        })
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                // 如果係 401，即係未登入，重新導向去登入頁面
                window.location.href = '../loginPage/login.php';
                throw new Error('Please login first');
            }
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        if (result.success) {
            messageInput.value = '';
            viewOrderDetails(orderId);
            showNotification('Message sent successfully', 'success');
        } else {
            if (result.redirect) {
                window.location.href = result.redirect;
                return;
            }
            throw new Error(result.error || 'Failed to send message');
        }
    })
    .catch(error => {
        if (error.message !== 'Please login first') {
            console.error('Error:', error);
            showNotification('Error sending message: ' + error.message, 'error');
        }
    });
}

function completeOrder(orderId) {
    if (!confirm('Are you sure you want to complete this order?')) {
        return;
    }

    fetch('complete_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId: orderId })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Order completed successfully', 'success');
            closeModal();
            loadOrders();
        } else {
            throw new Error(result.error || 'Failed to complete order');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error completing order: ' + error.message, 'error');
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-HK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    if (!amount) return '0.00';
    return parseFloat(amount).toLocaleString('en-HK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusText(status) {
    switch(status.toLowerCase()) {
        case 'pending': return 'Pending Review';
        case 'processing': return 'Quote Ready';
        case 'accepted': return 'Quote Accepted';
        case 'rejected': return 'Quote Rejected';
        case 'completed': return 'Completed';
        default: return status;
    }
}