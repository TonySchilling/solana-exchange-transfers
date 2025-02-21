

class AppManager {
    constructor() {
        this.mode="similar";
        this.currentFilters=null;
    }

    printCurrentMode() {
        console.log(this.mode);
    }
}

const appManager = new AppManager();

const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});




function createElementAndAppend(parent, tagName, element_classes=null, element_id = null, elementText=null, href=null, src=null, alt=null) {
    const element = document.createElement(tagName);

    if (element_classes != null) {
        element.classList.add(...element_classes)
    }
    if (element_id != null) {
        element.id = element_id
    }
    if (elementText != null) {
        element.textContent=elementText;
    }
    if (href != null) {
        element.href=href;
        element.target='_blanks';
    }

    if (src != null) {
        element.src=src;
    }
    if (alt != null) {
        element.alt=alt;

    }

    parent.appendChild(element);

    return element;
}

function populateTransfersTable(data) {
    const transferTableBody=document.getElementById('table-transfers-body');
    transferTableBody.innerHTML="";
    // formatter.format(new Date(d['datetime']))
    data.forEach(d => {
        const row = createElementAndAppend(transferTableBody, 'tr', element_classes=null, element_id = null, elementText=null, href=null, src=null, alt=null);
        
        const datetimeVal=formatter.format(new Date(d['blockTime']))
        const datetimeField = createElementAndAppend(row, 'td', element_classes=null, element_id = null, elementText=datetimeVal, href=null, src=null, alt=null);

        const exchangeField = createElementAndAppend(row, 'td', element_classes=null, element_id = null, elementText=d['exchange'], href=null, src=null, alt=null);
        const wallet=d.to;
        const walletLink=`https://solscan.io/account/${wallet}`
        const walletText=`${wallet.substring(0,7)}...`;
        const walletField=createElementAndAppend(row, "td", element_classes=null, element_id = null, elementText=null, href=walletLink);
        const walletFieldHref=createElementAndAppend(walletField, "a", element_classes=null, element_id = null, elementText=walletText, href=walletLink);

        
        const amountField = createElementAndAppend(row, 'td', element_classes=null, element_id = null, elementText=d['amountFormatted'], href=null, src=null, alt=null);
        const tradeHash=d.hash
        const hashLink=`https://solscan.io/tx/${tradeHash}`
        const hashField=createElementAndAppend(row, "td", element_classes=null, element_id = null, elementText=null, href=hashLink);
        const hashFieldHref=createElementAndAppend(hashField, "a", element_classes=null, element_id = null, elementText=`${tradeHash.substring(0,10)}...`, href=hashLink);

    })

}

async function requestTransferData(data) {

    params = {fieldSettings:appManager.currentFilters, filters:data};

    fetch("/requestTransfers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        populateTransfersTable(data)
        document.getElementById("fullTransfersContainer").scrollIntoView();
        // populateAggregatedTable(data);
    })
}

function populateAggregatedTable(data) {
    const aggTableBody=document.getElementById('table-aggregated-body');
    aggTableBody.innerHTML="";
    
    // formatter.format(new Date(d['datetime']))
    data.forEach(d => {
        const row = createElementAndAppend(aggTableBody, 'tr', element_classes=null, element_id = null, elementText=null, href=null, src=null, alt=null);
        const amountField = createElementAndAppend(row, 'td', element_classes=null, element_id = null, elementText=d['amount'], href=null, src=null, alt=null);
        const datetimeVal=formatter.format(new Date(d['datetime']))
        const datetimeField = createElementAndAppend(row, 'td', element_classes=null, element_id = null, elementText=datetimeVal, href=null, src=null, alt=null);
        const exchangeField = createElementAndAppend(row, 'td', element_classes=null, element_id = null, elementText=d['exchange'], href=null, src=null, alt=null);
        const transfersField = createElementAndAppend(row, 'td', element_classes=null, element_id = null, elementText=d['transfers'], href=null, src=null, alt=null);

        row.addEventListener("click", () => {
            document.getElementById("fullTransfersContainer").style.display="block";
            document.getElementById("transferDescription").textContent=`Showing ${d.transfers} transfers from ${d.exchange} for ~${d.amount} sol at ~${datetimeVal}`
            d.datetime=new Date(d['datetime']);
            // console.log(d)
            requestTransferData(d);
            
        })
    })

}

const aggregateButton = document.getElementById("aggregateButton");

aggregateButton.addEventListener("click", () => {
    document.getElementById("aggregatedContainer").style.display="block";
    const decimals = document.getElementById("decimalSelect").value;
    const timeFrame = document.getElementById("timeFrameSelect").value;
    const minDate = document.getElementById("dateStart").value;
    const maxDate = document.getElementById("dateEnd").value;
    const minAmount = document.getElementById("minAmount").value;
    // const minTransfers = document.getElementById("minTransfers").value;
    const sorting = document.getElementById("sorting").value;

    const aggValues = [decimals, timeFrame, minDate, maxDate, minAmount, sorting];

    const params = {decimals:decimals, timeFrame:timeFrame, minDate:minDate, maxDate:maxDate, minAmount:minAmount, sorting:sorting}
    appManager.currentFilters = params;
    // // console.log(params);
    // aggValues.forEach((val) => {
    //     console.log(val);
    // })

    fetch("/getAggregated", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        populateAggregatedTable(data);
        document.getElementById("aggregatedContainer").scrollIntoView();
    })
    
})

