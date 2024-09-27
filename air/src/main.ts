import { inject } from "@vercel/analytics"

console.log(inject)

const apiKey = import.meta.env.VITE_AIRVISUAL_API_KEY;
const url = `https://api.airvisual.com/v2/nearest_city?key=${apiKey}`;
const CACHE_DURATION = 3600 * 1000; // 1 hora em milissegundos

function load(data : any) {
  const city = document.querySelector('.city');
  const state = document.querySelector('.state');
  const country = document.querySelector('.country');
  const aqi = document.querySelector('.aqi');
  const description = document.querySelector(".description");
  const status = document.querySelector(".aqi-status");
  
  if (data) {
    if (city) city.textContent = data.city;
    if (state) state.textContent = "Estado: " + data.state;
    if (country) country.textContent = "País: " + data.country;
    if (aqi) aqi.textContent = data.aqi;

    if (description && status) {
      if (data.aqi <= 50) {
        description.textContent = comparable[50];
        status.textContent = 'Satisfatório';
      } else if (data.aqi <= 100 && data.aqi > 50) {
        description.textContent = comparable[100];
        status.textContent = 'Moderado';
      } else if (data.aqi <= 150 && data.aqi > 100) {
        description.textContent = comparable[150];
        status.textContent = 'Não saudável para grupos sensíveis';
      } else if (data.aqi <= 200 && data.aqi > 150) {
        description.textContent = comparable[200];
        status.textContent = 'Extremamente prejudicial à saúde';
      } else if (data.aqi <= 300 && data.aqi > 200) {
        description.textContent = comparable[300];
        status.textContent = 'Muito Pessimo';
      } else {
        description.textContent = comparable[500];
        status.textContent = 'Perigoso';
      }
    }
  }
}

function loadError() {
  const description = document.querySelector(".description");
  if (description) {
    description.textContent = 'Parece que ocorreu um erro';
  }
}

const comparable = {
  50: 'A qualidade do ar é considerada aceitável e a poluição do ar apresenta pouco ou nenhum risco. - Nenhum',
  100: 'A qualidade do ar é aceitável; entretanto, para certos poluentes, pode haver um problema de saúde moderado para um número muito reduzido de pessoas que são incomumente sensíveis à poluição do ar. - Crianças, adultos ativos e indivíduos com condições respiratórias, como asma, devem restringir esforços prolongados ao ar livre.',
  150: 'Membros de grupos vulneráveis podem enfrentar efeitos adversos à saúde. O público em geral provavelmente não será impactado. - Crianças, adultos ativos e pessoas com condições respiratórias, como asma, devem limitar atividades prolongadas ao ar livre.',
  200: 'Todos podem começar a sentir impactos na saúde; membros de grupos vulneráveis podem sofrer consequências mais graves. - Crianças, adultos ativos e pessoas com condições respiratórias, como asma, devem evitar atividades prolongadas ao ar livre; todos os demais, especialmente as crianças, devem restringir esforços prolongados fora de casa.',
  300: 'Avisos de saúde sobre situações de emergência. Toda a população tem maior chance de ser afetada. - Crianças, adultos ativos e pessoas com condições respiratórias, como asma, devem evitar todas as atividades ao ar livre; todos os demais, especialmente as crianças, devem limitar suas atividades externas.',
  500: 'Perigoso - Alerta de saúde: todos podem enfrentar efeitos mais graves à saúde.',
};

async function hasCache() {
  const cachedData = localStorage.getItem('airQuality');
  const cachedTime : number | any = localStorage.getItem('cacheTime');

  if (cachedData && cachedTime) {
    const now = new Date().getTime();
    const cacheAge = now - cachedTime;

    if (cacheAge < CACHE_DURATION) {
      //console.log('Cache válido');
      const data = await JSON.parse(cachedData);
      load(data);
      return;
    } else {
      //console.log('Cache expirado');
      localStorage.removeItem('airQuality');
      localStorage.removeItem('cacheTime');
      getData();
    }
  } else {
    console.log('Nenhum cache disponível');
    getData();
  }
}

async function getData() {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const city = data.data.city;
      const state = data.data.state;
      const country = data.data.country;
      const aqi = data.data.current.pollution.aqius;

      const now = new Date().getTime();
      localStorage.setItem('airQuality', JSON.stringify({ city, state, country, aqi }));
      localStorage.setItem('cacheTime', now.toString());

      load({ city, state, country, aqi });
    })
    .catch(error => {
      console.error('Erro ao buscar os dados:', error);
      loadError();
    });
}

hasCache();
