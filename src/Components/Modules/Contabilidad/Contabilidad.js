import { useState, useEffect } from 'react'
import React from 'react'
import TableDisplay from '../../TableDisplay'
import axios from 'axios'
import '../../../CSS/Contabilidad.css'
import { Post } from '../../../utils/axiosUtils'
import { numberToCurrency } from '../../../utils/format'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { Modal } from '../../Modal'
import { Buttom } from '../../Buttom'
import PlusIcon from '../../../svg/plus.svg'
import UploadIcon from '../../../svg/upload.svg'
import DownloadIcon from '../../../svg/download.svg'
import AnalysisIcon from '../../../svg/analysis.svg'



const XLSX = require('xlsx')
const URL = process.env.REACT_APP_URL_URI

const transformarDatos = (datos) => {
  const nuevos = datos.map((registro) =>
    registro
      ? {
          Tipo: registro.tipo ? registro.tipo : '',
          Categoría: registro.categoria ? registro.categoria : '',
          Titulo: registro.titulo ? registro.titulo : '',
          Descripción: registro.descripcion ? registro.descripcion : '',
          Monto: registro.monto ? numberToCurrency(registro.monto) : '',
          'Fecha Operación': registro.fechaOperacion
            ? moment(registro.fechaOperacion).format('DD-MM-YYYY')
            : '',
          Editar: registro,
        }
      : {
          'Fecha Captura': '',
          Categoría: '',
          Tipo: '',
          Titulo: '',
          Monto: '',
          'Fecha Operación': '',
          Descripción: '',
          Editar: '',
        }
  )
  return nuevos
}

const titlesTablaContabilidad = [
  'Tipo',
  'Categoría',
  'Titulo',
  'Descripción',
  'Monto',
  'Fecha Operación',
  'Editar',
]

