import '../../../CSS/analisis.css'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { currencyToNumber, numberToCurrency } from '../../../utils/format';
import moment from 'moment';
import TitleCard from '../../Utils/Cards';
import Stats from '../../Utils/Stats';
import Chart from '../../Utils/Chart';

import TopSideButtons from '../../Utils/TopSideButtons';

const URL = process.env.REACT_APP_URL_URI;

const calcularTotal = (registros) => {
    const ingreso = calcularIngresos(registros.filter((operacion) => operacion.tipo === "Ingreso"));
    const gasto = calcularGastos(registros.filter((operacion) => operacion.tipo === "Gasto"));
    return ({
        ingresos:ingreso,
        gastos:gasto
    })
};

const dateFormat = "YYYY-MM-DD"

const calcularIngresos = (ingresos) => {
    let initial = 0;
    const total = numberToCurrency(ingresos.reduce((prev,current)=> prev+current.monto,initial));
    const ventas = numberToCurrency(ingresos.filter((operacion) => operacion.categoria === "Ventas").reduce((prev,current)=> prev+current.monto,initial));
    const resultado = {
        ventas,
        total
    }
    return resultado
};

const calcularGastos = (gastos) => {
    let initial = 0;
    const total = numberToCurrency(gastos.reduce((prev,current)=> prev+current.monto,initial));
    const impuestos = numberToCurrency(gastos.filter((operacion) => operacion.categoria === "Impuestos").reduce((prev,current)=> prev+current.monto,initial));
    const sueldos = numberToCurrency(gastos.filter((operacion) => operacion.categoria === "Sueldos").reduce((prev,current)=> prev+current.monto,initial));

    const resultado = {
        impuestos,
        sueldos,
        total
    }
    return resultado
};

const agruparDatosParaGrafica = (operaciones,filter) => {
    const labelsMonths = [ ...Array(12).keys() ].map( i => i+1);
    const labelsDays = [ ...Array(31).keys() ].map( i => i+1);
    const ingreso = operaciones.filter(operacion => operacion.tipo === "Ingreso")
    const gasto = operaciones.filter(operacion => operacion.tipo === "Gasto")

    const ingresos = []
    const gastos = []

    if(filter === "all"){
        for(const month in labelsMonths){
            let initial = 0;
            ingresos.push(ingreso.filter(operacion => moment(operacion.fechaOperacion,dateFormat).month() === parseInt(month)).reduce((prev,current)=> prev+current.monto,initial));
            gastos.push(gasto.filter(operacion => moment(operacion.fechaOperacion,dateFormat).month() === parseInt(month)).reduce((prev,current)=> prev+current.monto,initial));
        }
    }else{
        for(const day in labelsDays){
            let initial = 0;
            ingresos.push(ingreso.filter(operacion => moment(operacion.fechaOperacion,dateFormat).date() === parseInt(day)).reduce((prev,current)=> prev+current.monto,initial));
            gastos.push(gasto.filter(operacion => moment(operacion.fechaOperacion,dateFormat).date() === parseInt(day)).reduce((prev,current)=> prev+current.monto,initial));
        }
    }


    return({
        "ingresos": ingresos,
        "gastos": gastos
    })
};

const Analisis = () => {

    const monthToNumber = {
        "Enero": 1,
        "Febrero": 2,
        "Marzo": 3,
        "Abril": 4,
        "Mayo": 5,
        "Junio": 6,
        "Julio": 7,
        "Agosto": 8,
        "Septiembre": 9,
        "Octubre": 10,
        "Noviembre": 11,
        "Diciembre": 12,
    }

    const [utilidad, setUtilidad] = useState(0);

    const [data, setData] = useState([]);
    const [dataGraph, setDataGraph] = useState([]);

    const [dataFiltered, setDataFiltered] = useState({
        ingresos:{},
        gastos:{}
    });

    const [filtroMes, setFiltroMes] = useState("all")

    useEffect(() => {
        const getData = async (URL) => {
            //Ajustar Dirección y obj json de contabilidad ya que cuenta con información de la tabla trabajadores
            const registros = await axios.get(`${URL}/contabilidad/operaciones`, { withCredentials: true });
            setData(registros.data.data)
            setDataFiltered(calcularTotal(registros.data.data))
        }
        getData(URL).catch(console.error);
    },[]);

    useEffect(() => {
        if(filtroMes==='all'){
            setDataFiltered(calcularTotal(data))
            setDataGraph(agruparDatosParaGrafica(data,"all"))
        }else{
            setDataFiltered(calcularTotal(data.filter((operacion) => moment(operacion.fechaOperacion,dateFormat).month()+1 === filtroMes)));
            setDataGraph(agruparDatosParaGrafica(data.filter((operacion) => moment(operacion.fechaOperacion,dateFormat).month()+1 === filtroMes),""))
        };
    }, [data,filtroMes]);

    useEffect(()=>{
        if(dataFiltered.ingresos.total && dataFiltered.gastos.total){
            setUtilidad(numberToCurrency(currencyToNumber(dataFiltered.ingresos.total)-currencyToNumber(dataFiltered.gastos.total)));
        }
    },[utilidad,dataFiltered])


    const removeFilter = () => {
        setFiltroMes("all")
    }

    const applyFilter = (params) => {
        setFiltroMes(monthToNumber[params])
    }

    const statsData = [
        {title : "Ingresos", value : dataFiltered.ingresos.total, background:"green"},
        {title : "Gastos", value : dataFiltered.gastos.total, background:"red"},
        {title : "Ganancias", value :utilidad, background:"gray"},
    ]

    return (
        <div >
            <TitleCard title="Analisis financiero" topMargin="mt-6"  style={{backgroundcolor:"black"}} TopSideButtons={<TopSideButtons  applyFilter={applyFilter} removeFilter={removeFilter}/>}>         
                <div className="grid lg:grid-cols-3 mt-6 md:grid-cols-2 grid-cols-1 gap-6">
                    {
                        statsData.map((d, k) => {
                            return (
                                <Stats key={k} {...d} colorIndex={k}/>
                            )
                        })
                    }
                </div>

                <div className="grid lg:grid-cols-1 mt-6 md:grid-cols-1 grid-cols-1 gap-6" >
                    <Chart filter={filtroMes} data={dataGraph}/>
                </div>
            </TitleCard>
            
        </div>
    )
}
export default Analisis;
