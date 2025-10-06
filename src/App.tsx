import '../styles/globals.css';

import { useEffect, useRef, useState } from "react";
import { NotFoundException, type DecodeContinuouslyCallback } from "@zxing/library";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ScanLine } from "lucide-react";
import { Label } from "./components/ui/label";
import { Scanner } from "./Scanner";


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
  '001':{
    name: 'Mold. Carpete 598'
  }
}



export function App() {
  const closeBtn = useRef<HTMLButtonElement | null>(null);
  const [supplierCode, setSupplierCode] = useState<string>("");
  const [lot, setLot] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<{
    product: string;
    sap: string;
  }>()
  const [selectedMold, setSelectedMold] = useState<{
    name: string;
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
    if(code in molds){
      setSelectedMold(molds[code])
    }
    closeBtn.current?.click()
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white">
      <h2 className="text-4xl font-semibold mb-4">Material Check</h2>

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


      <div className="my-4 flex flex-col gap-2">
        <Label className="ml-1 text-lg" >Maticula</Label>
        <div className="flex gap-2" >
          <Input type="number" className="p-6" />
          <Button className="w-1/2 p-6" >Save</Button>
        </div>
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

    </div>
  );
}
