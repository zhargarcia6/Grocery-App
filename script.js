let aldiPrices = {};
let walmartPrices = {};
let targetPrices = {};

const groceryListInput = document.getElementById("groceryList");
const checkPricesButton = document.getElementById("checkPrices");
const resultsBody = document.getElementById("resultsBody");
const totalPriceDisplay = document.getElementById("totalPrice");
const resultsTable = document.getElementById("resultsTable");
const locationDisplay = document.getElementById("locationDisplay");

// Load all store datasets
Promise.all([
  fetch("aldi_data.json").then(response => response.json()),
  fetch("walmart_aldi_style.json").then(response => response.json()),
  fetch("target_aldi_style.json").then(response => response.json())
])
.then(([aldiData, walmartData, targetData]) => {
  console.log("Raw data loaded:", {
    aldi: Object.keys(aldiData).length,
    walmart: Object.keys(walmartData).length,
    target: Object.keys(targetData).length
  });

  aldiPrices = normalizeData(aldiData, "Aldi");
  walmartPrices = normalizeData(walmartData, "Walmart");
  targetPrices = normalizeData(targetData, "Target");

  console.log("Normalized data:", {
    aldi: Object.keys(aldiPrices).length,
    walmart: Object.keys(walmartPrices).length,
    target: Object.keys(targetPrices).length
  });
})
.catch(error => {
  console.error("❌ Error loading store data:", error);
  alert("Failed to load store data. Please refresh the page.");
});

// Normalize key-value format to consistent objects with store
function normalizeData(data, storeName) {
  const normalized = {};
  for (const [key, value] of Object.entries(data)) {
    const name = key.toLowerCase().trim();
    const price = parseFloat(value);
    if (!isNaN(price)) {
      normalized[name] = { price, store: storeName };
    }
  }
  return normalized;
}

// Get user's location
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    locationDisplay.textContent = `📍 Your location: lat ${latitude.toFixed(2)}, lon ${longitude.toFixed(2)}`;
  },
  () => {
    locationDisplay.textContent = "📍 Unable to get location.";
  }
);

checkPricesButton.addEventListener("click", () => {
  const groceryItems = groceryListInput.value
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(item => item !== "");

  if (groceryItems.length === 0) {
    alert("Please enter at least one grocery item.");
    return;
  }

  resultsBody.innerHTML = "";
  let total = 0;
  let foundAny = false;

  groceryItems.forEach(searchTerm => {
    const matches = [];

    const addMatches = (data) => {
      Object.entries(data).forEach(([itemName, { price, store }]) => {
        if (itemName.includes(searchTerm)) {
          matches.push({ item: itemName, price, store });
        }
      });
    };

    addMatches(aldiPrices);
    addMatches(walmartPrices);
    addMatches(targetPrices);

    if (matches.length > 0) {
      foundAny = true;

      const headerRow = document.createElement("tr");
      headerRow.className = "search-term-header";
      headerRow.innerHTML = `
        <td colspan="3" style="background-color: #f0f2f5; font-weight: bold;">
          🔍 Results for "${searchTerm}"
        </td>
      `;
      resultsBody.appendChild(headerRow);

      matches.sort((a, b) => a.price - b.price);

      matches.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${match.item}</td>
          <td>${match.store}</td>
          <td>$${match.price.toFixed(2)}</td>
        `;
        resultsBody.appendChild(row);
        total += match.price;
      });

      const separatorRow = document.createElement("tr");
      separatorRow.innerHTML = `<td colspan="3" style="height: 10px;"></td>`;
      resultsBody.appendChild(separatorRow);
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="3">❌ No matches found for "${searchTerm}"</td>`;
      resultsBody.appendChild(row);
    }
  });

  totalPriceDisplay.textContent = `$${total.toFixed(2)}`;
  resultsTable.style.display = "table";
});

