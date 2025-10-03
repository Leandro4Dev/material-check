import { useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import '../styles/globals.css';
import { Button } from "./components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { ScanLine } from "lucide-react";


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
  const closeBtn = useRef<HTMLButtonElement | null>(null);
  const [code, setCode] = useState<string>("");
  const [codeF, setCodeF] = useState<string>("");
  const [lot, setLot] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    product: string;
    sap: string;
  }>()

  const [cameraIsActive, setCameraIsActive] = useState(false)

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
            stopCamera()
            closeBtn.current?.click()
          } else if (err && !(err instanceof NotFoundException)) {
            console.error(err);
            stopCamera()
          }
        }
      );
      setCameraIsActive(true)
    } catch (err) {
      console.error(err);
      setError("Erro ao acessar a câmera");
    }
  };

  function stopCamera(){
    if(codeReader){
      codeReader.reset()
      setCameraIsActive(false)
    }
  }

  function clean(){
    setCode('')
    setSelected(undefined)
  }


  return (
    <div className="max-w-xl mx-auto p-4 bg-white">
      <h2 className="text-xl font-semibold mb-3">Material Check</h2>

      <div  className="flex gap-2">
        <Input type="text" className="p-6" value={codeF} onChange={e => setCodeF(e.target.value)} />
        <Dialog>
          <DialogTrigger asChild >
            <Button className="w-16 p-6" onClick={() => startCamera()}> <ScanLine /></Button>
          </DialogTrigger>
          <DialogContent className="md:min-w-[700px] md:min-h-[400px] max-sm:h-[100dvh] max-sm:w-screen flex flex-col">
            <DialogHeader>
              <DialogTitle>Code Scanner</DialogTitle>
            </DialogHeader>
            <div className="flex w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover bg-black" playsInline />
              <div className="absolute w-40 h-40 border-2 border-red-500 inset-0 m-auto" >

              </div>
            </div>
            <DialogClose asChild>
              <Button ref={closeBtn} className="my-2 p-6 w-full" onClick={() => stopCamera()} variant="destructive" >Cancelar</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
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
