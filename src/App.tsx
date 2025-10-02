import { useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import '../styles/globals.css';
import { Button } from "./components/ui/button";


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
let codeReader: BrowserMultiFormatReader
export function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [code, setCode] = useState<string>("");
  const [codeF, setCodeF] = useState<string>("");
  const [lot, setLot] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    product: string;
    sap: string;
  }>()

  function formatLot(codigo: string) {
    if(code.length == 0) return ''
    const str = String(codigo);
    const parte1 = str.slice(0, 7);
    const parte2 = str.slice(7, 15);
    const parte3 = str.slice(15);
    return `${parte1}.${parte2}.${parte3}`;
  }


  async function startCamera() {
    clean()
    codeReader = new BrowserMultiFormatReader();
    try {
      const videoInputDevices = await codeReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        setError("Nenhuma câmera encontrada");
        return;
      }

      await codeReader.decodeFromVideoDevice(
        (videoInputDevices[videoInputDevices.length - 1] as any).deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const code = result.getText().substring(14).slice(0, 9) as keyof typeof db
            const lot = result.getText().substring(26).slice(0,18)
            setCode(result.getText());
            setCodeF(code);
            setLot(lot)
            console.log(lot)
            if(code in db){
              setSelected(db[code])
            }
            reset()
          } else if (err && !(err instanceof NotFoundException)) {
            console.error(err);
            reset()
          }
        }
      );
    } catch (err) {
      console.error(err);
      setError("Erro ao acessar a câmera");
    }
  };

  function reset(){
    if(codeReader){
      codeReader.reset()
    }
  }

  function clean(){
    setCode('')
    setSelected(undefined)
  }


  return (
    <div className="max-w-xl mx-auto p-4 bg-white">
      <h2 className="text-xl font-semibold mb-3">Material Check</h2>

      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-64 object-cover bg-black" playsInline />
      </div>

      <div  className="flex gap-2">
        <Button className="my-2 p-6 w-full" onClick={() => startCamera()} >Iniciar</Button>
        <Button className="my-2 p-6 w-full" onClick={() => reset()} variant="destructive" >Parar</Button>
      </div>

      <div className="mt-4 font-medium p-2 text-xl text-zinc-700">
        <p>Descrição do Produto: <span className="font-normal" >{selected?.product}</span></p>
        <p>Código SAP: <span className="font-normal" >{selected?.sap}</span></p>
        <p>Código Fornecedor: <span className="font-normal" >{codeF}</span></p>
        <p>Lote: <span className="font-normal" >{formatLot(lot)}</span></p>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-gray-700">Código</label>
        <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[56px]">
          {error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : code ? (
            <pre className="whitespace-pre-wrap break-words text-sm">{code}</pre>
          ) : (
            <p className="text-sm text-gray-500">Nenhum Data Matrix detectado</p>
          )}
        </div>
      </div>

    </div>
  );
}
