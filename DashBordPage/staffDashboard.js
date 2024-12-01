document.addEventListener('DOMContentLoaded', function() {
    console.log('Staff Dashboard loaded');
    loadOrders();
    
    // 綁定篩選事件
    const orderType = document.getElementById('orderType');
    const orderStatus = document.getElementById('orderStatus');
    
    if (orderType) orderType.addEventListener('change', loadOrders);
    if (orderStatus) orderStatus.addEventListener('change', loadOrders);
});

function loadOrders() {
    console.log('Loading orders...');
    
    const type = document.getElementById('orderType')?.value || 'all';
    const status = document.getElementById('orderStatus')?.value || 'all';
    
    fetch(`get_orders.php?type=${type}&status=${status}`)
        .then(response => response.json())
        .then(response => {
            console.log('Received data:', response);
            
            const tableBody = document.getElementById('ordersTableBody');
            if (!tableBody) {
                console.error('Table body not found');
                return;
            }
            
            tableBody.innerHTML = ''; // 清空現有內容
            
            if (!response.success || !response.data || response.data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center;">No orders found</td>
                    </tr>
                `;
                return;
            }

            response.data.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.customer_ID || ''}</td>
                    <td>${formatDate(order.request_date) || ''}</td>
                    <td>${order.customer_name || ''}</td>
                    <td>${order.vehicle_model || ''}</td>
                    <td>${order.cc || ''}</td>
                    <td>
                        <span class="status-badge status-${(order.status || 'pending').toLowerCase()}">
                            ${order.status || 'Pending'}
                        </span>
                    </td>
                    <td>
                        <button onclick="viewOrderDetails('${order.customer_ID}')" class="btn-view">
                            View Details
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            const tableBody = document.getElementById('ordersTableBody');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; color: red;">
                            Error loading orders. Please try again.
                        </td>
                    </tr>
                `;
            }
        });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-HK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function viewOrderDetails(orderId) {
    console.log('Viewing order:', orderId);
    // 實作查看訂單詳情的部分
    // TODO: 實現查看詳情的Modal
}