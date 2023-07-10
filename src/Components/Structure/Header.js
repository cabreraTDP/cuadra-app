import React, { useEffect } from 'react';
import '../../CSS/Header.css';
import Logo from '../../svg/Twhite.svg';
import { Link } from "react-router-dom";
import { useEmpresaContext } from "../../state/context/empresaContext";
import store from '../../state/store';
import { setEmpresaId } from '../../state/actions/auth_actions';

const Header = () => {
    const { empresa, setEmpresa } = useEmpresaContext();
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];

    useEffect(() => {
        const storedEmpresa = localStorage.getItem("selectedEmpresa");
        if (storedEmpresa) {
            setEmpresa(storedEmpresa);
        }
    }, [setEmpresa]);

    const onChangeOperacion = async (e) => {
        const { value } = e.target;
        setEmpresa(value);
        await store.dispatch(setEmpresaId(value));
        localStorage.setItem("selectedEmpresa", value);
        window.location.href = window.location.href;
    }

    return (
        <div className="header">
            <img
                alt="None"
                style={{ width: 200, marginTop: 30, marginLeft: 50 }}
                src={Logo}
            />
            <select value={empresa} onChange={(e) => onChangeOperacion(e)} name="empresa" required>
                {empresas.map((emp) => (
                    <option key={emp.empresa._id} value={emp.empresa._id}>
                        {emp.empresa.empresa}
                    </option>
                ))}
            </select>
            <Link to="/">
                <button
                    style={{
                        width: '200px',
                        height: '50px',
                        marginTop: 30,
                        marginLeft: '65%',
                        position: 'absolute',
                        backgroundColor: '#B595E6',
                        color: 'white',
                        border: 'black solid 0px',
                        borderRadius: 20,
                        fontSize: 22,
                        fontWeight: 'bold'
                    }}
                >
                    Cerrar sesión
                </button>
            </Link>
        </div>
    );
}

export default Header;

