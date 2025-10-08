import '../styles/globals.css';

import { useEffect, useRef, useState } from "react";
import { NotFoundException, type DecodeContinuouslyCallback } from "@zxing/library";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ScanLine } from "lucide-react";
import { Label } from "./components/ui/label";
import { Scanner } from "./Scanner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './components/ui/alert-dialog';


const db = {
  '821464003': {
    product: 'Carpete 598',
    sap: '311010016.00'
  },
  '741102005': {
    product: 'Carpete 226',
    sap: '601020011.00'
  }
}

const molds = {
  '1':{
    name: 'Mold. Carpete 598',
    acceptCodes: ['311010016.00']
  },
  '2':{
    name: 'Mold. Carpete 598',
    acceptCodes: ['601020011.00']
  }
}



export function App() {
  const closeBtn = useRef<HTMLButtonElement | null>(null);
  const [supplierCode, setSupplierCode] = useState<string>("");
  const [lot, setLot] = useState<string>("");
  const [matricula, setMatricula] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<{
    product: string;
    sap: string;
  }>()
  const [selectedMold, setSelectedMold] = useState<{
    name: string;
    acceptCodes: string[]
  }>()


  useEffect(() => {
    if(supplierCode in db){
      setSelectedProduct(db[supplierCode as keyof typeof db])
    }
  }, [supplierCode])


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

    const code = result.getText().substring(14).slice(0, 9) as keyof typeof db
    const lot = result.getText().substring(26).slice(0,18)
    setSupplierCode(code);
    setLot(formatLot(lot))

    if(code in db){
      setSelectedProduct(db[code])
    }
    closeBtn.current?.click()
  }

  const onReadQrCode: DecodeContinuouslyCallback = (result, err) => {

    if (err && !(err instanceof NotFoundException)) {closeBtn.current?.click(); return}
    if (err) return
    if (result.getBarcodeFormat() != 11) {closeBtn.current?.click(); return}

    const code = result.getText() as keyof typeof molds
    console.log(code)
    console.log(result.getBarcodeFormat())
    if(code in molds){
      setSelectedMold(molds[code])
    }
    closeBtn.current?.click()
  }

  const openErrorAlert = useRef<HTMLButtonElement | null>(null);
  const openSuccessAlert = useRef<HTMLButtonElement | null>(null);
  const [error, setError] = useState('')
  function handleSave(){

    if(!selectedMold || !selectedProduct || matricula == ''){
      setError('Preencha todos os campos e tente novamente.')
      openErrorAlert.current?.click()
      return
    }

    if(!selectedMold.acceptCodes.includes(selectedProduct.sap)){
      setError('Esta ferramenta não pode produzir com esse material, acione a liderança!!')
      openErrorAlert.current?.click()
      return
    }

    console.log(selectedMold, selectedProduct)
    setSupplierCode('')
    setLot('')
    setMatricula('')
    setSelectedProduct(undefined)
    setSelectedMold(undefined)
    openSuccessAlert.current?.click()

  }

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
        <Input type="text" className="p-6" value={selectedMold?.name} disabled />
        <Scanner closeBtn={closeBtn} onRead={onReadQrCode} >
          <Button className="w-16 p-6"> <ScanLine /></Button>
        </Scanner>
      </div>

      <div className="mt-4 p-2 text-zinc-700">
        <p className='mb-4 text-lg' >
          Descrição do Produto: <br />
          <span className="font-medium text-4xl" >{selectedProduct?.product}</span>
        </p>
        <p className='mb-4 text-lg' >
          Código SAP: <br />
          <span className="font-medium text-4xl" >{selectedProduct?.sap}</span>
        </p>
        <p className='mb-4 text-lg' >
          Merramenta de Moldagem: <br />
          <span className="font-medium text-4xl" >{selectedMold?.name}</span>
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
