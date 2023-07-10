import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineElement,
  PointElement,
  BarElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';

import axios from 'axios';

import { useEffect, useState } from 'react';
import moment from 'moment';

const URL = process.env.REACT_APP_URL_URI;


ChartJS.register(
  CategoryScale,
  BarElement,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};



const getMonth = (fecha) => {
  return Number(moment(fecha).month()) + 1
}

const aggregation = (registro, aggregated) => {
  if(registro.mes in Object.keys(aggregated)){
    aggregated[registro.mes] = aggregated[registro.mes] + registro.monto
  }else{
    aggregated[registro.mes] = registro.monto
  }
  return aggregated
}

const aggregateByMonth = (registros) => {
  let final = {}
  registros.map((registro) => aggregation(registro,final))
  const months = [...Array(12).keys()].map(x => x++)
  months.map((month) => final[month] ? final[month] = final[month] : final[month] = 0)
  return final
}

const agregarPorMes = (registros, concepto) => {
  const filtered = registros.filter((operacion) => operacion.tipo === concepto);
  const month = filtered.map((operacion) => (
    {
      monto: operacion.monto, 
      mes: getMonth(operacion.fechaOperacion)
    }
  ))
  const aggregated = aggregateByMonth(month)
  return Object.values(aggregated)
}

const Home = () => {
  const [data, setData] = useState([]);
  const [gastos,setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre','Noviembre', 'Diciembre'];
  const datos = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Ingresos',
        data: ingresos,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        fill: true,
        label: 'Gastos',
        data: gastos,
        borderColor: 'rgb(235, 0, 53)',
        backgroundColor: 'rgba(235, 0, 53, 0.5)',
      },
    ],
  };

  const empresa = localStorage.getItem('idEmpresa')

  useEffect(() => {
    const getData = async (URL) => {
        //Ajustar Dirección y obj json de contabilidad ya que cuenta con información de la tabla trabajadores
        //const registros = await axios.post(`${URL}/contabilidad/operacionesEmpresa`, { empresa }, { withCredentials: true });
        const registros = await axios.get(`${URL}/contabilidad/operaciones`, { withCredentials: true });
        setData(registros.data.data)
        setIngresos(agregarPorMes(registros.data.data,"Ingreso"))
        setGastos(agregarPorMes(registros.data.data,"Gasto"))
    }
    getData(URL).catch(console.error);
},[]);

  return (
    <div>
      <div style={{ width: '45%', height: '350px', float:'left', marginTop: '50px', marginRight: '100px' }}>
        <Line options={options} data={datos} />
      </div>
      <div style={{ width: '45%', height: '350px', float:'left', marginTop: '50px' }}>
        <Bar options={options} data={datos} />
      </div>
    </div>
  )
}

export default Home
