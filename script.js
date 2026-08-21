const clickButton = document.getElementById("clickButton");

if (clickButton) {
	clickButton.addEventListener("click", function () {
		alert("Hello ! Welcome to my Website, Piyush.");
	});
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
	const fullName = document.getElementById("full-name");
	const email = document.getElementById("email");
	const message = document.getElementById("message");
	const formMessage = document.getElementById("formMessage");

	contactForm.addEventListener("submit", function (event) {
		event.preventDefault();

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!fullName.value.trim() || !email.value.trim() || !message.value.trim()) {
			formMessage.textContent = "Please fill in your full name, email and message.";
			formMessage.className = "form-message form-error";
			return;
		}

		if (!emailPattern.test(email.value.trim())) {
			formMessage.textContent = "Please enter a valid email address.";
			formMessage.className = "form-message form-error";
			return;
		}

		formMessage.textContent = "Thank you! Your message has been sent successfully.";
		formMessage.className = "form-message form-success";
		contactForm.reset();
	});
}

const expiryForm = document.getElementById("expiryForm");

if (expiryForm) {
	const productNameInput = document.getElementById("productName");
	const expiryDateInput = document.getElementById("expiryDate");
	const expiryMessage = document.getElementById("expiryMessage");
	const productList = document.getElementById("productList");
	const productSearch = document.getElementById("productSearch");
	const totalProducts = document.getElementById("totalProducts");
	const expiringSoon = document.getElementById("expiringSoon");
	const expiredProducts = document.getElementById("expiredProducts");
	const storageKey = "piyushExpiryProducts";

	function getProducts() {
		return JSON.parse(localStorage.getItem(storageKey) || "[]");
	}

	function saveProducts(products) {
		localStorage.setItem(storageKey, JSON.stringify(products));
	}

	function getDaysRemaining(expiryDate) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const dateParts = expiryDate.split("-").map(Number);
		const expiry = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
		return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
	}

	function formatDate(expiryDate) {
		const dateParts = expiryDate.split("-").map(Number);
		return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString();
	}

	function getStatus(daysRemaining) {
		if (daysRemaining <= 0) {
			return { label: "Expired", className: "status-expired" };
		}
		if (daysRemaining <= 7) {
			return { label: "Expiring Soon", className: "status-soon" };
		}
		return { label: "Safe", className: "status-safe" };
	}

	function renderProducts() {
		const products = getProducts();
		const searchTerm = productSearch.value.trim().toLowerCase();
		const filteredProducts = products.filter(function (product) {
			return product.name.toLowerCase().includes(searchTerm);
		});
		let soonCount = 0;
		let expiredCount = 0;

		products.forEach(function (product) {
			const status = getStatus(getDaysRemaining(product.expiryDate));
			if (status.className === "status-soon") {
				soonCount += 1;
			}
			if (status.className === "status-expired") {
				expiredCount += 1;
			}
		});

		totalProducts.textContent = products.length;
		expiringSoon.textContent = soonCount;
		expiredProducts.textContent = expiredCount;
		productList.innerHTML = "";

		if (filteredProducts.length === 0) {
			productList.innerHTML = `<p class="empty-list">${products.length === 0 ? "No products added yet." : "No matching products found."}</p>`;
			return;
		}

		filteredProducts.forEach(function (product) {
			const daysRemaining = getDaysRemaining(product.expiryDate);
			const productItem = document.createElement("article");
			const status = document.createElement("p");
			const deleteButton = document.createElement("button");
			const statusInfo = getStatus(daysRemaining);

			productItem.className = "expiry-item";
			productItem.innerHTML = `<div class="expiry-details"><h3></h3><p>Expiry date: ${formatDate(product.expiryDate)}</p><p class="days-remaining"></p></div>`;
			productItem.querySelector("h3").textContent = product.name;
			productItem.querySelector(".days-remaining").textContent = daysRemaining > 0 ? `${daysRemaining} days remaining` : "0 days remaining";
			status.className = `expiry-status ${statusInfo.className}`;
			status.textContent = statusInfo.label;

			deleteButton.className = "delete-button";
			deleteButton.type = "button";
			deleteButton.textContent = "Delete";
			deleteButton.addEventListener("click", function () {
				saveProducts(getProducts().filter(function (savedProduct) {
					return savedProduct.id !== product.id;
				}));
				renderProducts();
			});

			productItem.append(status, deleteButton);
			productList.appendChild(productItem);
		});
	}

	expiryForm.addEventListener("submit", function (event) {
		event.preventDefault();
		expiryMessage.textContent = "";

		if (!productNameInput.value.trim() || !expiryDateInput.value) {
			expiryMessage.textContent = "Please enter a product name and expiry date.";
			expiryMessage.className = "form-message form-error";
			return;
		}

		const products = getProducts();
		products.push({
			id: Date.now(),
			name: productNameInput.value.trim(),
			expiryDate: expiryDateInput.value
		});
		saveProducts(products);
		expiryForm.reset();
		expiryMessage.textContent = "Product added successfully.";
		expiryMessage.className = "form-message form-success";
		renderProducts();
	});

	renderProducts();
	productSearch.addEventListener("input", renderProducts);
}
