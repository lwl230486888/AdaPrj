document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer Dashboard loaded');
    loadOrders();
    
    // 綁定篩選事件
    const orderType = document.getElementById('orderType');
    const orderStatus = document.getElementById('orderStatus');
    
    if (orderType) orderType.addEventListener('change', loadOrders);
    if (orderStatus) orderStatus.addEventListener('change', loadOrders);

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
    
    const type = document.getElementById('orderType')?.value || 'all';
    const status = document.getElementById('orderStatus')?.value || 'all';

    fetch(`get_customer_orders.php?type=${type}&status=${status}`)
        .then(response => response.json())
        .then(response => {
            console.log('Received data:', response);
            
            const container = document.querySelector('.orders-container');
            if (!container) {
                console.error('Orders container not found');
                return;
            }
            
            container.innerHTML = '';

            if (!response.success || !response.data || response.data.length === 0) {
                container.innerHTML = `
                    <div class="no-orders">
                        <p>No insurance requests found.</p>
                    </div>
                `;
                return;
            }

            response.data.forEach(order => {
                const card = document.createElement('div');
                card.className = 'order-card';
                card.innerHTML = `
                    <div class="order-header">
                        <h3>Insurance Request</h3>
                        <span class="status-badge status-${(order.status || 'pending').toLowerCase()}">
                            ${order.status || 'Pending'}
                        </span>
                    </div>
                    <div class="order-details">
                        <p><strong>Request Date:</strong> ${formatDate(order.request_date)}</p>
                        <p><strong>Vehicle Model:</strong> ${order.vehicle_model || 'N/A'}</p>
                        <p><strong>CC:</strong> ${order.cc || 'N/A'}</p>
                    </div>
                    <button onclick="viewOrderDetails(${order.insuranceID})" class="btn-view">
                        View Details
                    </button>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            const container = document.querySelector('.orders-container');
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        Error loading orders. Please try again.
                    </div>
                `;
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

    // 顯示 loading 狀態
    detailsContainer.innerHTML = '<div class="loading">Loading...</div>';
    modal.style.display = 'block';

    fetch(`get_order_details.php?id=${orderId}`)
        .then(response => response.json())
        .then(response => {
            if (!response.success) {
                throw new Error(response.error || 'Failed to load order details');
            }

            const order = response.data;
            let html = `
                <div class="insurance-quotation">
                    <h2>Insurance Application Details</h2>
                    
                    <div class="section">
                        <h3>Basic Information</h3>
                        <div class="detail-row">
                            <label>Vehicle Model:</label>
                            <span>${order.vehicle_model || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <label>CC:</label>
                            <span>${order.cc || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Request Date:</label>
                            <span>${formatDate(order.request_date)}</span>
                        </div>
                        <div class="detail-row">
                            <label>Status:</label>
                            <span class="status-badge status-${order.status.toLowerCase()}">
                                ${order.status}
                            </span>
                        </div>
                    </div>

                    ${order.premium_amount ? `
                        <div class="section">
                            <h3>Quote Details</h3>
                            <div class="detail-row">
                                <label>Premium Amount:</label>
                                <span>HK$${formatCurrency(order.premium_amount)}</span>
                            </div>
                            <div class="detail-row">
                                <label>NCD Percentage:</label>
                                <span>${order.ncd_percentage}%</span>
                            </div>
                            <div class="detail-row">
                                <label>TPPD Limit:</label>
                                <span>HK$${formatCurrency(order.tppd_limit)}</span>
                            </div>
                            <div class="detail-row">
                                <label>TPBI Limit:</label>
                                <span>HK$${formatCurrency(order.tpbi_limit)}</span>
                            </div>

                            <h4>Excess Details</h4>
                            <div class="detail-row">
                                <label>TPPD Excess:</label>
                                <span>HK$${formatCurrency(order.excess_tppd)}</span>
                            </div>
                            <div class="detail-row">
                                <label>Young Driver Excess:</label>
                                <span>HK$${formatCurrency(order.excess_young_driver)}</span>
                            </div>
                            <div class="detail-row">
                                <label>Inexperienced Driver Excess:</label>
                                <span>HK$${formatCurrency(order.excess_inexperienced)}</span>
                            </div>
                            <div class="detail-row">
                                <label>Unnamed Driver Excess:</label>
                                <span>HK$${formatCurrency(order.excess_unnamed)}</span>
                            </div>
                        </div>

                        ${order.status === 'processing' ? `
                            <div class="action-buttons">
                                <button onclick="rejectQuote(${order.insuranceID})" class="btn-reject">Reject Quote</button>
                                <button onclick="acceptQuote(${order.insuranceID})" class="btn-accept">Accept Quote</button>
                            </div>
                        ` : ''}
                    ` : `
                        <div class="no-quote">
                            <p>Your application is being processed. Please check back later.</p>
                        </div>
                    `}
                </div>
            `;
            
            detailsContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error:', error);
            detailsContainer.innerHTML = `
                <div class="error-message">
                    Error loading order details: ${error.message}
                </div>
            `;
        });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-HK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    if (!amount) return '0.00';
    return parseFloat(amount).toLocaleString('en-HK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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
            alert('Quote accepted successfully');
            document.getElementById('orderModal').style.display = 'none';
            loadOrders();
        } else {
            throw new Error(result.error || 'Failed to accept quote');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error accepting quote: ' + error.message);
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
            alert('Quote rejected successfully');
            document.getElementById('orderModal').style.display = 'none';
            loadOrders();
        } else {
            throw new Error(result.error || 'Failed to reject quote');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error rejecting quote: ' + error.message);
    });
}