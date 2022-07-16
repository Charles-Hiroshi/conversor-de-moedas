const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector(
  '[data-js="conversion-precision"]'
)
const timesCurrencyOneEl = document.querySelector(
  '[data-js="currency-one-times"]'
)

const showAlert = err => {
  const div = document.createElement('div')
  const button = document.createElement('button')
  div.textContent = err.message
  div.setAttribute('role', 'alert')
  div.classList.add(
    'alert',
    'alert-warning',
    'alert-dismissible',
    'fade',
    'show'
  )
  button.classList.add('btn-close')
  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'Close')

  const removeAlert = () => div.remove()
  button.addEventListener('click', removeAlert)

  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterend', div)
}

const state = (() => {
  let exchangeRate = {}
  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if (!newExchangeRate.conversion_rates) {
        showAlert({
          message: 'O Objeto precisa ter uma propriedade conversion=rates'
        })
        return
      }
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()

const APIKey = 'ffb53dbd82fdb037ee3453ba'
const getUrl = currency =>
  `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}`

const getErrorMessage = errorType =>
  ({
    'unsupported-code': 'A moeda não existe em nosso Banco de Dados',
    'malformed-request':
      'O Endpoint do Request deve seguir este tipo de estrutura: https://v6.exchangerate-api.com/v6/ffb53dbd82fdb037ee3453ba/latest/USD',
    'invalid-key': 'A sua chave API não é válida.',
    'inactive-account': 'Seu endereço de e-mail não foi confirmado.',
    'plan-upgrade-requerid': 'Seu plano não suporta este tipo de Request',
    'base-code-only-on-pro': 'Seu plano não suporta outra base de moedas',
    'quota-reached':
      'Sua conta atingiu o número de solicitações permitidas pelo seu plano.'
  }[errorType] || 'Não foi possível obter as informações')

const fetchExchangeRate = async url => {
  try {
    const response = await fetch(url)
    /* if (!response.ok) {
      throw new Error(
        'Sua conexão falhou! Não foi possível obter as informações'
      )
    }*/
    const exchangeRateData = await response.json()
    if (exchangeRateData.result === 'error') {
      const errorMessage = getErrorMessage(exchangeRateData['error-type'])
      throw new Error(errorMessage)
    }
    return state.setExchangeRate(exchangeRateData)
  } catch (err) {
    showAlert(err)
  }
}
const getOptions = (selectedCurrency, conversion_rates) => {
  const setSelectedAttribute = currency =>
    currency === selectedCurrency ? 'selected' : ''
  const getOptionAsArray = currency =>
    `<option ${setSelectedAttribute(currency)}>${currency}</option>`
  return Object.keys(conversion_rates).map(getOptionAsArray).join('')
}

const getMultipliedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return (timesCurrencyOneEl.value * currencyTwo).toFixed(2)
}

const getNotRoundedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return `1 ${currencyOneEl.value} = ${1 * currencyTwo} ${currencyTwoEl.value}`
}

const showUpdatedRates = ({ conversion_rates }) => {
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
  valuePrecisionEl.textContent = getNotRoundedExchangeRate(conversion_rates)
}

const showInitialInfo = ({ conversion_rates }) => {
  currencyOneEl.innerHTML = getOptions('USD', conversion_rates)
  currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates)

  showUpdatedRates({ conversion_rates })
}

const init = async () => {
  const url = getUrl('USD')
  const exchangeRate = await fetchExchangeRate(url)

  if (exchangeRate && exchangeRate.conversion_rates) {
    showInitialInfo(exchangeRate)
  }
}

const handleTimesCurrencyOneElImput = () => {
  const { conversion_rates } = state.getExchangeRate()
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
}

const handleCurrencyTwoElInput = () => {
  const exchangeRate = state.getExchangeRate()
  showUpdatedRates(exchangeRate)
}

const handleCurrencyOneElInput = async e => {
  const url = getUrl(e.target.value)
  const exchangeRate = await fetchExchangeRate(url)
  showUpdatedRates(exchangeRate)
}

timesCurrencyOneEl.addEventListener('input', handleTimesCurrencyOneElImput)
currencyTwoEl.addEventListener('input', handleCurrencyTwoElInput)
currencyOneEl.addEventListener('input', handleCurrencyOneElInput)

init()
