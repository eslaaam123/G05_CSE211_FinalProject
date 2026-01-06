// ES6 Class for Budget Calculator
class BudgetCalculator {
    constructor() {
        this.services = {
            catering: { baseCost: 300, perPerson: true },
            photography: { baseCost: 5000, perPerson: false },
            venue: { baseCost: 10000, perPerson: false },
            decorations: { baseCost: 7000, perPerson: false },
            entertainment: { baseCost: 15000, perPerson: false }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.calculateBudget(); // Calculate on init
    }

    setupEventListeners() {
        const calculateBtn = document.getElementById('calculate');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateBudget());
        }

        // Recalculate when any input changes
        document.getElementById('guests').addEventListener('input', () => this.calculateBudget());
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.calculateBudget());
        });
        
        document.getElementById('event-type').addEventListener('change', () => this.calculateBudget());
    }

    calculateBudget() {
        const guests = parseInt(document.getElementById('guests').value) || 0;
        const eventType = document.getElementById('event-type').value;
        let total = 0;
        const breakdown = [];
        
        // Apply event type multiplier
        let multiplier = 1;
        switch(eventType) {
            case 'wedding': multiplier = 1; break;
            case 'corporate': multiplier = 1; break;
            case 'conference': multiplier = 1; break;
            default: multiplier = 1;
        }
        
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(service => {
            const serviceData = this.services[service.value];
            let cost = serviceData.baseCost;
            
            if (serviceData.perPerson) {
                cost = cost * guests;
            }
            
            // Apply multiplier
            cost = cost * multiplier;
            
            breakdown.push({
                name: this.formatServiceName(service.value),
                cost: Math.round(cost)
            });
            
            total += cost;
        });
        
        this.displayResults(total, breakdown);
    }

    formatServiceName(serviceId) {
        const names = {
            catering: 'Catering',
            photography: 'Photography',
            venue: 'Venue Rental',
            decorations: 'Decorations',
            entertainment: 'Entertainment'
        };
        return names[serviceId] || serviceId;
    }

    displayResults(total, breakdown) {
        document.getElementById('total-cost').textContent = `${Math.round(total)} EGP`;
        
        const breakdownElement = document.getElementById('cost-breakdown');
        breakdownElement.innerHTML = '';
        
        if (breakdown.length === 0) {
            breakdownElement.innerHTML = '<p>Select services to see cost breakdown</p>';
            return;
        }
        
        const breakdownList = document.createElement('ul');
        breakdownList.style.listStyle = 'none';
        breakdownList.style.padding = '0';
        breakdownList.style.margin = '1rem 0';
        
        breakdown.forEach(item => {
            const listItem = document.createElement('li');
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';
            listItem.style.padding = '0.5rem 0';
            listItem.style.borderBottom = '1px solid #eee';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = item.name;
            
            const costSpan = document.createElement('span');
            costSpan.textContent = `${item.cost} EGP`;
            costSpan.style.fontWeight = 'bold';
            
            listItem.appendChild(nameSpan);
            listItem.appendChild(costSpan);
            breakdownList.appendChild(listItem);
        });
        
        breakdownElement.appendChild(breakdownList);
    }
}

// Initialize BudgetCalculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new BudgetCalculator();
});