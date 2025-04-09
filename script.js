document.getElementById("getLocationBtn").addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        document.getElementById("locationDisplay").textContent = `Your location: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  
        // Store coordinates for use in next step
        window.userLocation = { latitude, longitude };
      }, error => {
        document.getElementById("locationDisplay").textContent = "Failed to get location.";
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  });
  
  document.getElementById("groceryForm").addEventListener("submit", event => {
    event.preventDefault();
    const groceries = document.getElementById("groceryList").value.split(",").map(item => item.trim());
    const location = window.userLocation || { latitude: 0, longitude: 0 };
  
    // Temporary placeholder for fake store data
    const stores = [
      { name: "Walmart", priceMultiplier: 1.0 },
      { name: "Target", priceMultiplier: 1.1 },
      { name: "Whole Foods", priceMultiplier: 1.3 },
    ];
  
    const basePrices = {
      milk: 2.50,
      eggs: 3.00,
      bread: 2.00,
      bananas: 0.50,
    };
  
    let resultHTML = "<h2>Price Comparison:</h2><ul>";
  
    stores.forEach(store => {
      let total = 0;
      groceries.forEach(item => {
        const base = basePrices[item.toLowerCase()] || 5.00; // default if unknown
        total += base * store.priceMultiplier;
      });
      resultHTML += `<li><strong>${store.name}</strong>: $${total.toFixed(2)}</li>`;
    });
  
    resultHTML += "</ul>";
    document.getElementById("results").innerHTML = resultHTML;
  });
  