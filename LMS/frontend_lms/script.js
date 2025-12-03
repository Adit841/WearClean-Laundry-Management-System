const API_BASE = "http://localhost:5000/api";

let currentPage = "home";
let isAdminLoggedIn = false;
let services = [];

const servicesData = [
  { id: 1, name: "Wash & Fold", icon: "fas fa-tshirt", description: "Complete washing and folding service for your everyday clothes", price: 10, unit: "per piece" },
  { id: 2, name: "Dry Cleaning", icon: "fas fa-spray-can", description: "Professional dry cleaning for delicate and formal wear", price: 100, unit: "per piece" },
  { id: 3, name: "Iron", icon: "iron-svg", description: "Professional ironing and pressing service", price: 5, unit: "per piece" },
  { id: 4, name: "Shoe Cleaning", icon: "fas fa-shoe-prints", description: "Deep cleaning and restoration of your footwear", price: 80, unit: "per pair" },
  { id: 5, name: "Blanket/Comforter", icon: "fas fa-bed", description: "Specialized cleaning for heavy bedding items", price: 200, unit: "per piece" },
  { id: 6, name: "Stain Removal", icon: "fas fa-magic", description: "Advanced stain removal treatment", price: 30, unit: "per piece" },
];

function init() {
  services = servicesData;
  populateServices();
  setupMinDates();
  updateNavigation();
}

function populateServices() {
  const homeGrid = document.getElementById("homeServicesGrid");
  const servicesGrid = document.getElementById("servicesGrid");
  const serviceSelection = document.getElementById("serviceSelection");

  let serviceHTML = "";
  let selectionHTML = "";

  services.forEach((service) => {
    const iconHTML =
      service.icon === "iron-svg"
        ? `<svg width="1em" height="1em" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-size: 3rem; color: #3498db;"><rect x="8" y="36" width="48" height="12" rx="6" fill="#3498db"/><rect x="16" y="24" width="32" height="16" rx="8" fill="#85c1e9"/><rect x="24" y="12" width="16" height="16" rx="8" fill="#d6eaf8"/><rect x="12" y="48" width="40" height="4" rx="2" fill="#566573"/></svg>`
        : `<i class="${service.icon}"></i>`;

    serviceHTML += `
      <div class="service-card">
        <div class="service-icon">${iconHTML}</div>
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <div class="service-price">₹${service.price} ${service.unit}</div>
      </div>
    `;

    selectionHTML += `
      <div class="service-card" style="margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="service-icon" style="font-size: 2rem; margin-bottom: 0;">${iconHTML}</div>
          <div style="flex: 1;">
            <h4>${service.name}</h4>
            <p style="margin: 0; font-size: 0.9rem;">${service.description}</p>
            <div class="service-price" style="font-size: 1rem;">₹${service.price} ${service.unit}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <label for="quantity_${service.id}">Qty:</label>
            <input type="number" id="quantity_${service.id}" min="0" value="0" style="width: 80px;" onchange="updateOrderSummary()">
          </div>
        </div>
      </div>
    `;
  });

  if (homeGrid) homeGrid.innerHTML = serviceHTML;
  if (servicesGrid) servicesGrid.innerHTML = serviceHTML;
  if (serviceSelection) serviceSelection.innerHTML = selectionHTML;
}

function setupMinDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pickupDate = document.getElementById("pickupDate");
  const deliveryDate = document.getElementById("deliveryDate");

  if (pickupDate) {
    pickupDate.min = today.toISOString().split("T")[0];
    pickupDate.addEventListener("change", function () {
      const minDelivery = new Date(this.value);
      minDelivery.setDate(minDelivery.getDate() + 2);
      if (deliveryDate) deliveryDate.min = minDelivery.toISOString().split("T")[0];
    });
  }
  if (deliveryDate) deliveryDate.min = tomorrow.toISOString().split("T")[0];
}

function showPage(pageName) {
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  const target = document.getElementById(pageName);
  if (target) target.classList.remove("hidden");
  currentPage = pageName;
  updateNavigation();

  if (pageName === "admin") {
    if (isAdminLoggedIn) {
      document.getElementById("adminLogin").classList.add("hidden");
      document.getElementById("adminDashboard").classList.remove("hidden");
      loadAdminOrders();
    } else {
      document.getElementById("adminLogin").classList.remove("hidden");
      document.getElementById("adminDashboard").classList.add("hidden");
    }
  }
}

function updateNavigation() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.onclick && link.onclick.toString().includes(currentPage)) link.classList.add("active");
  });
}

function toggleMobileMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("active");
}

function updateOrderSummary() {
  let total = 0;
  let summaryHTML = "";
  let hasItems = false;

  services.forEach((s) => {
    const qty = parseInt(document.getElementById(`quantity_${s.id}`)?.value || 0);
    if (qty > 0) {
      const subtotal = qty * s.price;
      total += subtotal;
      hasItems = true;
      summaryHTML += `<div style="display:flex;justify-content:space-between;"><span>${s.name} (${qty})</span><span>₹${subtotal}</span></div>`;
    }
  });

  document.getElementById("orderSummary").innerHTML = hasItems ? summaryHTML : "<p>No services selected</p>";
  document.getElementById("totalAmount").innerHTML = `Total: ₹${total}`;
}

/* ----------------------- CONNECTED BACKEND FUNCTIONS ---------------------- */

