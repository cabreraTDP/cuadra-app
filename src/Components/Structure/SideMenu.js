import '../../CSS/sideMenu.css'
import { useState } from 'react';
import { Link } from "react-router-dom";
import HomeIcon from '../../svg/logoicon.svg'
import EmpleadoIcon from '../../svg/user.svg'
import NominaIcon from '../../svg/check.svg'
import ContabilidadIcon from '../../svg/calculator.svg'

const SideMenu = () => {
    const [isMenuShown, setIsMenuShown] = useState(false)
    /* Set the width of the side navigation to 250px */
    function openNav() {
        setIsMenuShown(true)
    }
    /* Set the width of the side navigation to 0 */
    function closeNav() {
        setIsMenuShown(false)
    }

    return (
        <div className="container">
            <div id="mySidenav" style={{ width: isMenuShown ? '200%' : '100%' }} className="sidenav" onMouseEnter={openNav} onMouseLeave={closeNav}>
                <table>
                    {isMenuShown ?
                        <tbody>
                            <tr>
                                <td><Link to="home"><img alt="None" src={HomeIcon} style={{width:40, height:40, marginLeft: 30,marginRight:5, marginTop:20}}></img><span>Inicio</span></Link></td>
                            </tr>
                            <tr>
                                <td><Link to="empleados"><img  alt="None" src={EmpleadoIcon} style={{width:40, height:40, marginLeft: 30,marginRight:5, marginTop:20}}></img><span>Empleados</span></Link></td>
                            </tr>
                            <tr>
                                <td><Link to="nominas"><img alt="None" src={NominaIcon} style={{width:40, height:40, marginLeft: 30,marginRight:5, marginTop:20}}></img><span>Nominas</span></Link></td>
                            </tr>
                            <tr>
                                <td><Link to="contabilidad"><img alt="None" src={ContabilidadIcon} style={{width:40, height:40, marginLeft: 30,marginRight:5, marginTop:20}}></img><span>Contabilidad</span></Link></td>
                            </tr>
                        </tbody>
                        :
                        <tbody>
                            <tr>
                                <td><img alt="None" src={HomeIcon} style={{width:40, height:40, marginLeft: 30, marginTop:20}}></img></td>
                            </tr>
                            <tr>
                                <td><img alt="None" src={EmpleadoIcon} style={{width:40, height:40, marginLeft: 30, marginTop:20}}></img></td>
                            </tr>
                            <tr>
                                <td><img alt="None" src={NominaIcon} style={{width:40, height:40, marginLeft: 30, marginTop:20}}></img></td>
                            </tr>
                            <tr>
                                <td><img alt="None" src={ContabilidadIcon} style={{width:40, height:40, marginLeft: 30, marginTop:20}}></img></td>
                            </tr>
                        </tbody>
                    }
                </table>
            </div>
        </div>
    )
}

export default SideMenu