document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer Dashboard loaded');
    loadOrders();
    
    // 綁定篩選事件
    const orderType = document.getElementById('orderType');
    const orderStatus = document.getElementById('orderStatus');
    
    if (orderType) orderType.addEventListener('change', loadOrders);
    if (orderStatus) orderStatus.addEventListener('change', loadOrders);
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
                    <button onclick="viewOrderDetails('${order.customer_ID}')" class="btn-view">
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

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-HK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function viewOrderDetails(orderId) {
    console.log('Viewing order:', orderId);
    // TODO: 實現查看詳情的Modal
}