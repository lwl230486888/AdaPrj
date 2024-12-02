document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer Dashboard loaded');
    
    // 從 localStorage 獲取用戶名
    const userName = localStorage.getItem('userName');
    if (userName) {
        const welcomeText = document.querySelector('h1');
        if (welcomeText) {
            welcomeText.textContent = `Welcome Back, ${userName}`;
        }
    }

    loadOrders();
    
    // 綁定篩選事件
    const orderStatus = document.getElementById('orderStatus');
    if (orderStatus) {
        orderStatus.addEventListener('change', loadOrders);
    }

    // 綁定 Modal 關閉按鈕
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('orderModal').style.display = 'none';
        });
    }

    // 點擊 Modal 外部關閉
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('orderModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

function loadOrders() {
    console.log('Loading customer orders...');
    const status = document.getElementById('orderStatus')?.value || 'all';
    
    const container = document.querySelector('.orders-container');
    if (!container) {
        console.error('Orders container not found');
        return;
    }
    
    container.innerHTML = '<div class="loading">Loading orders...</div>';

    fetch(`get_customer_orders.php?status=${status}`)
        .then(response => {
            console.log('Response status:', response.status);
            if (response.status === 401) {
                window.location.href = '../login/loginPage.html';
                throw new Error('Please login first');
            }
            return response.json();
        })
        .then(response => {
            console.log('Received data:', response);

            if (!response.success) {
                throw new Error(response.error || 'Failed to load orders');
            }

            if (!response.data || response.data.length === 0) {
                container.innerHTML = `
                    <div class="no-orders">
                        <p>No insurance requests found.</p>
                    </div>`;
                return;
            }

            container.innerHTML = '';
            response.data.forEach(order => {
                const statusText = getStatusText(order.status);
                const statusClass = getStatusClass(order.status);
                
                const card = document.createElement('div');
                card.className = 'order-card';
                card.innerHTML = `
                    <div class="order-header">
                        <div class="order-title">
                            <h3>Insurance Request #${order.insuranceID}</h3>
                            <span class="status-badge ${statusClass}">
                                ${statusText}
                            </span>
                        </div>
                        <div class="order-date">
                            ${formatDate(order.request_date)}
                        </div>
                    </div>
                    <div class="order-details">
                        <div class="detail-group">
                            <label>Vehicle Model:</label>
                            <span>${order.vehicle_model || 'N/A'}</span>
                        </div>
                        <div class="detail-group">
                            <label>CC:</label>
                            <span>${order.cc || 'N/A'}</span>
                        </div>
                        <div class="detail-group">
                            <label>Driver Age:</label>
                            <span>${order.driver_age || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="order-footer">
                        <button onclick="viewOrderDetails(${order.insuranceID})" class="btn-view">
                            View Details
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            if (error.message !== 'Please login first') {
                console.error('Error:', error);
                container.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        Error loading orders: ${error.message}
                    </div>`;
            }
        });
}

function viewOrderDetails(orderId) {
    console.log('Loading order details:', orderId);
    
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
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '../login/loginPage.html';
                    throw new Error('Please login first');
                }
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(response => {
            if (!response.success) {
                throw new Error(response.error || 'Failed to load order details');
            }

            const order = response.data;
            let html = `
                <div class="insurance-details">
                    <div class="details-header">
                        <h2>Insurance Application #${order.insuranceID}</h2>
                        <span class="status-badge ${getStatusClass(order.status)}">
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

            if (order.plans && order.plans.length > 0) {
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
                                    ${order.status === 'processing' && !order.selected_plan_id ? `
                                        <div class="plan-actions">
                                            <button onclick="selectPlan(${order.insuranceID}, ${plan.plan_id})" class="btn-select">
                                                Select This Plan
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
            }

            // 訊息系統部分
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

            if (order.status === 'processing' && order.selected_plan_id) {
                html += `
                    <div class="action-buttons">
                        <button onclick="rejectQuote(${order.insuranceID})" class="btn-reject">
                            Reject Quote
                        </button>
                        <button onclick="acceptQuote(${order.insuranceID})" class="btn-accept">
                            Accept Quote
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
            if (error.message !== 'Please login first') {
                console.error('Error:', error);
                detailsContainer.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        Error loading order details: ${error.message}
                    </div>`;
            }
        });
}

function selectPlan(orderId, planId) {
    if (!confirm('Are you sure you want to select this plan?')) {
        return;
    }

    fetch('select_plan.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requestId: orderId,
            planId: planId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Plan selected successfully', 'success');
            viewOrderDetails(orderId);
        } else {
            throw new Error(result.error || 'Failed to select plan');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error selecting plan: ' + error.message, 'error');
    });
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
                window.location.href = '../login/loginPage.html';
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

function acceptQuote(orderId) {
    if (!confirm('Are you sure you want to accept this quote?')) {
        return;
    }

    fetch('accept_quote.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId: orderId })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Quote accepted successfully', 'success');
            document.getElementById('orderModal').style.display = 'none';
            loadOrders();
        } else {
            throw new Error(result.error || 'Failed to accept quote');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error accepting quote: ' + error.message, 'error');
    });
}

function rejectQuote(orderId) {
    if (!confirm('Are you sure you want to reject this quote? This action cannot be undone.')) {
        return;
    }

    fetch('reject_quote.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId: orderId })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Quote rejected successfully', 'success');
            document.getElementById('orderModal').style.display = 'none';
            loadOrders();
        } else {
            throw new Error(result.error || 'Failed to reject quote');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error rejecting quote: ' + error.message, 'error');
    });
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

function getStatusClass(status) {
    return `status-${status.toLowerCase()}`;
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