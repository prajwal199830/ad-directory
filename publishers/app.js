const searchBar = document.getElementById("searchBar");
const nicheFilter = document.getElementById("nicheFilter");
const platformFilter = document.getElementById("platformFilter");
const formatFilter = document.getElementById("formatFilter");
const directoryGrid = document.getElementById("directoryGrid");
const currencyToggleBtn = document.getElementById("currencyToggleBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");

const detailsModal = document.getElementById("detailsModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalPublisherName = document.getElementById("modalPublisherName");
const modalMetaTags = document.getElementById("modalMetaTags");
const modalChannelsList = document.getElementById("modalChannelsList");
const modalSportsList = document.getElementById("modalSportsList");
const modalPortalBtn = document.getElementById("modalPortalBtn");

const calcBudgetInput = document.getElementById("calcBudgetInput");
const calcBudgetLabel = document.getElementById("calcBudgetLabel");
const calcImpressionOutput = document.getElementById("calcImpressionOutput");
const calcNoticeText = document.getElementById("calcNoticeText");

// 💱 Currency State (true = INR, false = USD) & Exchange Rate Metric
let isCurrencyINR = true;
const EXCHANGE_RATE = 85.0; 
let currentActivePublisher = null;
let activeFilteredData = [];

// Convert internal base values out to visual text representations
function formatCpmString(min, max) {
    if (isCurrencyINR) {
        return `₹${min} - ₹${max}`;
    } else {
        const minUSD = (min / EXCHANGE_RATE).toFixed(2);
        const maxUSD = (max / EXCHANGE_RATE).toFixed(2);
        return `$${minUSD} - $${maxUSD}`;
    }
}

function filterData() {
    const searchText = searchBar.value.toLowerCase().trim();
    const selectedNiche = nicheFilter.value;
    const selectedPlatform = platformFilter.value;
    const selectedFormat = formatFilter.value;

    activeFilteredData = publishers.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText);
        const matchesNiche = selectedNiche === "all" || item.niches.includes(selectedNiche);
        const matchesPlatform = selectedPlatform === "all" || item.platform === selectedPlatform;
        const matchesFormat = selectedFormat === "all" || item.formats.includes(selectedFormat);
        return matchesSearch && matchesNiche && matchesPlatform && matchesFormat;
    });

    renderCards(activeFilteredData);
}

function renderCards(data) {
    directoryGrid.innerHTML = "";

    if (data.length === 0) {
        directoryGrid.innerHTML = '<div class="no-results">⚠️ No publishers match your analytical criteria.</div>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.addEventListener("click", () => openPublisherDetails(item.id));
        
        const nicheTags = item.niches.map(n => `<span class="tag tag-niche">🎯 ${n}</span>`).join('');
        const formatTags = item.formats.slice(0, 2).map(f => `<span class="tag tag-format">🎬 ${f}</span>`).join('');

        card.innerHTML = `
            <div class="card-title">${item.name}</div>
            <div class="tag-container">
                ${nicheTags}
                <span class="tag tag-platform">🖥️ ${item.platform}</span>
                <span class="tag tag-tier">📈 ${item.trafficTier}</span>
                ${formatTags}
            </div>
            <div class="cpm-box">Est. CPM: ${formatCpmString(item.minCpmINR, item.maxCpmINR)}</div>
            <div style="font-size: 11px; color: #3b82f6; font-weight: 600; text-align: right;">View Details ➡️</div>
        `;
        directoryGrid.appendChild(card);
    });
}

function runLiveCalculation() {
    if (!currentActivePublisher) return;

    const budget = parseFloat(calcBudgetInput.value);
    if (isNaN(budget) || budget <= 0) {
        calcImpressionOutput.textContent = "0";
        return;
    }

    const midCpmINR = (currentActivePublisher.minCpmINR + currentActivePublisher.maxCpmINR) / 2;
    let targetCpm = midCpmINR;

    // If active view state is dollar base, convert calculation inputs down to internal rates
    if (!isCurrencyINR) {
        targetCpm = midCpmINR / EXCHANGE_RATE;
    }

    const calculatedImpressions = (budget / targetCpm) * 1000;
    calcImpressionOutput.textContent = Math.round(calculatedImpressions).toLocaleString('en-IN');
    
    const symbol = isCurrencyINR ? "₹" : "$";
    calcNoticeText.textContent = `Projections mapped using midpoint baseline CPM of ${symbol}${targetCpm.toFixed(2)}`;
}

// 💱 Currency Toggle Switch Execution Loop
currencyToggleBtn.addEventListener("click", () => {
    isCurrencyINR = !isCurrencyINR;
    
    if (isCurrencyINR) {
        currencyToggleBtn.textContent = "₹ INR";
        currencyToggleBtn.className = "toggle-btn active-inr";
        calcBudgetLabel.textContent = "Enter Campaign Budget (₹)";
        calcBudgetInput.placeholder = "e.g., 50000";
    } else {
        currencyToggleBtn.textContent = "$ USD";
        currencyToggleBtn.className = "toggle-btn active-usd";
        calcBudgetLabel.textContent = "Enter Campaign Budget ($)";
        calcBudgetInput.placeholder = "e.g., 1000";
    }
    
    filterData(); // Redraws all cards under chosen currency string layouts
    if (currentActivePublisher) runLiveCalculation();
});

// 📥 Advanced Data Plan CSV Exporter Function
exportCsvBtn.addEventListener("click", () => {
    const dataToExport = activeFilteredData.length > 0 ? activeFilteredData : publishers;
    
    // Setup clean spreadsheet string header columns array row
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Publisher Name,Niches,Platform,Traffic Tier,Min CPM (INR),Max CPM (INR)\n";
    
    dataToExport.forEach(p => {
        const cleanName = p.name.replace(/,/g, ""); // Strip commas to protect boundary cells
        const nichesStr = p.niches.join(" | ");
        csvContent += `${cleanName},${nichesStr},${p.platform},${p.trafficTier},${p.minCpmINR},${p.maxCpmINR}\n`;
    });
    
    // Trigger virtual anchor browser download workflow execution sequence
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pubsrate_media_plan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

function openPublisherDetails(id) {
    const publisher = publishers.find(p => p.id === id);
    if (!publisher) return;

    currentActivePublisher = publisher;
    calcBudgetInput.value = "";
    calcImpressionOutput.textContent = "0";

    modalPublisherName.textContent = publisher.name;
    modalPortalBtn.href = publisher.portal;

    const nicheTags = publisher.niches.map(n => `<span class="tag tag-niche">🎯 ${n}</span>`).join('');
    modalMetaTags.innerHTML = `${nicheTags} <span class="tag tag-platform">🖥️ ${publisher.platform}</span>`;

    modalChannelsList.innerHTML = publisher.channels.map(c => `<li>${c}</li>`).join('');
    modalSportsList.innerHTML = publisher.sports ? publisher.sports.map(s => `<li>${s}</li>`).join('') : "<li>General Content Streams Assigned.</li>";

    detailsModal.classList.add("active");
}

function closeModal() {
    detailsModal.classList.remove("active");
    currentActivePublisher = null;
}

searchBar.addEventListener("input", filterData);
nicheFilter.addEventListener("change", filterData);
platformFilter.addEventListener("change", filterData);
formatFilter.addEventListener("change", filterData);
closeModalBtn.addEventListener("click", closeModal);
calcBudgetInput.addEventListener("input", runLiveCalculation);
window.addEventListener("click", (e) => { if (e.target === detailsModal) closeModal(); });

// Boot App
activeFilteredData = [...publishers];
renderCards(publishers);
