import { useEffect } from "react";
import * as XLSX from 'xlsx';
import { supabase } from "./supabase";
import type { Product, Registry } from "./App";



export function Report(){

  useEffect(() => { exportData() }, [])
  async function exportData(){
    const $products = supabase.from('products').select<any, Product>('*')
      .then(({data, error}) => {
        if(error) throw new Error(error.message)
        return data
      })
      .then(data => data.map(item => ({
        'id': item.id,
        'Código': item.code,
        'Sap': item.sap,
        'Descrição': item.description,
        'Código da Ferramenta': item.tool_code,
        'Nome da Ferramenta': item.tool_name,
      })))

    const $registries = supabase.from('registries').select<any, Registry>('*')
      .then(({data, error}) => {
        if(error) throw new Error(error.message)
        return data
      })
      .then(data => data.map(item => ({
        'Data': new Date(item.created_at).toLocaleDateString(),
        'Código SAP': item.sap,
        'Código do Fornecedor': item.supplier_code,
        'Lote': item.lot,
        'Matricula do Operador': item.operator
      })))

    const [products, registries] = await Promise.all([$products, $registries])

    const workbook = XLSX.utils.book_new();

    const registries_ws = XLSX.utils.json_to_sheet(registries);
    XLSX.utils.book_append_sheet(workbook, registries_ws, 'Registros');

    const products_ws = XLSX.utils.json_to_sheet(products);
    XLSX.utils.book_append_sheet(workbook, products_ws, 'Produtos');

    const date = new Date().toLocaleDateString().replaceAll('/', '-')
    const fileName = `Registro de MP UTE-5 (${date}).xlsx`
    XLSX.writeFile(workbook, fileName);
  }

  return <></>
}
