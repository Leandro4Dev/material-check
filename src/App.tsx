import '../styles/globals.css';

import { useEffect, useRef, useState } from "react";
import { NotFoundException, type DecodeContinuouslyCallback } from "@zxing/library";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ScanLine } from "lucide-react";
import { Label } from "./components/ui/label";
import { Scanner } from "./Scanner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './components/ui/alert-dialog';
import { supabase } from './supabase';


type Tool = {code :string, name: string}

type Product = {
  id: number
  code: string
  sap: string
  description: string
  tool_code: string
  tool_name: string
}



export function App() {
  const closeBtn = useRef<HTMLButtonElement | null>(null);
  const [supplierCode, setSupplierCode] = useState<string>();
  const [lot, setLot] = useState<string>();
  const [matricula, setMatricula] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product>()
  const [selectedTool, setSelectedTool] = useState<Tool | undefined>()

  const [products, setProducts] = useState<Product[]>([])
  const [tools, setTools] = useState<Tool[]>([])

  useEffect(() => {
    (async () => {

      const {data, error} = await supabase.from("products")
        .select<any, Product>('*')

      if(error) {
        console.error(error.message)
        return
      }

      setTools(data.map(item => ({ code: item.tool_code, name: item.tool_name})))
      setProducts(data)

    })()
  }, [])


  function formatLot(codigo: string) {
    if(codigo.length == 0) return ''
    const str = String(codigo);
    const parte1 = str.slice(0, 7);
    const parte2 = str.slice(7, 15);
    const parte3 = str.slice(15);
    return `${parte1}.${parte2}.${parte3}`;
  }


  const onReadDataMatrix: DecodeContinuouslyCallback = (result, err) => {

    if (err && !(err instanceof NotFoundException)) {closeBtn.current?.click(); return}
    if (err) return
    if (result.getBarcodeFormat() != 5) {closeBtn.current?.click(); return}

    const code = result.getText().substring(14).slice(0, 9)
    const lot = result.getText().substring(26).slice(0,18)
    setSupplierCode(code);
    setLot(formatLot(lot))

    setSelectedProduct(products.find(item => item.code == code))
    closeBtn.current?.click()
  }

  const onReadQrCode: DecodeContinuouslyCallback = (result, err) => {

    if (err && !(err instanceof NotFoundException)) {closeBtn.current?.click(); return}
    if (err) return
    if (result.getBarcodeFormat() != 11) {closeBtn.current?.click(); return}

    const code = result.getText() as keyof typeof tools
    console.log(code)
    console.log(result.getBarcodeFormat())

    setSelectedTool(tools.find(item => item.code == code))
    closeBtn.current?.click()
  }

  const openErrorAlert = useRef<HTMLButtonElement | null>(null);
  const openSuccessAlert = useRef<HTMLButtonElement | null>(null);
  const [error, setError] = useState('')
  async function handleSave(){

    if(!selectedTool || !selectedProduct || matricula == '' || lot == ''){
      setError('Preencha todos os campos e tente novamente.')
      openErrorAlert.current?.click()
      return
    }

    if(selectedProduct.tool_name != selectedTool.name){
      setError('Esta ferramenta não pode produzir com esse material, acione a liderança!!')
      openErrorAlert.current?.click()
      return
    }


    const {data, error} = await supabase.from('registries')
      .insert([{
        created_at: new Date().toISOString(),
        sap: selectedProduct.sap,
        operator: matricula,
        lot
      }])
      .select()
      .single()

    if(error){
      setError('Falha ao salvar o registro!')
      if(error.details.includes('already exists')){
        setError('Este material já foi cadastrado.')
      }
      // console.log(error)
      openErrorAlert.current?.click()
      return
    }

    console.log(data, selectedTool, selectedProduct)
    openSuccessAlert.current?.click()

    setSupplierCode('')
    setLot('')
    setMatricula('')
    setSelectedProduct(undefined)
    setSelectedTool(undefined)

  }

  useEffect(() => {
    console.log(supplierCode)
    setSelectedProduct(products.find(item => item.code == supplierCode))
  }, [supplierCode])

  return (
    <div className="max-w-xl mx-auto p-4 bg-white">
      <h2 className="text-3xl font-semibold mb-6">Registro de Matéria Prima</h2>

      <Label className="ml-1 text-lg" >Código do fornecedor</Label>
      <div  className="flex gap-2">
        <Input type="text" className="p-6" value={supplierCode} onChange={e => setSupplierCode(e.target.value)} />
        <Scanner closeBtn={closeBtn} onRead={onReadDataMatrix} >
          <Button className="w-16 p-6"> <ScanLine /></Button>
        </Scanner>
      </div>

      <div className="my-4 flex flex-col gap-2">
        <Label className="ml-1 text-lg" >Lote do Produto</Label>
        <Input type="text" className="p-6" value={lot} onChange={e => setLot(e.target.value)} />
      </div>

      <Label className="ml-1 mt-2 text-lg" >Ferramenta</Label>
      <div  className="flex gap-2">
        <Input type="text" className="p-6" value={selectedTool?.name} disabled />
        <Scanner closeBtn={closeBtn} onRead={onReadQrCode} >
          <Button className="w-16 p-6"> <ScanLine /></Button>
        </Scanner>
      </div>

      <div className="mt-4 p-2 text-zinc-700">
        <p className='mb-4 text-lg' >
          Descrição do Produto: <br />
          <span className="font-medium text-4xl" >{selectedProduct?.description}</span>
        </p>
        <p className='mb-4 text-lg' >
          Código SAP: <br />
          <span className="font-medium text-4xl" >{selectedProduct?.sap}</span>
        </p>
        <p className='mb-4 text-lg' >
          Merramenta de Moldagem: <br />
          <span className="font-medium text-4xl" >{selectedTool?.name}</span>
        </p>
      </div>


      <div className="my-4 flex flex-col gap-2">
        <Label className="ml-1 text-lg" >Maticula</Label>
        <div className="flex gap-2" >
          <Input type="number" className="p-6" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
          <AlertDialog>
            <AlertDialogTrigger asChild >
              <Button className="w-1/2 p-6" >Save</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Atenção!</AlertDialogTitle>
                <AlertDialogDescription className='text-lg'>
                  Realmente deseja salvar o registro?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className='flex flex-row' >
                <AlertDialogCancel className='flex-1'>Não</AlertDialogCancel>
                <AlertDialogAction className='flex-1' onClick={() => handleSave()}>Sim</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger ref={openErrorAlert} ></AlertDialogTrigger>
        <AlertDialogContent className='border border-red-500' >
          <AlertDialogHeader>
            <AlertDialogTitle className='text-red-500' >Algo está errado... ☹</AlertDialogTitle>
            <AlertDialogDescription className='text-lg text-red-500' >{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tentar Novamente</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger ref={openSuccessAlert} ></AlertDialogTrigger>
        <AlertDialogContent >
          <AlertDialogHeader>
            <AlertDialogTitle>Concluído! </AlertDialogTitle>
            <AlertDialogDescription>Salvo com sucesso!</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ok</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
