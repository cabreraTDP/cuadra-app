import TableDisplay from "../../TableDisplay"
import {   options } from '../../../datafake';
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import "../../../CSS/General.css"
const URL = process.env.REACT_APP_URL_URI;

const titlesEmpleados = ['Nombre','RFC','CURP','NSS','Ver'];


const Empleados = () => {

    const [dataEmpleados, setDataEmpleados] = useState([{
        "Nombre": "",
        "RFC": "",
        "CURP": "",
        "NSS": "",
        "Ver": ""
    }]);

    const navigate = useNavigate();

    useEffect(()=>{
        const  getData = async(URL) => {
            const trabajadores = await axios.get(`${URL}/trabajadores`, {withCredentials: true});
            setDataEmpleados(trabajadores.data.data.map((trabajador) => (
                trabajador.datosPersonales ? {
                    "Nombre": `${trabajador.datosPersonales.nombre} ${trabajador.datosPersonales.apellidoPaterno} ${trabajador.datosPersonales.apellidoMaterno}`,
                    "RFC": trabajador.datosPersonales.rfc,
                    "CURP": trabajador.datosPersonales.curp,
                    "NSS": trabajador.datosPersonales.nss,
                    "Ver": trabajador._id
                } :
                {
                    "Nombre": '',
                    "RFC": "",
                    "CURP": "",
                    "NSS": "",
                    "Ver": ""
                }
            )));
        }
        getData(URL).catch(console.error);
        

    },[]);

    return (
        <div >
            <h1>Empleados</h1>
            <TableDisplay
                titles={titlesEmpleados} 
                paginacion={true} 
                rawData={dataEmpleados} 
                options={options} 
                filter={true}
                link={'empleados/editar/'} />
            
            <h2 className="pointer" onClick={() => navigate('/app/bajas')} style={{textAlign: 'center', backgroundColor: 'RGBA(255,255,255,0.2)', padding: '10px'}}>Bajas</h2>
        </div>
    )
}

export default Empleados