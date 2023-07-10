import React, { useState, useContext, createContext } from "react";

export const EmpresaContext = createContext();

export const EmpresaContextProvider = ({ empresas, children }) => {
    const [empresa, setEmpresa] = useState();

    return (
        <EmpresaContext.Provider value={{ empresa, setEmpresa }}>
            {children}
        </EmpresaContext.Provider>
    );
};

export const useEmpresaContext = () => {
    const context = useContext(EmpresaContext);
    if (!context)
        throw new Error("useEmpresaContext must be used within a EmpresaContextProvider");
    return context;
};

