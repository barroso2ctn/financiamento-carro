
const bankRates = {
    "caixa": { rate: 1.0487, name: "Caixa" },
    "santander": { rate: 1.0567, name: "Santander" },
    "bradesco": { rate: 1.0532, name: "Bradesco" },
    "itau": { rate: 1.0519, name: "Itaú" },
    "nubank": { rate: 1.0595, name: "Nubank" },
    "inter": { rate: 1.0602, name: "Inter" }
};

const DEFAULT_DOWN_PAYMENT_PERCENT = 0.2;

function formatarCampo(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    value = parseFloat(value) / 100;
    input.value = value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function parseFormattedValue(value) {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

function showError(message) {
    alert(`❌ Erro: ${message}`);
}

function showSuccess(message) {
    alert(`✅ Sucesso: ${message}`);
}


function validateFields() {
    const vehicleValue = document.getElementById('valorFinanciamento').value.trim();
    const bank = document.getElementById('instituicaoBancaria').value;
    const installments = document.getElementById('prazoMeses').value;

    if (!vehicleValue) {
        showError('Por favor, preencha o valor do financiamento.');
        return false;
    }

    if (!bank) {
        showError('Por favor, selecione um banco.');
        return false;
    }

    if (!installments) {
        showError('Por favor, selecione o número de parcelas.');
        return false;
    }

    const vehicleAmount = parseFormattedValue(vehicleValue);

    if (vehicleAmount <= 0) {
        showError('O valor do financiamento deve ser maior que zero.');
        return false;
    }

    if (vehicleAmount < 1000) {
        showError('O valor mínimo para financiamento é R$ 1.000,00.');
        return false;
    }

    return true;
}


function calculateFinancing() {
    const vehicleValue = parseFormattedValue(document.getElementById('valorFinanciamento').value);
    const bankKey = document.getElementById('instituicaoBancaria').value;
    const installments = parseInt(document.getElementById('prazoMeses').value);
    
    const bankData = bankRates[bankKey];
    const rate = bankData.rate;

    // Entrada de 20% do valor do veículo
    const downPayment = vehicleValue * DEFAULT_DOWN_PAYMENT_PERCENT;
    const financedAmount = vehicleValue - downPayment;
    
    // Cálculo com juros 
    const monthlyRate = (rate - 1) / 100; 
    const totalWithInterest = financedAmount * Math.pow((1 + monthlyRate), installments);
    const monthlyPayment = totalWithInterest / installments;

    return {
        monthlyPayment: monthlyPayment,
        totalPayment: totalWithInterest,
        installments: installments,
        bankName: bankData.name,
        vehicleValue: vehicleValue,
        downPayment: downPayment,
        financedAmount: financedAmount,
        interestRate: rate
    };
}


function saveSimulationData(data) {

    window.simulationData = data;
    

    try {
        if (typeof(Storage) !== "undefined") {
            sessionStorage.setItem('financeSimulation', JSON.stringify(data));
        }
    } catch (e) {
        console.log('SessionStorage não disponível');
    }
}

function redirectToResults() {
    
    setTimeout(() => {
        const newWindow = window.open('pages/result.html', '_blank');
        if (!newWindow) {
           
            window.location.href = 'pages/result.html';
        }
    }, 1500);
}


function initializeEventListeners() {
    
    const vehicleValueInput = document.getElementById('valorFinanciamento');
    if (vehicleValueInput) {
        vehicleValueInput.addEventListener('input', function() {
            formatarCampo(this);
        });

        // Placeholder dinâmico
        vehicleValueInput.addEventListener('focus', function() {
            if (this.value === '') {
                this.placeholder = 'Digite o valor...';
            }
        });

        vehicleValueInput.addEventListener('blur', function() {
            this.placeholder = 'R$ 0,00';
        });
    }

    // Submissão do formulário
    const form = document.getElementById('financeForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateFields()) {
                const results = calculateFinancing();
                saveSimulationData(results);
                
                showSuccess(`Simulação realizada! Banco: ${results.bankName} | Parcela: ${results.monthlyPayment.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`);
                
                redirectToResults();
            }
        });
    }

    // Link "Ver página de resultados"
    const linkResultado = document.querySelector('.link-resultado');
    if (linkResultado) {
        linkResultado.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (validateFields()) {
                const results = calculateFinancing();
                saveSimulationData(results);
                
                const newWindow = window.open('pages/result.html', '_blank');
                if (!newWindow) {
                    window.location.href = 'pages/result.html';
                }
            } else {
                showError('Preencha todos os campos antes de ver os resultados.');
            }
        });
    }

    
    addFieldHints();
}


function addFieldHints() {
    
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            this.style.color = '#000';
        });
    });

    
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#10b981';
            }
        });

        field.addEventListener('focus', function() {
            this.style.borderColor = '#3b82f6';
        });
    });
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Simulador de Financiamento iniciado');
    initializeEventListeners();
    
    // Verificar se há dados anteriores
    try {
        if (typeof(Storage) !== "undefined" && sessionStorage.getItem('financeSimulation')) {
            const previousData = JSON.parse(sessionStorage.getItem('financeSimulation'));
            if (previousData && confirm('Há uma simulação anterior. Deseja continuar de onde parou?')) {
                // Preencher campos com dados anteriores
                document.getElementById('valorFinanciamento').value = previousData.vehicleValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
                // Encontrar e selecionar o banco correspondente
                for (let [key, value] of Object.entries(bankRates)) {
                    if (value.name === previousData.bankName) {
                        document.getElementById('instituicaoBancaria').value = key;
                        break;
                    }
                }
                document.getElementById('prazoMeses').value = previousData.installments;
            }
        }
    } catch (e) {
        console.log('Não foi possível recuperar dados anteriores');
    }
});