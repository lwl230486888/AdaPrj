document.addEventListener("DOMContentLoaded", function () {
  console.log("Customer Dashboard loaded");
  loadOrders();

  // 綁定篩選事件
  const orderType = document.getElementById("orderType");
  const orderStatus = document.getElementById("orderStatus");

  if (orderType) orderType.addEventListener("change", loadOrders);
  if (orderStatus) orderStatus.addEventListener("change", loadOrders);

  // 綁定 Modal 關閉按鈕
  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("orderModal").style.display = "none";
    });
  }

  // 點擊 Modal 外部關閉
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("orderModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

function loadOrders(status = "all") {
  console.log("Loading orders...", { status });
  const tableBody = document.getElementById("ordersTableBody");
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();

  if (!tableBody) {
    console.error("Table body not found");
    return;
  }

  tableBody.innerHTML =
    '<tr><td colspan="7" style="text-align: center;">Loading orders...</td></tr>';

  const params = new URLSearchParams({ status });

  fetch(`get_orders.php?${params.toString()}`)
    .then((response) => response.json())
    .then((response) => {
      console.log("Received response:", response);
      tableBody.innerHTML = "";

      if (!response.success || !response.data || response.data.length === 0) {
        tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center;">No orders found</td>
                    </tr>`;
        return;
      }

      // Filter orders based on search input
      const filteredOrders = response.data.filter((order) => {
        const searchString =
          `${order.insuranceID} ${order.customer_name}`.toLowerCase();
        return searchString.includes(searchInput);
      });

      if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center;">No matching orders found</td>
                    </tr>`;
        return;
      }

      filteredOrders.forEach((order) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${escapeHtml(order.insuranceID)}</td>
                    <td>${escapeHtml(formatDate(order.request_date))}</td>
                    <td>${escapeHtml(order.customer_name || "")}</td>
                    <td>${escapeHtml(order.vehicle_model || "")}</td>
                    <td>${escapeHtml(order.cc || "")}</td>
                    <td>
                        <span class="status-badge status-${(
                          order.status || "pending"
                        ).toLowerCase()}">
                            ${escapeHtml(order.status || "Pending")}
                        </span>
                    </td>
                    <td>
                        <button onclick="viewOrderDetails(${
                          order.insuranceID
                        })" class="btn-view">
                            View Details
                        </button>
                    </td>
                `;
        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: red;">
                        Error loading orders: ${error.message}
                    </td>
                </tr>`;
    });
}

// Add search functionality
document.getElementById("searchInput").addEventListener("input", () => {
  loadOrders(document.getElementById("orderStatus").value);
});

// Add status filter functionality
document.getElementById("orderStatus").addEventListener("change", (e) => {
  loadOrders(e.target.value);
});

function viewOrderDetails(orderId) {
  console.log("Loading order details:", orderId);

  const detailsContainer = document.getElementById("orderDetails");
  if (!detailsContainer) {
    console.error("Details container not found");
    return;
  }

  // 顯示 loading 狀態
  detailsContainer.innerHTML = '<div class="loading">Loading...</div>';
  document.getElementById("orderModal").style.display = "block";

  fetch(`get_order_details.php?id=${orderId}`)
    .then((response) => response.json())
    .then((response) => {
      console.log("Received order details:", response);

      if (!response.success) {
        throw new Error(response.error || "Failed to load order details");
      }

      const order = response.data;

      // 根據狀態決定顯示表單還是只讀資訊
      if (order.status === "pending") {
        displayEditableForm(order);
      } else {
        displayReadOnlyInfo(order);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      detailsContainer.innerHTML = `
                <div class="error-message">
                    Error loading order details: ${escapeHtml(error.message)}
                </div>
            `;
    });
}

function displayEditableForm(order) {
  const modalContent = document.getElementById("orderDetails");

  let html = `
        <div class="insurance-details">
            <h2>Insurance Application Details</h2>
            
            <div class="section">
                <h3>Application Information</h3>
                <div class="detail-row">
                    <label>Customer:</label>
                    <span>${escapeHtml(order.customer_name || "")}</span>
                </div>
                <div class="detail-row">
                    <label>Vehicle Model:</label>
                    <span>${escapeHtml(order.vehicle_model || "")}</span>
                </div>
                <div class="detail-row">
                    <label>CC:</label>
                    <span>${escapeHtml(order.cc || "")}</span>
                </div>
            </div>
            
            <form id="insuranceQuoteForm" onsubmit="handleQuoteSubmit(event)">
                <input type="hidden" name="requestId" value="${
                  order.insuranceID
                }">
                
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
                        <label>TPPD Limit (HKD)</label>
                        <input type="number" name="tppdLimit" required step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label>TPBI Limit (HKD)</label>
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

function acceptQuote(requestId) {
  if (!confirm("Are you sure you want to accept this quote?")) {
    return;
  }

  fetch("accept_quote.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestId }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        alert("Quote accepted successfully");
        document.getElementById("orderModal").style.display = "none";
        loadOrders();
      } else {
        throw new Error(result.error || "Failed to accept quote");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error accepting quote: " + error.message);
    });
}

function rejectQuote(requestId) {
  if (
    !confirm(
      "Are you sure you want to reject this quote? This action cannot be undone."
    )
  ) {
    return;
  }

  fetch("reject_quote.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestId }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        alert("Quote rejected successfully");
        document.getElementById("orderModal").style.display = "none";
        loadOrders();
      } else {
        throw new Error(result.error || "Failed to reject quote");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error rejecting quote: " + error.message);
    });
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-HK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount) {
  if (!amount) return "0.00";
  return parseFloat(amount).toLocaleString("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function handleQuoteSubmit(e) {
  e.preventDefault();
  console.log("Form submitted");

  // 獲取表單數據
  const form = e.target;
  const formData = {
    requestId: form.querySelector('[name="requestId"]').value,
    premiumAmount: parseFloat(
      form.querySelector('[name="premiumAmount"]').value
    ),
    ncdPercentage: parseInt(form.querySelector('[name="ncdPercentage"]').value),
    tppdLimit: parseFloat(form.querySelector('[name="tppdLimit"]').value),
    tpbiLimit: parseFloat(form.querySelector('[name="tpbiLimit"]').value),
    tppdExcess: parseFloat(form.querySelector('[name="tppdExcess"]').value),
    youngDriverExcess: parseFloat(
      form.querySelector('[name="youngDriverExcess"]').value
    ),
    inexperiencedExcess: parseFloat(
      form.querySelector('[name="inexperiencedExcess"]').value
    ),
    unnamedExcess: parseFloat(
      form.querySelector('[name="unnamedExcess"]').value
    ),
    remarks: form.querySelector('[name="remarks"]').value || "",
  };

  console.log("Sending data:", formData);

  fetch("update_quote.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((result) => {
      console.log("Server response:", result);
      if (result.success) {
        alert("Quote updated successfully");
        document.getElementById("orderModal").style.display = "none";
        loadOrders(); // 重新載入訂單列表
      } else {
        throw new Error(result.error || "Failed to update quote");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error updating quote: " + error.message);
    });
}
