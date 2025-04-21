// Get user location when page loads
window.addEventListener('DOMContentLoaded', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      document.getElementById("locationDisplay").textContent = `📍 Your location: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  
      // Store coordinates for use in next step
      window.userLocation = { latitude, longitude };
    }, error => {
      document.getElementById("locationDisplay").textContent = "❌ Failed to get location. Please enable location services.";
    });
  } else {
    document.getElementById("locationDisplay").textContent = "❌ Geolocation is not supported by your browser.";
  }
});

// Handle price comparison
document.getElementById("checkPrices").addEventListener("click", () => {
  const groceries = document.getElementById("groceryList").value.split(",").map(item => item.trim());
  const location = window.userLocation || { latitude: 0, longitude: 0 };
  
  // Store data
  const stores = [
    { name: "Walmart", priceMultiplier: 1.0 },
    { name: "Target", priceMultiplier: 1.1 },
    { name: "Whole Foods", priceMultiplier: 1.3 },
  ];
  
  // Base prices for common items
  const basePrices = {
    milk: 2.50,
    eggs: 3.00,
    bread: 2.00,
    bananas: 0.50,
    apples: 1.20,
    chicken: 5.99,
    rice: 1.50,
    pasta: 1.75,
    cheese: 3.25,
    yogurt: 1.99,
    butter: 2.75,
    sugar: 1.25,
    flour: 1.50,
    oil: 3.00,
    coffee: 7.99,
    tea: 3.50,
    juice: 2.25,
    soda: 1.75,
    water: 1.00,
    tomatoes: 1.99,
    lettuce: 1.50,
    carrots: 1.25,
    potatoes: 2.00,
    onions: 1.00,
    garlic: 0.75,
    peppers: 1.75,
    spinach: 2.25,
    broccoli: 1.99,
    corn: 1.25,
    peas: 1.50,
    beans: 1.25,
    tuna: 1.99,
    salmon: 8.99,
    beef: 6.99,
    pork: 5.99,
    bacon: 4.99,
    ham: 3.99,
    turkey: 4.50,
    cereal: 3.25,
    oatmeal: 2.50,
    granola: 3.75,
    nuts: 5.99,
    chips: 2.25,
    cookies: 2.75,
    chocolate: 2.50,
    icecream: 3.99,
    pizza: 5.99,
    soup: 1.99,
    sauce: 2.25,
    spices: 1.50,
    salt: 0.75,
    pepper: 1.25,
    vinegar: 1.50,
    mayo: 2.25,
    ketchup: 1.75,
    mustard: 1.50,
    honey: 3.50,
    jam: 2.25,
    peanutbutter: 2.75,
    jelly: 1.99,
    syrup: 2.50,
    wine: 8.99,
    beer: 5.99,
    liquor: 15.99,
  };
  
  // Create the price comparison table
  const table = document.createElement('table');
  table.className = 'price-table';
  
  // Create table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Item</th>
      <th>Best Store</th>
      <th>Price</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  let total = 0;
  
  // Add each item with its price at each store
  groceries.forEach(item => {
    const itemLower = item.toLowerCase();
    const basePrice = basePrices[itemLower] || 5.00; // default if unknown
    
    // Find the best price for this item
    let bestPrice = Infinity;
    let bestStore = "";
    
    stores.forEach(store => {
      const itemPrice = basePrice * store.priceMultiplier;
      if (itemPrice < bestPrice) {
        bestPrice = itemPrice;
        bestStore = store.name;
      }
    });
    
    total += bestPrice;
    
    // Add row to results table
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item}</td>
      <td>${bestStore}</td>
      <td>$${bestPrice.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Add total row
  const totalRow = document.createElement("tr");
  totalRow.className = "total-row";
  totalRow.innerHTML = `
    <td><strong>Total</strong></td>
    <td></td>
    <td><strong>$${total.toFixed(2)}</strong></td>
  `;
  tbody.appendChild(totalRow);
  
  table.appendChild(tbody);
  
  // Clear previous results and add new table
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = '';
  resultsDiv.appendChild(table);
  
  // Add a note about unknown items
  const unknownItems = groceries.filter(item => !basePrices[item.toLowerCase()]);
  if (unknownItems.length > 0) {
    const asterisk = document.createElement("div");
    asterisk.className = "note";
    asterisk.textContent = `Note(*): The following items were not found in our database and were priced at $5.00 each: ${unknownItems.join(', ')}`;
    resultsDiv.appendChild(asterisk);
  }
  
  // Show the table
  table.style.display = "table";
});
