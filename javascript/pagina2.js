
function getSimulationData() {

    if (window.opener && window.opener.simulationData) {
        return window.opener.simulationData;
    }
   
    if (window.simulationData) {
        return window.simulationData;
    }

    try {
        if (typeof(Storage) !== "undefined" && sessionStorage.getItem('financeSimulation')) {
            return JSON.parse(sessionStorage.getItem('financeSimulation'));
        }
    } catch (e) {
        console.log('Erro ao recuperar dados do sessionStorage');
    }

    return {
        monthlyPayment: 0,
        totalPayment: 0,
        installments: 0,
        bankName: "Nenhum",
        vehicleValue: 0,
        downPayment: 0,
        financedAmount: 0,
        interestRate: 0
    };
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatPercentage(value) {
    return ((value - 1) * 100).toFixed(4) + '%';
}

function displayResults() {
    const data = getSimulationData();

    const valorParcelaMensal = document.querySelector('.valor-parcela-mensal');
    const montanteTotal = document.querySelector('.montante-total');
    const totalParcelas = document.querySelector('.total-parcelas');
    const cabecalhoResultados = document.querySelector('.cabecalho-resultados');

    if (!valorParcelaMensal || !montanteTotal || !totalParcelas) {
        console.error('❌ Elementos da página não encontrados');
        return;
    }

    valorParcelaMensal.textContent = formatCurrency(data.monthlyPayment);
    montanteTotal.textContent = formatCurrency(data.totalPayment);
    totalParcelas.textContent = `* Financiamento em ${data.installments} meses`;

    if (cabecalhoResultados) {
        if (data.monthlyPayment > 0) {
            const totalJuros = data.totalPayment - data.financedAmount;
            const economiaEntrada = data.downPayment;
            
            cabecalhoResultados.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #10b981; margin-bottom: 15px;">✅ Simulação Concluída</h2>
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h3 style="margin-bottom: 15px; color: #1e40af;">📊 Resumo do Financiamento</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left;">
                            <div>
                                <strong>🏦 Banco:</strong> ${data.bankName}<br>
                                <strong>🚗 Valor do Veículo:</strong> ${formatCurrency(data.vehicleValue)}<br>
                                <strong>💰 Entrada (20%):</strong> ${formatCurrency(data.downPayment)}
                            </div>
                            <div>
                                <strong>💳 Valor Financiado:</strong> ${formatCurrency(data.financedAmount)}<br>
                                <strong>📈 Taxa Mensal:</strong> ${data.interestRate ? formatPercentage(data.interestRate) : 'N/A'}<br>
                                <strong>💸 Total de Juros:</strong> ${formatCurrency(totalJuros)}
                            </div>
                        </div>
                    </div>
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <strong>💡 Dica:</strong> Com a entrada de ${formatCurrency(economiaEntrada)}, você economiza nos juros!
                    </div>
                </div>
            `;
        } else {
            cabecalhoResultados.innerHTML = `
                <div style="text-align: center;">
                    <h2 style="color: #ef4444;">⚠️ Nenhuma simulação encontrada</h2>
                    <p style="margin: 15px 0;">Retorne ao simulador para calcular seu financiamento.</p>
                    <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
                        <strong>📝 Como usar:</strong> Preencha o valor do veículo, escolha um banco e selecione o prazo desejado.
                    </div>
                </div>
            `;
        }
    }

    // Adicionar efeitos visuais
    addVisualEffects(data);
}


function addVisualEffects(data) {
    // Animação para os valores principais
    const valorElements = document.querySelectorAll('.valor-parcela-mensal, .montante-total');
    valorElements.forEach(element => {
        if (data.monthlyPayment > 0) {
            element.style.color = '#10b981';
            element.style.textShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
            
            // Efeito de pulse
            element.style.animation = 'pulse 2s infinite';
        }
    });

    // Adiciona CSS para animação
    if (!document.querySelector('#result-animations')) {
        const style = document.createElement('style');
        style.id = 'result-animations';
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .card-resultado {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .card-resultado:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }
}

function voltarSimulador() {

    clearSimulationData();
    

    if (window.opener) {
        window.close();
    } else {
        window.location.href = '../index.html';
    }
}

function refazerSimulacao() {
    clearSimulationData();

    resetDisplay();

    displayResults();
    
    alert('🔄 Simulação resetada! Retorne ao simulador para fazer uma nova simulação.');
}

function clearSimulationData() {

    if (window.simulationData) {
        delete window.simulationData;
    }
    
    if (window.opener && window.opener.simulationData) {
        delete window.opener.simulationData;
    }

    try {
        if (typeof(Storage) !== "undefined") {
            sessionStorage.removeItem('financeSimulation');
        }
    } catch (e) {
        console.log('Erro ao limpar sessionStorage');
    }
}

function resetDisplay() {
    const valorParcelaMensal = document.querySelector('.valor-parcela-mensal');
    const montanteTotal = document.querySelector('.montante-total');
    const totalParcelas = document.querySelector('.total-parcelas');
    const cabecalhoResultados = document.querySelector('.cabecalho-resultados');

    if (valorParcelaMensal) {
        valorParcelaMensal.textContent = 'R$ 0,00';
        valorParcelaMensal.style.color = '';
        valorParcelaMensal.style.textShadow = '';
        valorParcelaMensal.style.animation = '';
    }
    
    if (montanteTotal) {
        montanteTotal.textContent = 'R$ 0,00';
        montanteTotal.style.color = '';
        montanteTotal.style.textShadow = '';
        montanteTotal.style.animation = '';
    }
    
    if (totalParcelas) {
        totalParcelas.textContent = '* Financiamento em 0 meses';
    }
    
    if (cabecalhoResultados) {
        cabecalhoResultados.innerHTML = '';
    }
}

function shareResults() {
    const data = getSimulationData();
    
    if (data.monthlyPayment > 0) {
        const shareText = `🚗 Simulação de Financiamento
💰 Parcela: ${formatCurrency(data.monthlyPayment)}
🏦 Banco: ${data.bankName}
📅 ${data.installments} meses
💳 Total: ${formatCurrency(data.totalPayment)}`;

        if (navigator.share) {
            navigator.share({
                title: 'Simulação de Financiamento',
                text: shareText,
            });
        } else {

            navigator.clipboard.writeText(shareText).then(() => {
                alert('📋 Resultados copiados para a área de transferência!');
            }).catch(() => {
                alert('❌ Não foi possível copiar os resultados.');
            });
        }
    }
}

function printResults() {
    window.print();
}

function initializeEventListeners() {
    // Botão "Voltar ao simulador"
    const botaoVoltar = document.querySelector('.refazer-simulacao');
    if (botaoVoltar) {
        botaoVoltar.addEventListener('click', voltarSimulador);
    }

    // Botão flutuante
    const botaoFlutuante = document.querySelector('.botao-flutuante');
    if (botaoFlutuante) {
        botaoFlutuante.style.cursor = 'pointer';
        botaoFlutuante.title = 'Nova simulação';
        botaoFlutuante.addEventListener('click', refazerSimulacao);
    }

    // Logo da empresa
    const logoEmpresa = document.querySelector('.marca-empresa img');
    if (logoEmpresa) {
        logoEmpresa.style.cursor = 'pointer';
        logoEmpresa.title = 'Voltar ao início';
        logoEmpresa.addEventListener('click', voltarSimulador);
    }

    // Atalhos do teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            voltarSimulador();
        } else if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            printResults();
        } else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            shareResults();
        }
    });
}

//