// 1️⃣ Place Order
async function placeOrder(event) {
  event.preventDefault();

  const customerName = document.getElementById("customerName").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const customerAddress = document.getElementById("customerAddress").value.trim();
  const pickupDate = document.getElementById("pickupDate").value;
  const deliveryDate = document.getElementById("deliveryDate").value;

  if (!customerName || !customerPhone || !customerAddress || !pickupDate || !deliveryDate) {
    return showAlert("orderAlert", "Please fill in all required fields", "error");
  }

  let selectedServices = [];
  let total = 0;

  services.forEach((s) => {
    const qty = parseInt(document.getElementById(`quantity_${s.id}`)?.value || 0);
    if (qty > 0) {
      const subtotal = qty * s.price;
      total += subtotal;
      selectedServices.push({ name: s.name, quantity: qty, price: s.price, total: subtotal, unit: s.unit });
    }
  });

  if (selectedServices.length === 0) {
    return showAlert("orderAlert", "Please select at least one service", "error");
  }

  const order = {
    id: "LM" + Date.now().toString().slice(-8),
    customerName,
    customerPhone,
    customerAddress,
    pickupDate,
    deliveryDate,
    services: selectedServices,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
    clothesPhoto: window.clothesPhotoBase64 || null,
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const data = await res.json();

    if (data.success) {
      showAlert("orderAlert", `Order placed successfully! <b>Order ID:</b> ${data.order.id}`, "success");
      document.getElementById("orderForm").reset();
      document.getElementById("clothesPhotoPreview").innerHTML = "";
      window.clothesPhotoBase64 = null;
      updateOrderSummary();
    } else {
      showAlert("orderAlert", data.message || "Something went wrong", "error");
    }
  } catch (err) {
    showAlert("orderAlert", "Error connecting to server", "error");
  }
}

// 2️⃣ Track Order
async function trackOrder() {
  const id = document.getElementById("trackOrderId").value.trim();
  const phone = document.getElementById("trackPhone").value.trim();

  if (!id || !phone) {
    return showAlert("trackingResult", "Please enter both Order ID and Phone", "error");
  }

  try {
    const res = await fetch(`${API_BASE}/orders/${id}/${phone}`);
    const data = await res.json();

    if (res.status === 404) {
      document.getElementById("trackingResult").innerHTML =
        '<div class="alert alert-error">No order found with this ID and phone number.</div>';
    } else {
      document.getElementById("trackingResult").innerHTML = `
        <div class="form-container">
          <h3>Order Details</h3>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
          <p><strong>Total:</strong> ₹${data.total}</p>
          <p><strong>Pickup:</strong> ${data.pickupDate}</p>
          <p><strong>Delivery:</strong> ${data.deliveryDate}</p>
          <hr>
          <h4>Services:</h4>
          ${data.services.map((s) => `<p>${s.name} (${s.quantity}) — ₹${s.total}</p>`).join("")}
        </div>`;
    }
  } catch (err) {
    document.getElementById("trackingResult").innerHTML =
      '<div class="alert alert-error">Error fetching order details.</div>';
  }
}

// 3️⃣ Load Admin Orders
async function loadAdminOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    const data = await res.json();
    const tbody = document.getElementById("ordersTableBody");

    if (data.length === 0)
      return (tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No orders found</td></tr>');

    tbody.innerHTML = data
      .map(
        (o) => `
        <tr>
          <td>${o.id}</td>
          <td>${o.customerName}</td>
          <td>${o.customerPhone}</td>
          <td>${o.services.map((s) => `${s.name}(${s.quantity})`).join(", ")}</td>
          <td>₹${o.total}</td>
          <td>
            ${
              o.clothesPhoto
                ? `<img src="${o.clothesPhoto}" alt="Clothes" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">`
                : `<span style="color:#999;">No image</span>`
            }
          </td>
          <td><span class="status-badge status-${o.status}">${capitalizeFirst(o.status)}</span></td>
          <td>
            <select onchange="updateOrderStatus('${o.id}', this.value)">
              <option value="pending" ${o.status === "pending" ? "selected" : ""}>Pending</option>
              <option value="processing" ${o.status === "processing" ? "selected" : ""}>Processing</option>
              <option value="delivered" ${o.status === "delivered" ? "selected" : ""}>Delivered</option>
            </select>
          </td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}


// 4️⃣ Update Order Status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) loadAdminOrders();
  } catch (err) {
    console.error(err);
  }
}

/* -------------------------------------------------------------------------- */

function previewClothesPhoto(e) {
  const file = e.target.files[0];
  const preview = document.getElementById("clothesPhotoPreview");
  if (!file) return (preview.innerHTML = "");
  const reader = new FileReader();
  reader.onload = (ev) => {
    preview.innerHTML = `<img src="${ev.target.result}" style="max-width:100%;max-height:200px;border-radius:10px;" />`;
    window.clothesPhotoBase64 = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function adminLogin() {
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;
  if (username === "admin" && password === "admin123") {
    isAdminLoggedIn = true;
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("adminDashboard").classList.remove("hidden");
    loadAdminOrders();
  } else alert("Invalid credentials! Use admin/admin123");
}

function adminLogout() {
  isAdminLoggedIn = false;
  document.getElementById("adminLogin").classList.remove("hidden");
  document.getElementById("adminDashboard").classList.add("hidden");
}

function showAlert(containerId, message, type) {
  const div = document.getElementById(containerId);
  div.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  if (type === "success") setTimeout(() => (div.innerHTML = ""), 5000);
}

function capitalizeFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  const orderForm = document.getElementById("orderForm");
  if (orderForm) orderForm.addEventListener("submit", placeOrder);
});
