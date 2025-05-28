let aldiPrices = {};
let walmartPrices = {};
let targetPrices = {};
let nearbyStores = [];

const groceryListInput = document.getElementById("groceryList");
const checkPricesButton = document.getElementById("checkPrices");
const resultsBody = document.getElementById("resultsBody");
const totalPriceDisplay = document.getElementById("totalPrice");
const resultsTable = document.getElementById("resultsTable");
const locationDisplay = document.getElementById("locationDisplay");
const locationToggle = document.getElementById("locationToggle");
const radiusSelector = document.getElementById("radiusSelector");

// Store coordinates near Wayne, NJ
const storeLocations = {
  Aldi: { lat: 40.9456, lon: -74.2518 },
  Walmart: { lat: 40.9930, lon: -74.3086 },
  Target: { lat: 40.8824, lon: -74.2875 }
};

let userLat = null;
let userLon = null;

// Haversine distance (miles)
function getDistanceMiles(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Load pricing data
Promise.all([
  fetch("aldi_data.json").then(res => res.json()),
  fetch("walmart_data.json").then(res => res.json()),
  fetch("target_data.json").then(res => res.json())
])
.then(([aldiData, walmartData, targetData]) => {
  aldiPrices = normalizeData(aldiData, "Aldi");
  walmartPrices = normalizeData(walmartData, "Walmart");
  targetPrices = normalizeData(targetData, "Target");
})
.catch(err => {
  console.error("Data load error:", err);
  alert("❌ Error loading store data.");
});

// Normalize key-value JSON
function normalizeData(data, store) {
  const out = {};
  for (const [name, value] of Object.entries(data)) {
    const key = name.toLowerCase().trim();
    const price = parseFloat(value);
    if (!isNaN(price)) {
      out[key] = { price, store };
    }
  }
  return out;
}

// Init geolocation
navigator.geolocation.getCurrentPosition(
  pos => {
    userLat = pos.coords.latitude;
    userLon = pos.coords.longitude;

    locationDisplay.textContent = `📍 Your location: ${userLat.toFixed(2)}, ${userLon.toFixed(2)}`;
    updateNearbyStores();
  },
  err => {
    locationDisplay.textContent = "📍 Unable to get location.";
    nearbyStores = Object.keys(storeLocations); // default to all
  }
);

// Update nearbyStores based on toggle and radius
function updateNearbyStores() {
  const radius = parseFloat(radiusSelector.value);
  const useFilter = locationToggle.checked;

  nearbyStores = Object.entries(storeLocations)
    .filter(([store, coords]) => {
      if (!useFilter || userLat === null || userLon === null) return true;
      const distance = getDistanceMiles(userLat, userLon, coords.lat, coords.lon);
      return distance <= radius;
    })
    .map(([store]) => store);

  console.log("Nearby stores:", nearbyStores);
}

// Recalculate when radius or toggle changes
locationToggle.addEventListener("change", updateNearbyStores);
radiusSelector.addEventListener("change", updateNearbyStores);

// Main button click
checkPricesButton.addEventListener("click", () => {
  const groceryItems = groceryListInput.value
    .split(",")
    .map(x => x.trim().toLowerCase())
    .filter(Boolean);

  if (groceryItems.length === 0) {
    alert("Enter at least one grocery item.");
    return;
  }

  resultsBody.innerHTML = "";
  let total = 0;
  let foundAny = false;

  groceryItems.forEach(term => {
    const matches = [];

    const search = data =>
      Object.entries(data).forEach(([name, { price, store }]) => {
        if (name.includes(term) && nearbyStores.includes(store)) {
          matches.push({ item: name, price, store });
        }
      });

    search(aldiPrices);
    search(walmartPrices);
    search(targetPrices);

    if (matches.length) {
      foundAny = true;
      const best = Math.min(...matches.map(m => m.price));

      const header = document.createElement("tr");
      header.className = "search-term-header";
      header.innerHTML = `<td colspan="3" style="font-weight:bold;background:#f0f2f5;">🔍 "${term}"</td>`;
      resultsBody.appendChild(header);

      matches.sort((a, b) => a.price - b.price);
      matches.forEach(m => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${m.item}</td>
          <td>${m.store}</td>
          <td style="color:${m.price === best ? 'green' : 'inherit'};">$${m.price.toFixed(2)}</td>
        `;
        resultsBody.appendChild(row);
        total += m.price;
      });

      resultsBody.appendChild(document.createElement("tr")).innerHTML = `<td colspan="3" style="height:10px;"></td>`;
    } else {
      resultsBody.innerHTML += `<tr><td colspan="3">❌ No matches for "${term}"</td></tr>`;
    }
  });

  totalPriceDisplay.textContent = `$${total.toFixed(2)}`;
  resultsTable.style.display = "table";
});
