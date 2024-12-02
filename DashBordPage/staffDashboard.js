document.addEventListener('DOMContentLoaded', function() {
  // 檢查用戶權限
  if (localStorage.getItem('userRole') !== 'insuranceStaff') {
      alert('Unauthorized access');
      window.location.href = '../loginPage/loginPage.html';
      return;
  }

  console.log('Loading insurance dashboard...');
  loadOrders();

  // 綁定篩選事件
  const orderStatusSelect = document.getElementById('orderStatus');
  if (orderStatusSelect) {
      orderStatusSelect.addEventListener('change', () => {
          loadOrders(orderStatusSelect.value);
      });
  }

  // 綁定搜尋事件
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
      searchInput.addEventListener('input', () => {
          loadOrders(orderStatusSelect?.value || 'all');
      });
  }

  // 綁定登出按鈕事件
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Modal關閉按鈕
  document.querySelector('.close')?.addEventListener('click', () => {
      document.getElementById('orderModal').style.display = 'none';
  });

  // 點擊Modal外部關閉
  window.addEventListener('click', (event) => {
      const modal = document.getElementById('orderModal');
      if (event.target === modal) {
          modal.style.display = 'none';
      }
  });
});

function loadOrders(status = 'all') {
  console.log('Loading orders...', {status});
  const tableBody = document.getElementById('ordersTableBody');
  const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
  
  if (!tableBody) {
      console.error('Table body not found');
      return;
  }

  tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading orders...</td></tr>';

  const params = new URLSearchParams({status});
  
  fetch(`get_orders.php?${params.toString()}`)
      .then(response => response.json())
      .then(response => {
          console.log('Received response:', response);
          tableBody.innerHTML = '';

          if (!response.success || !response.data || response.data.length === 0) {
              tableBody.innerHTML = `
                  <tr>
                      <td colspan="7" style="text-align: center;">No orders found</td>
                  </tr>`;
              return;
          }

          // 過濾搜尋結果
          const filteredOrders = response.data.filter(order => {
              const searchString = `${order.insuranceID} ${order.customer_name} ${order.vehicle_model}`.toLowerCase();
              return searchString.includes(searchInput);
          });

          if (filteredOrders.length === 0) {
              tableBody.innerHTML = `
                  <tr>
                      <td colspan="7" style="text-align: center;">No matching orders found</td>
                  </tr>`;
              return;
          }

          filteredOrders.forEach(order => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${order.insuranceID}</td>
                  <td>${formatDate(order.request_date)}</td>
                  <td>${order.customer_name || ''}</td>
                  <td>${order.vehicle_model || ''}</td>
                  <td>${order.cc || ''}</td>
                  <td>
                      <span class="status-badge status-${(order.status || 'pending').toLowerCase()}">
                          ${order.status || 'Pending'}
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
                  <td colspan="7" style="text-align: center; color: red;">
                      Error loading orders: ${error.message}
                  </td>
              </tr>`;
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
          
          // 根據狀態決定顯示表單還是只讀資訊
          if (order.status === 'pending') {
              displayEditableForm(order);
          } else {
              displayReadOnlyInfo(order);
          }
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

function displayEditableForm(order) {
  const modalContent = document.getElementById('orderDetails');
  
  let html = `
      <div class="insurance-details">
          <h2>Insurance Application Details</h2>
          
          <div class="section">
              <h3>Application Information</h3>
              <div class="detail-row">
                  <label>Customer:</label>
                  <span>${order.customer_name || ''}</span>
              </div>
              <div class="detail-row">
                  <label>Vehicle Model:</label>
                  <span>${order.vehicle_model || ''}</span>
              </div>
              <div class="detail-row">
                  <label>CC:</label>
                  <span>${order.cc || ''}</span>
              </div>
              <div class="detail-row">
                  <label>Driver Age:</label>
                  <span>${order.driver_age || ''}</span>
              </div>
              <div class="detail-row">
                  <label>Driver Occupation:</label>
                  <span>${order.driver_occupation || ''}</span>
              </div>
          </div>
          
          <form id="insuranceQuoteForm" onsubmit="handleQuoteSubmit(event)">
              <input type="hidden" name="requestId" value="${order.insuranceID}">
              
              <div class="section">
                  <h3>Update Insurance Quote</h3>
                  <div class="form-group">
                      <label>Premium Amount (HKD)</label>
                      <input type="number" name="premiumAmount" required step="0.01" min="0">
                  </div>
                  <div class="form-group">
                      <label>NCD Percentage (%)</label>
                      <input type="number" name="ncdPercentage" required min="0" max="100">
                  </div>
                  <div class="form-group">
                      <label>Third Party Property Damage Limit (HKD)</label>
                      <input type="number" name="tppdLimit" required step="0.01" min="0">
                  </div>
                  <div class="form-group">
                      <label>Third Party Bodily Injury Limit (HKD)</label>
                      <input type="number" name="tpbiLimit" required step="0.01" min="0">
                  </div>
              </div>

              <div class="section">
                  <h3>Excess Details</h3>
                  <div class="form-group">
                      <label>TPPD Excess (HKD)</label>
                      <input type="number" name="tppdExcess" required step="0.01" min="0">
                  </div>
                  <div class="form-group">
                      <label>Young Driver Excess (HKD)</label>
                      <input type="number" name="youngDriverExcess" required step="0.01" min="0">
                  </div>
                  <div class="form-group">
                      <label>Inexperienced Driver Excess (HKD)</label>
                      <input type="number" name="inexperiencedExcess" required step="0.01" min="0">
                  </div>
                  <div class="form-group">
                      <label>Unnamed Driver Excess (HKD)</label>
                      <input type="number" name="unnamedExcess" required step="0.01" min="0">
                  </div>
              </div>

              <div class="form-group">
                  <label>Remarks</label>
                  <textarea name="remarks" rows="3"></textarea>
              </div>

              <div class="form-actions">
                  <button type="submit" class="btn-submit">Submit Quote</button>
              </div>
          </form>
      </div>
  `;
  
  modalContent.innerHTML = html;
}

function displayReadOnlyInfo(order) {
  const modalContent = document.getElementById('orderDetails');
  
  let statusText = '';
  switch(order.status) {
      case 'pending': statusText = 'Pending Review'; break;
      case 'processing': statusText = 'Processing'; break;
      case 'accepted': statusText = 'Accepted by Customer'; break;
      case 'rejected': statusText = 'Rejected by Customer'; break;
      case 'completed': statusText = 'Completed'; break;
      default: statusText = order.status;
  }
  
  let html = `
      <div class="insurance-details">
          <h2>Insurance Application Details</h2>
          
          <div class="section">
              <h3>Status</h3>
              <div class="status-info">
                  <span class="status-badge status-${order.status.toLowerCase()}">
                      ${statusText}
                  </span>
              </div>
          </div>

          <div class="section">
              <h3>Customer Information</h3>
              <div class="detail-row">
                  <label>Customer Name:</label>
                  <span>${order.customer_name}</span>
              </div>
              <div class="detail-row">
                  <label>Vehicle Model:</label>
                  <span>${order.vehicle_model}</span>
              </div>
              <div class="detail-row">
                  <label>CC:</label>
                  <span>${order.cc}</span>
              </div>
              <div class="detail-row">
                  <label>Driver Age:</label>
                  <span>${order.driver_age}</span>
              </div>
              <div class="detail-row">
                  <label>Driver Occupation:</label>
                  <span>${order.driver_occupation}</span>
              </div>
          </div>

          <div class="section">
              <h3>Quote Information</h3>
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
          </div>

          <div class="section">
              <h3>Excess Details</h3>
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

          ${order.remarks ? `
              <div class="section">
                  <h3>Remarks</h3>
                  <div class="remarks">
                      ${order.remarks}
                  </div>
              </div>
          ` : ''}

          ${(order.status === 'accepted' || order.status === 'rejected') ? `
              <div class="action-buttons">
                  <button onclick="completeOrder(${order.insuranceID})" class="btn-complete">
                      Complete Order
                  </button>
              </div>
          ` : ''}
      </div>
  `;
  
  modalContent.innerHTML = html;
}

function handleQuoteSubmit(e) {
  e.preventDefault();
  console.log('Form submitted');
  
  const form = e.target;
  const formData = {
      requestId: form.querySelector('[name="requestId"]').value,
      premiumAmount: parseFloat(form.querySelector('[name="premiumAmount"]').value),
      ncdPercentage: parseInt(form.querySelector('[name="ncdPercentage"]').value),
      tppdLimit: parseFloat(form.querySelector('[name="tppdLimit"]').value),
      tpbiLimit: parseFloat(form.querySelector('[name="tpbiLimit"]').value),
      tppdExcess: parseFloat(form.querySelector('[name="tppdExcess"]').value),
      youngDriverExcess: parseFloat(form.querySelector('[name="youngDriverExcess"]').value),
      inexperiencedExcess: parseFloat(form.querySelector('[name="inexperiencedExcess"]').value),
      unnamedExcess: parseFloat(form.querySelector('[name="unnamedExcess"]').value),
      remarks: form.querySelector('[name="remarks"]').value || ''
  };

  console.log('Sending data:', formData);

  fetch('update_quote.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(result => {
      console.log('Server response:', result);
      if (result.success) {
          alert('Quote updated successfully');
          document.getElementById('orderModal').style.display = 'none';
          loadOrders();
      } else {
          throw new Error(result.error || 'Failed to update quote');
      }
  })
  .catch(error => {
      console.error('Error:', error);
      alert('Error updating quote: ' + error.message);
  });
}

function completeOrder(requestId) {
  if (!confirm('Are you sure you want to complete this order?')) {
      return;
  }

  fetch('complete_order.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId })
  })
  .then(response => response.json())
  .then(result => {
      if (result.success) {
          alert('Order completed successfully');
          document.getElementById('orderModal').style.display = 'none';
          loadOrders();
      } else {
          throw new Error(result.error || 'Failed to complete order');
      }
  })
  .catch(error => {
      console.error('Error:', error);
      alert('Error completing order: ' + error.message);
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-HK', {
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

function handleLogout() {
  try {
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      window.location.href = '../loginPage/loginPage.html';
  } catch (error) {
      console.error('Logout error:', error);
      alert('Error during logout. Please try again.');
  }
}