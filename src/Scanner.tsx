import { useRef, type ReactNode, type RefObject } from "react";
import { Button } from "./components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { BrowserMultiFormatReader, Exception, Result, type DecodeContinuouslyCallback } from "@zxing/library";

type ScannerProps = {
  children: ReactNode
  onRead: DecodeContinuouslyCallback
  closeBtn: RefObject<HTMLButtonElement | null>
}


let codeReader: BrowserMultiFormatReader
export function Scanner({children, onRead, closeBtn}: ScannerProps ){
  const videoRef = useRef<HTMLVideoElement | null>(null);

  function stopCamera(){
    if(codeReader){
      codeReader.reset()
    }
  }

  async function startCamera() {
      codeReader = new BrowserMultiFormatReader();
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          return;
        }
        await codeReader.decodeFromVideoDevice(
          (videoInputDevices[videoInputDevices.length - 1] as any).deviceId,
          videoRef.current!,
          onRead
        );
      } catch (err) {
        console.error(err);
      }
    };

  return (
    <Dialog onOpenChange={open => {
      if(!open) stopCamera()
    }}>
      <DialogTrigger asChild onClick={() => startCamera()} >
        {children}
      </DialogTrigger>
      <DialogContent className="w-[700px] h-[80vh] max-sm:h-[100dvh] max-sm:w-screen flex flex-col">
        <DialogHeader>
          <DialogTitle>Scanner</DialogTitle>
        </DialogHeader>
        <div className="flex w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover bg-black" playsInline />
          <div className="absolute w-40 h-40 border-2 border-red-500 inset-0 m-auto" ></div>
        </div>
        <DialogClose asChild>
          <Button ref={closeBtn} className="my-2 p-6 w-full" variant="destructive" >Cancelar</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