const Contabilidad = () => {
  const [dataContabilidad, setDataContabilidad] = useState([])
  const [dataFiltered, setDataFiltered] = useState([])

  const [AñadirArchivo, setAñadirArchivo] = useState(false)

  const CancelarArchivoSAT = () => setAñadirArchivo(false)
  const AgregarArchivoSAT = () => setAñadirArchivo(true)

  const [NuevoRegistro, setNuevoRegistro] = useState(false)

  const CrearNuevoRegistro = () => setNuevoRegistro(true)

  const [editarRegistro, setEditarRegistro] = useState(false)
  const EditarRegistro = () => setEditarRegistro(true)
  const [registroEnEdicion, setRegistroEnEdicion] = useState({})

  const [archivo, setArchivo] = useState()
  const [tipoArchivo, setTipoArchivo] = useState("emitida")
  const [datosOperacion, setDatosOperacion] = useState({})

  const [filtroMes, setFiltroMes] = useState('all')

  const funcionFiltroMes = (e) => {
    setFiltroMes(e.target.value)
  }

  const onSubmitOperacion = async (e) => {
    e.preventDefault()
    const nuevosDatos = await Post('/contabilidad/crear', datosOperacion)
    setDataContabilidad([
      ...dataContabilidad,
      ...transformarDatos([nuevosDatos.data.data]),
    ])
    setNuevoRegistro(false)
  }

  const exportarExcel = () => {
    const workBook = XLSX.utils.book_new()
    const workSheet = XLSX.utils.json_to_sheet(dataFiltered)
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Nómina')
    const fecha = new Date()
    const hoy = fecha.toDateString()
    XLSX.writeFile(workBook, hoy + '.xlsx')
  }

  const onChangeOperacion = async (e) => {
    const { name, value } = e.target
    setDatosOperacion({
      ...datosOperacion,
      [name]: value,
    })
  }

  const onChangeTipoArchivo = async (e) => {
    setTipoArchivo(e.target.value)
  }
  const changeFile = (e) => {
    setArchivo(e)
  }

  const onSubmitHandlerDocumento = async (e) => {
    e.preventDefault()
    const f = new FormData()
    f.append('file', archivo[0])
    f.append('tipo', tipoArchivo)
    const nuevosDatos = await axios.post(`${URL}/contabilidad/sat`, f, {
      withCredentials: true,
    })
    setDataContabilidad([
      ...dataContabilidad,
      ...transformarDatos(nuevosDatos.data.data),
    ])
    CancelarArchivoSAT(false)
  }

  const onButtonFunction = (value) => {
    EditarRegistro()
    setRegistroEnEdicion(value)
  }

  const onSubmitEditar = async (e) => {
    e.preventDefault()
    const nuevosDatos = await Post('/contabilidad/editar', registroEnEdicion)
    setDataContabilidad([
      ...dataContabilidad.filter(
        (operacion) => operacion.Editar._id !== registroEnEdicion._id
      ),
      ...transformarDatos([nuevosDatos.data.data]),
    ])
    setEditarRegistro(false)
  }

  const onChangeEditar = async (e) => {
    const { name, value } = e.target
    setRegistroEnEdicion({
      ...registroEnEdicion,
      [name]: value,
    })
  }

  const onDeleteOperacion = async (id) => {
    await axios.post(
      `${URL}/contabilidad/eliminar`,
      { id },
      { withCredentials: true }
    )
    setDataContabilidad(
      dataContabilidad.filter((operacion) => operacion.Editar._id !== id)
    )
    setEditarRegistro(false)
  }
  const empresa = localStorage.getItem('idEmpresa')

  useEffect(() => {

    const getData = async (URL) => {
      //Ajustar Dirección y obj json de contabilidad ya que cuenta con información de la tabla trabajadores
      //const empresa = '645dadb2904b1706868bf164'
      //const {isSignedIn} =  store.getState().auth.isSignedIn
      const registros = await axios.post(
        `${URL}/contabilidad/operacionesEmpresa`, 
        { empresa }, 
        { withCredentials: true }
      )
      const datos = transformarDatos(registros.data.data)
      if (registros.data.data.length > 0) {
        setDataContabilidad(datos)
        setDataFiltered(datos)
      }
    }
    getData(URL).catch(console.error)
  }, [empresa])

  useEffect(() => {
    if (filtroMes === 'all') {
      setDataFiltered(dataContabilidad)
    } else {
      setDataFiltered(
        dataContabilidad.filter(
          (operacion) =>
            moment(operacion['Fecha Operación'], 'DD-MM-YYYY').month() + 1 ===
            Number(filtroMes)
        )
      )
    }
  }, [dataContabilidad, filtroMes])

  return (
    <div>
      <h1>Contabilidad</h1>
      <div id="buscadorOpcion">
        <div id="filtroOpcion">
          <h3>Filtro:</h3>
          <select
            style={{ marginTop: '17px', marginLeft: '0px', backgroundColor: 'white', border: '1px solid black',
                     height: '30px', width: '200px', borderRadius: '30px', padding: '4px', textAlign: 'center' }}
            value={filtroMes}
            onChange={(e) => funcionFiltroMes(e)}
          >
            <option selected value="all">
              Todos los meses...
            </option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>
        <div style={{ width: '100%' }}></div>
        <div id="opciones">
          <div id="opcion">
            <img alt="None" src={PlusIcon} onClick={CrearNuevoRegistro} style={{ margin:"auto", width:35,height:35}}>
            </img>
            <div onClick={CrearNuevoRegistro} >Añadir Registro</div>
          </div>
          <div id="opcion">
            <img  alt="None" src={UploadIcon} onClick={AgregarArchivoSAT} style={{ margin:"auto", width:35,height:35}}></img>
            <div onClick={AgregarArchivoSAT}>Subir pdf sat</div>
          </div>
          <div id="opcion">
            <img alt="None" src={AnalysisIcon} style={{margin:"auto",width:35,height:35}}></img>
            <Link
              to="analisis"
              style={{ textDecoration: 'none'}}>
              <div id="opcion">Análisis</div>
            </Link>
          </div>
          <div id="opcion">
            <img onClick={() => exportarExcel()} alt="None" src={DownloadIcon} style={{ margin:"auto",width:35,height:35}}></img>
            <div onClick={() => exportarExcel()}>Exportar a Excel</div>
          </div>
        </div>
      </div>

      <TableDisplay
        titles={titlesTablaContabilidad}
        rawData={dataFiltered}
        link={'contabilidad/'}
        type={'button'}
        buttonFunction={onButtonFunction}
        paginacion={true}
      />

      {/* SUBIR PDF SAT */}
      <Modal
        title="Subir PDF SAT"
        open={AñadirArchivo}
        setOpen={setAñadirArchivo}
      >
        <form onSubmit={onSubmitHandlerDocumento}>
          <label>Tipo de Documento:</label>
          <select
            style={{...styles.input, marginTop: '5px'}}
            name="tipo"
            onChange={(e) => onChangeTipoArchivo(e)}
            required
          >
            <option value="emitida" selected="selected">
              Facturas Emitidas
            </option>
            <option value="recibida">Facturas Recibidas</option>
            <option value="impuestos">ISR & IVA</option>

            <option value="social">IMSS - Infonavit</option>
          </select>

          <input
            type="file"
            name="file"
            style={{ width: '100%', marginTop: '20px' }}
            onChange={(e) => changeFile(e.target.files)}
            accept="application/pdf"
            required
          />
          <Buttom
            type="submit"
            style={{ width: '100%', marginTop: '20px' }}
            title="Subir Documento"
          />
        </form>
      </Modal>

      {/*NUEVO REGISTRO */}
      <Modal
        title="Nuevo Registro"
        open={NuevoRegistro}
        setOpen={setNuevoRegistro}
      >
        <form onSubmit={onSubmitOperacion}>
          <label>Tipo:</label>
          <select
            style={styles.input}
            name="tipo"
            onChange={(e) => onChangeOperacion(e)}
            required
          >
            <option value="Ingreso" selected="selected">
              Ingreso
            </option>
            <option value="Gasto">Gasto</option>
          </select>

          <label>Categoría:</label>
          <select
            style={{...styles.input, }}
            
            name="categoria"
            onChange={(e) => onChangeOperacion(e)}
            required
          >
            <option value="Ventas" selected="selected">
              Ventas
            </option>
            <option value="Sueldos">Sueldos</option>
          </select>

          <label>Título:</label>
          <input
            type="text"
            name="titulo"
            style={styles.input}
            onChange={(e) => onChangeOperacion(e)}
            required
          />

          <label>Descripción:</label>
          <input
            type="text"
            name="descripcion"
            style={styles.input}
            onChange={(e) => onChangeOperacion(e)}
            required
          />

          <label>Monto:</label>
          <input
            type="number"
            name="monto"
            style={styles.input}
            onChange={(e) => onChangeOperacion(e)}
            required
          />

          <label>Fecha Operación:</label>
          <input
            type="date"
            name="fechaOperacion"
            style={styles.input}
            onChange={(e) => onChangeOperacion(e)}
            required
          />
          <Buttom title="Agregar Registro" style={{width:'100%'}} className="btn-btn" />
        </form>
      </Modal>

      {/*EDITAR TRANSACCIÓN */}
      <Modal
        open={editarRegistro}
        setOpen={setEditarRegistro}
        title={'Editar Regisro'}
        backdrop="static"
        keyboard={false}
      >
        <form onSubmit={onSubmitEditar}>
          <label>Tipo:</label>
          <select
            style={styles.input}
            value={registroEnEdicion.tipo}
            name="tipo"
            onChange={(e) => onChangeEditar(e)}
            required
          >
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
          </select>

          <label>Categoría:</label>
          <select
            style={styles.input}
            value={registroEnEdicion.categoria}
            name="categoria"
            onChange={(e) => onChangeEditar(e)}
            required
          >
            <option value="Ventas">Ventas</option>
            <option value="Sueldos">Sueldos</option>
          </select>

          <label>Título:</label>
          <input
            type="text"
            name="titulo"
            value={registroEnEdicion.titulo}
            style={styles.input}
            onChange={(e) => onChangeEditar(e)}
            required
          />

          <label>Descripción:</label>
          <input
            type="text"
            name="descripcion"
            value={registroEnEdicion.descripcion}
            style={styles.input}
            onChange={(e) => onChangeEditar(e)}
            required
          />

          <label>Monto:</label>
          <input
            type="number"
            name="monto"
            value={registroEnEdicion.monto}
            style={styles.input}
            onChange={(e) => onChangeEditar(e)}
            required
          />

          <label>Fecha Operación:</label>
          <input
            type="date"
            name="fechaOperacion"
            value={moment(registroEnEdicion.fechaOperacion).format(
              'YYYY-MM-DD'
            )}
            style={styles.input}
            onChange={(e) => onChangeEditar(e)}
            required
          />

          <Buttom  type="submit" title='Actualizar Registro' style={{ marginTop: 10, width: '100%' }} />
          <Buttom type="submit" title='Borrar Registro'
                  style={{ marginTop: 10, width: '100%', backgroundColor: 'red' }}
            onClick={() => onDeleteOperacion(registroEnEdicion._id)}
          />
        </form>
      </Modal>
    </div>
  )
}
export default Contabilidad

const styles = {
  input: {
    width: '100%',
    marginBottom: 15,
    border: '1px black solid',
    height: 35,
    padding: 2,
  },
}
